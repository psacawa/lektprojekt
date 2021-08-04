import logging
from datetime import datetime
from functools import reduce
from operator import __or__, itemgetter

from django.core.exceptions import PermissionDenied
from django.db.models import Count, F, Func, Prefetch, Q, Subquery
from django.db.models.aggregates import Sum
from django.db.models.expressions import RawSQL, Value
from django.db.models.fields import FloatField
from django.shortcuts import get_object_or_404
from django.utils.datastructures import MultiValueDictKeyError
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from django_filters.rest_framework import DjangoFilterBackend, FilterSet
from drf_yasg import openapi
from drf_yasg.views import get_schema_view
from rest_framework import generics, mixins, permissions, status, viewsets
from rest_framework.decorators import action, api_view
from rest_framework.exceptions import ParseError, ValidationError
from rest_framework.filters import OrderingFilter
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.serializers import Serializer

from main.decorators import generate_lazy_user
from main.models import User

from . import filters, serializers
from .models import (
    Feature,
    Language,
    LanguageCourse,
    Lexeme,
    LexemeWeight,
    Observable,
    Phrase,
    PhrasePair,
    PhraseWord,
    TrackedList,
    TrackedObservable,
    Voice,
    Word,
)
from .pagination import LargePageNumberPagination
from .permissions import IsCourseOwner, IsTrackedListOwner, IsTrackedObservableOwner

MIN = 60
HOUR = 60 * MIN
FIVE_MIN = 5 * MIN

logger = logging.getLogger(__name__)


@method_decorator(cache_page(HOUR), name="dispatch")
class LanguageViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API view set to for listing `Language` models and their associated `Voice` models.
    It's possible to possible to pass multiple `lid` parameter.
    """

    queryset = (
        Language.objects.filter(active=True)
        .prefetch_related("voice_set")
        .order_by("name")
    )
    filterset_class = filters.LanguageFilterSet
    serializer_class = serializers.LanguageVoiceSerializer
    ordering = ["id"]
    pagination_class = LargePageNumberPagination


@method_decorator(cache_page(FIVE_MIN), name="dispatch")
class SupportedLanguagePairsView(generics.ListAPIView):
    """
    List of supported pairs of languages for the purpose of onboarding. Basically a
    stripped down view of Corpora.
    """

    pagination_class = None
    queryset = PhrasePair.objects.values("base__lang", "target__lang").annotate(
        count=Count("id")
    )
    serializer_class = serializers.LanguagePairSerializer


@method_decorator(cache_page(HOUR), name="dispatch")
class LexemeViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API view for querying `Lexeme` models based on their associated `Language` and an
    initial `prompt` of the `lemma` of the `Lexeme`.

    """

    queryset = Lexeme.objects.all()
    serializer_class = serializers.LexemeSerializer
    filter_backends = [filters.LexemeFilterBackend]
    ordering = ["id"]
    pagination_class = LargePageNumberPagination


@method_decorator(cache_page(HOUR), name="dispatch")
class FeatureViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API view for querying `Feature` models based on their associated `Language` and an
    initial `prompt`.

    """

    queryset = Feature.objects.all()
    serializer_class = serializers.FeatureSerializer
    filter_backends = [filters.FeatureFilterBackend]
    ordering = ["id"]
    pagination_class = None


@method_decorator(cache_page(HOUR), name="dispatch")
class WordCompletionView(generics.ListAPIView):
    """
    API view for querying `Word` models based on the associated `Language` and a initial
    `prompt` of the word. The models are returned with associated `Lexeme` and
    `Feature` models.
    """

    queryset = Word.objects.prefetch_related("features", "lexeme")
    serializer_class = serializers.WordSerializer
    filterset_class = filters.WordFilterSet
    ordering = ["id"]


@method_decorator(cache_page(HOUR), name="dispatch")
class PhraseCompletionView(generics.ListAPIView):
    """API View to list phrases containing a given substring."""

    queryset = Phrase.objects.all()
    serializer_class = serializers.PhraseSerializer
    filterset_class = filters.PhraseFilterSet
    ordering = ["id"]


@method_decorator(cache_page(HOUR), name="dispatch")
class PhrasePairDetailView(generics.RetrieveAPIView):

    queryset = (
        PhrasePair.objects.filter(active=True)
        .select_related("base", "target")
        .prefetch_related(
            "target__words", "target__words__lexeme", "target__words__features"
        )
    )
    serializer_class = serializers.PhrasePairDetailSerializer


@method_decorator(cache_page(HOUR), name="dispatch")
class PhrasePairListView(generics.ListAPIView):
    """
    This endpoint just shows `PhrasePair` models for a give `Language` pair such
    that the `target` language phrase contains a particular word.

    E.g. `/api/pairs/?base=en&target=es&lexeme=2985&feature=65`
    """

    filterset_class = filters.PhrasePairFilterSet
    ordering = ["id"]
    serializer_class = serializers.PhrasePairSerializer

    def get_queryset(self):
        queryset = (
            PhrasePair.objects.filter(active=True)
            .select_related("base", "target")
            .order_by("id")
        )
        if "lexeme" in self.request.query_params:
            lexeme = self.request.query_params["lexeme"]
            queryset = queryset.prefetch_related(
                Prefetch(
                    "target__phraseword_set",
                    queryset=PhraseWord.objects.filter(word__lexeme=lexeme).annotate(
                        lexeme=F("word__lexeme")
                    ),
                    to_attr="lexeme_matches",
                )
            )
        elif "feature" in self.request.query_params:
            feature = self.request.query_params["feature"]
            queryset = queryset.prefetch_related(
                Prefetch(
                    "target__phraseword_set",
                    queryset=PhraseWord.objects.filter(word__features=feature),
                    to_attr="feature_matches",
                )
            )
        return queryset


class ValidateFilterListMixin:
    """
    Mixing that is identical to ListModelMixin but doesn't run filter_queryset on the
    result of get_queryset. It should be manually applied, for example inside get_queryset
    on a prequeryset attribute.
    This allows the application of filtering to controlled somewhat.
    """

    query_params_filterset = None

    def get_filterset_kwargs(self):
        return {
            "data": self.request.query_params,
            "request": self.request,
        }

    def get_query_params(self):
        assert (
            self.query_params_filterset is not None
        ), "to use ValidateFilterListMixin, define query_params_filterset"
        kwargs = self.get_filterset_kwargs()
        filterset = self.query_params_filterset(**kwargs)
        return filterset.get_query_params()

    def list(self, request, *args, **kwargs):
        #  only difference: no filter_queryset
        queryset = self.get_queryset()

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


@method_decorator(cache_page(HOUR), name="dispatch")
class PhrasePairLexemeSearchView(ValidateFilterListMixin, generics.ListAPIView):
    """
    View for relevance search of PhrasePair objects where only related `Lexeme` objects
    can be searched on.
    """

    serializer_class = serializers.PhrasePairSerializer
    query_params_filterset = filters.PhrasePairLexemeSearchFilterSet
    prequeryset = PhrasePair.objects.all()

    def get_serializer_context(self):
        return {"expand_matches": ["lexeme"]}

    def get_queryset(self):
        params = self.get_query_params()
        base_lang, target_lang, lexemes = itemgetter("base", "target", "lexemes")(
            params
        )
        queryset = (
            PhrasePair.objects.filter(
                lexeme_weights__base_lang=base_lang,
                lexeme_weights__target_lang=target_lang,
                lexeme_weights__lexeme__in=lexemes,
            )
            .annotate(score=Sum("lexeme_weights__weight"))
            .order_by("-score")
            .select_related("base", "target")
            .prefetch_related(
                Prefetch(
                    "target__phraseword_set",
                    queryset=PhraseWord.objects.filter(
                        word__lexeme__in=lexemes
                    ).annotate(lexeme=F("word__lexeme")),
                    to_attr="lexeme_matches",
                )
            )
        )
        return queryset


@method_decorator(cache_page(FIVE_MIN), name="dispatch")
class PhrasePairFeatureSearchView(ValidateFilterListMixin, generics.ListAPIView):
    """
    View for relevance search of PhrasePair objects where only related `Feature`
    objects can be searched on.
    """

    serializer_class = serializers.PhrasePairSerializer
    query_params_filterset = filters.PhrasePairFeatureSearchFilterSet

    def get_serializer_context(self):
        return {"expand_matches": ["feature"]}

    def get_queryset(self):
        params = self.get_query_params()
        base_lang, target_lang, features = itemgetter("base", "target", "features")(
            params
        )
        for param in [base_lang, target_lang, features]:
            if param is None:
                raise ParseError(detail="Parameter required")
        queryset = (
            PhrasePair.objects.filter(
                feature_weights__base_lang=base_lang,
                feature_weights__target_lang=target_lang,
                feature_weights__feature__in=features,
            )
            .annotate(score=Sum("feature_weights__weight"))
            .order_by("-score")
            .select_related("base", "target")
            .prefetch_related(
                Prefetch(
                    "target__phraseword_set",
                    queryset=PhraseWord.objects.filter(
                        word__features__in=features
                    ).annotate(feature=F("word__features")),
                    to_attr="feature_matches",
                )
            )
        )
        return queryset


@method_decorator(cache_page(FIVE_MIN), name="dispatch")
class PhrasePairObservableSearchView(ValidateFilterListMixin, generics.ListAPIView):
    """
    View for relevance search of PhrasePair objects where `Lexeme` and `Feature`
    objects can be searched on.
    """

    serializer_class = serializers.PhrasePairSerializer
    query_params_filterset = filters.PhrasePairObservableSearchFilterSet

    def get_serializer_context(self):
        return {"expand_matches": ["lexeme", "feature"]}

    def get_queryset(self):
        params = self.get_query_params()
        base_lang, target_lang, lexemes, features = itemgetter(
            "base", "target", "lexemes", "features"
        )(params)
        if lexemes is None:
            lexemes = []
        if features is None:
            features = []
        observables = []
        observables += list(Lexeme.objects.filter(id__in=lexemes).values_list("id"))
        observables += list(Feature.objects.filter(id__in=features).values_list("id"))
        if len(observables) == 0:
            raise ParseError("At least one search term is needed.")
        queryset = (
            PhrasePair.objects.filter(
                observable_weights__base_lang=base_lang,
                observable_weights__target_lang=target_lang,
                observable_weights__observable__in=observables,
            )
            .annotate(score=Sum("observable_weights__weight"))
            .order_by("-score")
            .select_related("base", "target")
        )
        queryset = queryset.prefetch_related(
            Prefetch(
                "target__phraseword_set",
                queryset=PhraseWord.objects.filter(word__lexeme__in=lexemes).annotate(
                    lexeme=F("word__lexeme")
                ),
                to_attr="lexeme_matches",
            )
        )
        queryset = queryset.prefetch_related(
            Prefetch(
                "target__phraseword_set",
                queryset=PhraseWord.objects.filter(
                    word__features__in=features
                ).annotate(feature=F("word__features")),
                to_attr="feature_matches",
            )
        )
        return queryset


@method_decorator(generate_lazy_user, name="dispatch")
class LanguageCourseViewSet(viewsets.ModelViewSet):
    """
    API view set for performing create, read, update, delete and list operations on the
    `LanguageCourse` models attachsed to the currently logged in `User`.
    """

    permission_classes = [permissions.IsAuthenticated, IsCourseOwner]
    filter_backends = [OrderingFilter]
    ordering = ["id"]

    def create(self, request: Request, *args, **kwargs):
        user = request.user
        request.data["owner"] = user.id

        #  assign default voices
        for s in ["base", "target"]:
            if request.data.get(f"{s}_voice") is None:
                lang_pk = request.data.get(f"{s}_lang")
                default_voice_pk = Language.objects.get(pk=lang_pk).default_voice_id
                request.data[f"{s}_voice"] = default_voice_pk

        return super().create(request, *args, **kwargs)

    def get_serializer_class(self):
        # WARNING: this failed under generateschema
        if self.action in ["list", "retrieve"]:
            return serializers.LanguageCoursePostSerializer
        else:
            return serializers.LanguageCoursePostSerializer

    def get_queryset(self):
        user = self.request.user
        logger.info(f"{user=}")
        return user.courses.select_related(
            "base_lang", "target_lang", "base_voice", "target_voice"
        ).prefetch_related(
            Prefetch(
                "lists",
            )
        )


class TrackedListViewSet(
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.ListModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    permission_classes = [IsTrackedListOwner]
    serializer_class = serializers.TrackedListSerializer

    def get_queryset(self):
        return TrackedList.objects.filter(
            course__owner__id=self.request.user.id
        ).annotate(count=Count("observables"))

    @action(detail=True, methods=["post"])
    def score(self, request: Request, pk=None):
        """
        Here is the API's entrypoint the spaced repetition system scheduling logic
        """
        serializer = serializers.ScoreResponseSerializer(data=request.data)
        if serializer.is_valid():
            phrase_pk = request.data["phrase"]
            grade = request.data["grade"]
            try:
                TrackedObservable.objects.filter(
                    tracked_list=pk,
                    observable__in=Observable.objects.filter(
                        Q(Lexeme___word__phrase=phrase_pk)
                        | Q(Feature___word__phrase=phrase_pk)
                    ),
                ).update(score=F("score") + 1)
            except Exception as exc:
                logger.error(f"{exc=}")
                raise ParseError()
            return Response(status=200)
        else:
            raise ValidationError(serializer.errors)


class Random(Func):
    function = "RANDOM"
    output_field = FloatField()


class TrainingPlanView(mixins.ListModelMixin, viewsets.GenericViewSet):
    #  TODO 05/03/20 psacawa: make resilient to errors
    permission_classes = [IsTrackedListOwner]
    serializer_class = serializers.PhrasePairSerializer

    def get_serializer_context(self):
        return {"expand_matches": ["lexeme", "feature"]}

    def get_queryset(self):
        list_pk = self.kwargs.get("list_pk")
        course: LanguageCourse = LanguageCourse.objects.get(lists__id=list_pk)
        observables = Observable.objects.filter(
            trackedobservable__tracked_list_id=list_pk
        )
        lexemes = observables.instance_of(Lexeme)
        features = observables.instance_of(Feature)

        if len(observables) == 0:
            raise ParseError("At least one search term is needed in the training list.")
        queryset = (
            PhrasePair.objects.filter(
                observable_weights__base_lang=course.base_lang,
                observable_weights__target_lang=course.target_lang,
                observable_weights__observable__in=observables,
            )
            #  We use Random() to implement some kind of basic randomization
            #  TODO 17/03/20 psacawa: make a real scalable SRS solution for this
            .annotate(score=Random() * Sum("observable_weights__weight"))
            .order_by("-score")
            .select_related("base", "target")
        )
        queryset = queryset.prefetch_related(
            Prefetch(
                "target__phraseword_set",
                queryset=PhraseWord.objects.filter(word__lexeme__in=lexemes).annotate(
                    lexeme=F("word__lexeme")
                ),
                to_attr="lexeme_matches",
            )
        )
        queryset = queryset.prefetch_related(
            Prefetch(
                "target__phraseword_set",
                queryset=PhraseWord.objects.filter(
                    word__features__in=features
                ).annotate(feature=F("word__features")),
                to_attr="feature_matches",
            )
        )
        return queryset


class TrackedObservableViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    permission_classes = [IsTrackedObservableOwner]

    def get_serializer_class(self):
        if self.action == "list":
            return serializers.TrackedObservableSerializer
        else:
            return serializers.TrackedObservablePostSerializer

    def get_queryset(self):
        list_pk = self.kwargs.get("list_pk")
        return TrackedObservable.objects.filter(tracked_list=list_pk)

    def get_object(self):
        list_pk = self.kwargs.get("list_pk")
        pk = self.kwargs.get("pk")
        queryset = TrackedObservable.objects.filter(
            tracked_list_id=list_pk, observable_id=pk
        )
        obj = get_object_or_404(queryset)
        self.check_object_permissions(self.request, obj)
        return obj


class TrackedLexemeViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    permission_classes = [IsTrackedObservableOwner]
    serializer_class = serializers.TrackedObservableSerializer

    def get_queryset(self):
        list_pk = self.kwargs.get("list_pk")
        return TrackedObservable.objects.filter(
            tracked_list=list_pk, observable__in=Observable.objects.instance_of(Lexeme)
        )


class TrackedFeatureViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    permission_classes = [IsTrackedObservableOwner]
    serializer_class = serializers.TrackedObservableSerializer

    def get_queryset(self):
        list_pk = self.kwargs.get("list_pk")
        return TrackedObservable.objects.filter(
            tracked_list=list_pk, observable__in=Observable.objects.instance_of(Feature)
        )


@method_decorator(cache_page(FIVE_MIN), name="dispatch")
class PairCountsView(generics.ListAPIView):
    """
    Some silly temporary view that reports on the counts of particular phrase pairs in
    particular language pairs for users' benefit
    """

    pagination_class = None
    serializer_class = serializers.PairCountsSerializer
    queryset = (
        PhrasePair.objects.filter(base__lang__active=True, target__lang__active=True)
        .values("base__lang__name", "target__lang__name")
        .annotate(count=Count("*"))
        .order_by("-count")
    )


docs_schema_view = get_schema_view(
    openapi.Info(
        title="Lekt API",
        default_version="v1",
    ),
    public=True,
    permission_classes=[permissions.AllowAny],
)
