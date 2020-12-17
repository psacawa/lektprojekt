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


@method_decorator(cache_page(60 * 60), name="dispatch")
class GimpedView(generics.ListAPIView):
    """
    This endpoint just shows phrase pairs for a give language pair such
    that the target language phrase contains a particular word.
    E.g. /api/suggestion?base=en&target=es&lexeme=perro
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


docs_schema_view = get_schema_view(
    openapi.Info(
        title="Lekt API",
        default_version="v1",
    ),
    public=True,
    permission_classes=[permissions.AllowAny],
)
