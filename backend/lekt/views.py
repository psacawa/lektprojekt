import logging
from operator import __or__
from functools import reduce

from django.utils.datastructures import MultiValueDictKeyError
from django.core.exceptions import PermissionDenied
from django.contrib.auth.models import User
from django.db.models import Q, Count
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from rest_framework import generics, viewsets
from rest_framework.request import Request
from rest_framework import permissions
from rest_framework.exceptions import ParseError, ValidationError
from rest_framework import filters
from rest_framework.exceptions import ParseError, ValidationError
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

from . import serializers
from .models import (
    Annotation,
    Word,
    Phrase,
    TrackedItem,
    TrackedWord,
    TrackedAnnotation,
    Language,
    Lexeme,
    Voice,
    Subscription,
    PhrasePair,
)

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)


class LanguageListView(generics.ListAPIView):
    """View to represent (multiple) language and all it's voices."""

    #  queryset = Language.objects.all()
    #  filterset_fields = ['lid' ]
    serializer_class = serializers.LanguageVoiceSerializer
    ordering = ["id"]

    def get_queryset(self):
        query_params = self.request.query_params
        lids = query_params.get("lid", None)
        if not lids:
            logger.error(f"Bad request in {self.__class__.__name__}: No lids")
            raise ParseError
        lids = lids.split(",")
        return Language.objects.filter(lid__in=lids)


class UserProfileView(generics.RetrieveAPIView):
    """ View for retrieving a logged in user's subscriptions."""

    serializer_class = serializers.UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        user = self.request.user
        logger.debug(f"{self.__class__.__name__}: User {user.username} seeks profile")
        return user.userprofile


class SubscriptionViewSet(viewsets.ModelViewSet):
    """ Subscription model."""

    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.OrderingFilter]
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
        return user.userprofile.subscription_set.all()


class LexemeCompletionView(generics.ListAPIView):
    serializer_class = serializers.LexemeSerializer

    def get_queryset(self):
        query_params = self.request.query_params
        logger.debug(f"In {self.__class__.__name__} with params {query_params}")
        try:
            prompt: str = query_params["prompt"]
        except MultiValueDictKeyError as e:
            logger.error(f"Bad request in {self.__class__.__name__}")
            raise ParseError

        return_queryset = Lexeme.objects.filter(lemma__startswith=prompt)
        if "lid" in query_params:
            lid: str = query_params["lid"]
            logger.debug(f"'lid' query_param observed: {lid}")
            return_queryset = return_queryset.filter(lang__lid=lid)
        return return_queryset


class AnnotationCompletionView(generics.ListAPIView):
    serializer_class = serializers.AnnotationSerializer

    def get_queryset(self):
        query_params = self.request.query_params
        logger.debug(f"In {self.__class__.__name__} with params {query_params}")
        try:
            prompt: str = query_params["prompt"]
        except MultiValueDictKeyError as e:
            logger.error(f"Bad request in {self.__class__.__name__}")
            raise ParseError

        return_queryset = Annotation.objects.filter(value__startswith=prompt)
        if "lid" in query_params:
            lid: str = query_params["lid"]
            logger.debug(f"'lid' query_param observed: {lid}")
            return_queryset = return_queryset.filter(lang__lid=lid)
        return return_queryset


class WordCompletionView(generics.ListAPIView):
    """
    API view for querying words in some language on the basis of substring containment.
    """

    serializer_class = serializers.WordSerializer
    page_size = 25

    def get_queryset(self):
        query_params = self.request.query_params
        logger.debug(f"In {self.__class__.__name__} with params {query_params}")
        try:
            prompt: str = query_params["prompt"]
        except MultiValueDictKeyError as e:
            logger.error(f"Bad request in {self.__class__.__name__}")
            raise ParseError

        return_queryset = Word.objects.filter(norm__startswith=prompt).prefetch_related(
            "annotations"
        )
        if "lid" in query_params:
            lid: str = query_params["lid"]
            logger.debug(f"'lid' query_param observed: {lid}")
            return_queryset = return_queryset.filter(lang__lid=lid)
        return return_queryset


class PhraseCompletionView(generics.ListAPIView):
    """API View to list phrases"""

    serializer_class = serializers.PhraseSerializer
    # FIXME: this ordering doesn't accomplish anything
    ordering = ["id"]

    def get_queryset(self):
        query_params = self.request.query_params
        try:
            prompt: str = query_params["prompt"]
        except Exception as e:
            logger.error(f"Bad request in {self.__class__.__name__}")
            raise ParseError

        if "lid" in query_params:
            lid: str = query_params.get("lid")
            return_queryset = Phrase.objects.filter(
                text__contains=prompt, lexeme__lang__lid=lid
            )
        else:
            return_queryset = Phrase.objects.filter(text__contains=prompt)
        return return_queryset


class VoiceListView(generics.ListAPIView):
    """Lists voices associated with a single given language"""

    serializer_class = serializers.VoiceSerializer
    ordering = ["id"]

    def get_queryset(self):
        query_params = self.request.query_params
        logger.debug(f"In {self.__class__.__name__} with params {query_params}")
        try:
            lid: str = query_params["lid"]
        except MultiValueDictKeyError as e:
            logger.error(f"Bad request in {self.__class__.__name__}")
            raise ParseError
        return

        logger.debug(f"'lid' query_param observed: {lid}")
        return_queryset = Voice.objects.filter(lang__lid=lid)
        return return_queryset


class PhrasePairMixin(object):
    model = PhrasePair
    serializer_class = serializers.PhrasePairSerializer
    queryset = PhrasePair.objects.all()


class PhrasePairListView(generics.ListAPIView):
    """
    List phrase pairs from a language, to a language, containing target word.

    base: Understands lid
    target: Understands lid
    word: Understands text OR
    word_id: Understands id
    """

    serializer_class = serializers.PhrasePairSerializer
    ordering = ["id"]

    def get_queryset(self):
        query_params = self.request.query_params
        logger.debug(query_params)
        # extract params
        try:
            lang_base = query_params.get("base")
            lang_target = query_params.get("target")
            target_word = query_params.get("word")
            target_word_id = query_params.get("word_id")
            assert target_word != None or target_word_id != None
        except (MultiValueDictKeyError, AssertionError) as e:
            logger.error(f"Bad request in {self.__class__.__name__}")
            raise ParseError
        logger.debug(
            (
                f"{self.__class__.__name__} "
                f"params: {lang_base}, {lang_target}, {target_word} {target_word_id}"
            )
        )

        # run query
        base_query = (
            PhrasePair.objects.filter(active=True)
            .filter(base__lang__lid=lang_base)
            .filter(target__lang__lid=lang_target)
            .prefetch_related("target", "base")
        )
        if target_word_id != None:
            pairs = base_query.filter(target__words__id=target_word_id)
            logger.debug(f"Searching by pk: {pairs}")
        elif target_word != None:
            pairs = base_query.filter(target__words__norm=target_word)
            logger.debug(f"Searching by text: {pairs}")
        return pairs


class TrackedItemViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.TrackedItemPolySerializer
    permission_classes = [permissions.IsAuthenticated]
    ordering = ["id"]

    def get_object(self, **kwargs):
        pk = self.kwargs["pk"]
        return TrackedItem.objects.get(pk=pk)

    def get_queryset(self):
        query_params = self.request.query_params
        try:
            subscription_id = query_params.get("subscription_id")
            # assert that the subscription actually belongs to the current user!
        except KeyError as e:
            logger.error(f"Bad request in {self.__class__.__name__}")
            raise ParseError

        queryset = TrackedItem.objects.filter(subscription__id=subscription_id)
        return queryset


class TrackedAnnotationViewSet(viewsets.ModelViewSet):
    #  serializer_class = serializers.TrackedAnnotationSerializer
    permission_classes = [permissions.IsAuthenticated]
    ordering = ["id"]

    def get_object(self, **kwargs):
        pk = self.kwargs["pk"]
        return TrackedAnnotation.objects.get(pk=pk)

    def get_queryset(self):
        query_params = self.request.query_params
        try:
            subscription_id = query_params.get("subscription_id")
            # assert that the subscription actually belongs to the current user!
        except KeyError as e:
            logger.error(f"Bad request in {self.__class__.__name__}")
            raise ParseError

        queryset = TrackedAnnotation.objects.filter(subscription__id=subscription_id)
        return queryset

    def get_serializer_class(self):
        if self.action in ["list", "retrieve"]:
            return serializers.TrackedAnnotationGetSerializer
        else:
            return serializers.TrackedAnnotationPostSerializer


class TrackedWordViewSet(viewsets.ModelViewSet):
    #  serializer_class = serializers.TrackedWordSerializer
    #  permission_classes = [permissions.IsAuthenticated]
    ordering = ["id"]

    def get_object(self, **kwargs):
        # NOTE: when `queryset` is asssigned, this is unnecessary, when either
        # NOTE: get_queryset or get_object are overridden, the other must be too
        pk = self.kwargs["pk"]
        return TrackedWord.objects.get(pk=pk)

    def get_queryset(self):
        query_params = self.request.query_params
        try:
            subscription_id = query_params.get("subscription_id")
            # TODO: assert that the subscription actually belongs to the current user!
        except KeyError as e:
            logger.error(f"Bad request in {self.__class__.__name__}")
            raise ParseError

        queryset = TrackedWord.objects.filter(subscription__id=subscription_id)
        return queryset

    def get_serializer_class(self):
        if self.action in ["list", "retrieve"]:
            return serializers.TrackedWordGetSerializer
        else:
            return serializers.TrackedWordPostSerializer


@method_decorator(cache_page(60 * 60), name="dispatch")
class GimpedView(generics.ListAPIView):
    """
    This endpoint just shows phrase pairs for a give language pair such
    that the target language phrase contains a particular word.
    E.g. /api/suggestion?base=en&target=es&word=perro
    """

    serializer_class = serializers.PhrasePairSerializer

    def get_queryset(self):
        query_params = self.request.query_params
        try:
            base_lid = query_params["base"]
        except Exception as e:
            raise ValidationError(
                detail="View didn't receive required query param base"
            )

        try:
            target_lid = query_params["target"]
        except Exception as e:
            raise ValidationError(
                detail="View didn't receive required query param target"
            )

        queryset = PhrasePair.objects.filter(
            base__lang__lid=base_lid, target__lang__lid=target_lid
        )

        if "lexeme" in query_params:
            lexeme = self.request.query_params["lexeme"]
            queryset = queryset.filter(target__words__lexeme=lexeme)

        if "annot" in query_params:
            annotation = int(self.request.query_params["annot"])
            queryset = queryset.filter(target__words__annotations=annotation)

        return queryset


class PhrasePairSuggestionView(generics.ListAPIView):
    """
    Viewset yielding phrase pairs suggested for a given subscription ordered by score.
    """

    serializer_class = serializers.PhrasePairSuggestionSerializer
    permission_classes = [permissions.IsAuthenticated]
    ordering = ["score"]

    def get_queryset(self):
        query_params = self.request.query_params
        user: User = self.request.user
        try:
            subscription_id = query_params.get("subscription_id")
        except KeyError as e:
            logger.error(f"Bad request in {self.__class__.__name__}")
            raise ParseError

        sub: Subscription = Subscription.objects.get(id=subscription_id)
        # TODO: use rest_framework to get object permissions
        if sub.owner_id != user.userprofile.id:
            raise PermissionDenied

        twords = TrackedWord.objects.filter(subscription_id=subscription_id)
        twords_q = reduce(
            __or__,
            [Q(target__words__id=tw.word_id) for tw in twords if tw.active],
            Q(),
        )
        tannots = TrackedAnnotation.objects.filter(subscription_id=subscription_id)
        tannots_q = reduce(
            __or__,
            [
                Q(target__words__annotations__id=ta.annotation_id)
                for ta in tannots
                if ta.active
            ],
            Q(),
        )
        tword_ids = [tw.word_id for tw in twords]
        tannots_ids = [ta.id for tw in tannots]
        # if there are not tracked items, then return em
        if len(twords_q) == 0 and len(tannots_q) == 0:
            return PhrasePair.objects.none()
        # generate Count of exact those types tracked items which are actually tracked
        if len(twords_q) > 0 and len(tannots_q) == 0:
            tcount = Count("target__words", filter=twords_q)
        else:
            tcount = Count("target__words__annotations", filter=tannots_q)
            if len(twords_q) > 0:
                tcount += Count("target__words", filter=twords_q)

        logger.debug(twords_q, tannots_q, tcount)
        suggested_pairs = (
            PhrasePair.objects.filter(
                base__lang_id=sub.base_lang_id, target__lang_id=sub.target_lang_id
            )
            .annotate(score=tcount)
            .filter(target__words__in=tword_ids)
            .select_related("base", "target")
            .order_by("-score")
        )


docs_schema_view = get_schema_view(
    openapi.Info(
        title="Lekt API",
        default_version="v1",
    ),
    public=True,
    permission_classes=[permissions.AllowAny],
)
