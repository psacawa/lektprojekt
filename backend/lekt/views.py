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
from rest_framework.filters import OrderingFilter
from rest_framework.exceptions import ParseError, ValidationError
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

from . import filters
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
    """API View to represent (multiple) language and all it's voices."""

    filterset_fields = ["lid"]
    serializer_class = serializers.LanguageVoiceSerializer


class LexemeCompletionView(generics.ListAPIView):
    queryset = Lexeme.objects.all()
    serializer_class = serializers.LexemeSerializer
    filterset_class = filters.LexemeFilterSet


class AnnotationCompletionView(generics.ListAPIView):
    queryset = Annotation.objects.all()
    serializer_class = serializers.AnnotationSerializer
    filterset_class = filters.AnnotationFilterSet


class WordCompletionView(generics.ListAPIView):
    """
    API view for querying words in some language on the basis of substring containment.
    """

    page_size = 25
    serializer_class = serializers.WordSerializer
    queryset = Word.objects.all()
    filterset_class = filters.WordFilterSet


class PhraseCompletionView(generics.ListAPIView):
    """API View to list phrases containing a given substring."""

    queryset = Phrase.objects.all()
    serializer_class = serializers.PhraseSerializer
    filterset_class = filters.PhraseFilterSet


@method_decorator(cache_page(60 * 60), name="dispatch")
class GimpedView(generics.ListAPIView):
    """
    This endpoint just shows phrase pairs for a give language pair such
    that the target language phrase contains a particular word.
    E.g. /api/suggestion?base=en&target=es&lexeme=perro
    """

    serializer_class = serializers.PhrasePairSerializer
    filterset_class = filters.GimpedFilterSet


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
        return user.userprofile.subscription_set.all()


docs_schema_view = get_schema_view(
    openapi.Info(
        title="Lekt API",
        default_version="v1",
    ),
    public=True,
    permission_classes=[permissions.AllowAny],
)
