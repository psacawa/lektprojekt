import logging
from functools import reduce
from operator import __or__, itemgetter

from django.contrib.auth.models import User
from django.core.exceptions import PermissionDenied
from django.db.models import Count, F, Prefetch, Q, Subquery
from django.db.models.aggregates import Sum
from django.db.models.expressions import RawSQL
from django.utils.datastructures import MultiValueDictKeyError
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from django_filters.rest_framework import DjangoFilterBackend, FilterSet
from drf_yasg import openapi
from drf_yasg.views import get_schema_view
from rest_framework import generics, permissions, viewsets
from rest_framework.exceptions import ParseError, ValidationError
from rest_framework.filters import OrderingFilter
from rest_framework.request import Request

from lekt.pagination import LargePageNumberPagination

from . import filters, serializers
from .models import (
    Annotation,
    Language,
    Lexeme,
    LexemeWeight,
    Phrase,
    PhrasePair,
    PhraseWord,
    Subscription,
    Voice,
    Word,
)

logger = logging.getLogger(__name__)


@method_decorator(cache_page(60 * 60), name="dispatch")
class LanguageViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API view set to for listing `Language` models and their associated `Voice` models.
    It's possible to possible to pass multiple `lid` parameter.
    """

    queryset = Language.objects.prefetch_related("voice_set")
    filterset_class = filters.LanguageFilterSet
    serializer_class = serializers.LanguageVoiceSerializer
    ordering = ["id"]
    pagination_class = LargePageNumberPagination


@method_decorator(cache_page(60 * 60), name="dispatch")
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


@method_decorator(cache_page(60 * 60), name="dispatch")
class AnnotationViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API view for querying `Annotation` models based on their associated `Language` and an
    initial `prompt`.

    """

    queryset = Annotation.objects.all()
    serializer_class = serializers.AnnotationSerializer
    filter_backends = [filters.AnnotationFilterBackend]
    ordering = ["id"]
    pagination_class = None


@method_decorator(cache_page(60 * 60), name="dispatch")
class WordCompletionView(generics.ListAPIView):
    """
    API view for querying `Word` models based on the associated `Language` and a initial
    `prompt` of the word. The models are returned with associated `Lexeme` and
    `Annotation` models.
    """

    queryset = Word.objects.prefetch_related("annotations", "lexeme")
    page_size = 25
    serializer_class = serializers.WordSerializer
    filterset_class = filters.WordFilterSet
    ordering = ["id"]


@method_decorator(cache_page(60 * 60), name="dispatch")
class PhraseCompletionView(generics.ListAPIView):
    """API View to list phrases containing a given substring."""

    queryset = Phrase.objects.all()
    serializer_class = serializers.PhraseSerializer
    filterset_class = filters.PhraseFilterSet
    ordering = ["id"]


@method_decorator(cache_page(60 * 60), name="dispatch")
class PhrasePairDetailView(generics.RetrieveAPIView):

    queryset = (
        PhrasePair.objects.filter(active=True)
        .select_related("base", "target")
        .prefetch_related(
            "target__words", "target__words__lexeme", "target__words__annotations"
        )
    )
    serializer_class = serializers.PhrasePairDetailSerializer


@method_decorator(cache_page(60 * 60), name="dispatch")
class PhrasePairListView(generics.ListAPIView):
    """
    This endpoint just shows `PhrasePair` models for a give `Language` pair such
    that the `target` language phrase contains a particular word.

    E.g. `/api/pairs/?base=en&target=es&lexeme=2985&annot=65`
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
        elif "annot" in self.request.query_params:
            annot = self.request.query_params["annot"]
            queryset = queryset.prefetch_related(
                Prefetch(
                    "target__phraseword_set",
                    queryset=PhraseWord.objects.filter(word__annotations=annot),
                    to_attr="annot_matches",
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


@method_decorator(cache_page(60 * 60), name="dispatch")
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


@method_decorator(cache_page(60 * 60), name="dispatch")
class PhrasePairAnnotationSearchView(ValidateFilterListMixin, generics.ListAPIView):
    """
    View for relevance search of PhrasePair objects where only related `Annotation`
    objects can be searched on.
    """

    serializer_class = serializers.PhrasePairSerializer
    query_params_filterset = filters.PhrasePairAnnotationSearchFilterSet

    def get_serializer_context(self):
        return {"expand_matches": ["annot"]}

    def get_queryset(self):
        params = self.get_query_params()
        base_lang, target_lang, annots = itemgetter("base", "target", "annots")(params)
        for param in [base_lang, target_lang, annots]:
            if param is None:
                raise ParseError(detail="Parameter required")
        queryset = (
            PhrasePair.objects.filter(
                annot_weights__base_lang=base_lang,
                annot_weights__target_lang=target_lang,
                annot_weights__annotation__in=annots,
            )
            .annotate(score=Sum("annot_weights__weight"))
            .order_by("-score")
            .select_related("base", "target")
            .prefetch_related(
                Prefetch(
                    "target__phraseword_set",
                    queryset=PhraseWord.objects.filter(
                        word__annotations__in=annots
                    ).annotate(annotation=F("word__annotations")),
                    to_attr="annot_matches",
                )
            )
        )
        return queryset


@method_decorator(cache_page(60 * 60), name="dispatch")
class PhrasePairFeatureSearchView(ValidateFilterListMixin, generics.ListAPIView):
    """
    View for relevance search of PhrasePair objects where `Lexeme` and `Annotation`
    objects can be searched on.
    """

    serializer_class = serializers.PhrasePairSerializer
    query_params_filterset = filters.PhrasePairFeatureSearchFilterSet

    def get_serializer_context(self):
        return {"expand_matches": ["lexeme", "annot"]}

    def get_queryset(self):
        params = self.get_query_params()
        base_lang, target_lang, lexemes, annots = itemgetter(
            "base", "target", "lexemes", "annots"
        )(params)
        if lexemes is None:
            lexemes = []
        if annots is None:
            annots = []
        features = []
        features += list(
            Lexeme.objects.filter(id__in=lexemes).values_list("feature_id")
        )
        features += list(
            Annotation.objects.filter(id__in=annots).values_list("feature_id")
        )
        if len(features) == 0:
            raise ParseError("At least one search term is needed.")
        queryset = (
            PhrasePair.objects.filter(
                feature_weights__base_lang=base_lang,
                feature_weights__target_lang=target_lang,
                feature_weights__feature__in=features,
            )
            .annotate(score=Sum("feature_weights__weight"))
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
                    word__annotations__in=annots
                ).annotate(annotation=F("word__annotations")),
                to_attr="annot_matches",
            )
        )
        return queryset


class UserProfileView(generics.RetrieveAPIView):
    """ API view for retrieving a logged in user's list of `Subscription`s."""

    serializer_class = serializers.UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        user = self.request.user
        logger.debug(f"{self.__class__.__name__}: User {user.username} seeks profile")
        return user.userprofile


class SubscriptionViewSet(viewsets.ModelViewSet):
    """
    API view set for performing create, read, update, delete and list operations on the
    `Subscription` models attachsed to the `UserProfile` of the currently logged in
    `User`.
    """

    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [OrderingFilter]
    ordering = ["id"]

    def create(self, request: Request, *args, **kwargs):
        logger.debug(f"{self.__class__.__name__}: In create")
        user = request.user
        logger.debug(
            f"{self.__class__.__name__} in create; set owner  to {user.username} "
        )
        request.data["owner"] = user.userprofile_id

        base_lang = request.data["base_lang"]
        target_lang = request.data["target_lang"]
        base_voice = Language.objects.get(pk=base_lang).default_voice_id
        target_voice = Language.objects.get(pk=target_lang).default_voice_id
        request.data["base_voice"] = base_voice
        request.data["target_voice"] = target_voice
        logger.debug(f"{self.__class__.__name__}: request data={request.data}")
        serializer = self.get_serializer(data=request.data)
        return super().create(request, *args, **kwargs)

    def get_serializer_class(self):
        # WARNING: this failed under generateschema
        if self.action in ["list", "retrieve"]:
            return serializers.SubscriptionGetSerializer
        else:
            return serializers.SubscriptionPostSerializer

    def get_queryset(self):
        user = self.request.user
        return user.userprofile.subscription_set.select_related(
            "base_lang", "target_lang", "base_voice", "target_voice"
        )


docs_schema_view = get_schema_view(
    openapi.Info(
        title="Lekt API",
        default_version="v1",
    ),
    public=True,
    permission_classes=[permissions.AllowAny],
)
