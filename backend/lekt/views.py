import logging
from functools import reduce
from operator import __or__

from django.contrib.auth.models import User
from django.core.exceptions import PermissionDenied
from django.db.models import Count, Q
from django.utils.datastructures import MultiValueDictKeyError
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from drf_yasg import openapi
from drf_yasg.views import get_schema_view
from rest_framework import generics, permissions, viewsets
from rest_framework.exceptions import ParseError, ValidationError
from rest_framework.filters import OrderingFilter
from rest_framework.request import Request

from . import filters, serializers
from .models import (
    Annotation,
    Language,
    Lexeme,
    Phrase,
    PhrasePair,
    Subscription,
    TrackedAnnotation,
    TrackedItem,
    TrackedWord,
    Voice,
    Word,
)

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)


#  class LanguageViewSet(generics.ListAPIView):
class LanguageViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API view set to for listing `Language` models and their associated `Voice` models.
    It's possible to possible to pass multiple `lid` parameter.
    """

    queryset = Language.objects.prefetch_related("voice_set")
    filterset_class = filters.LanguageFilterSet
    serializer_class = serializers.LanguageVoiceSerializer
    ordering = ["id"]


class LexemeCompletionView(generics.ListAPIView):
    """
    API view for querying `Lexeme` models based on their associated `Language` and an
    initial `prompt` of the `lemma` of the `Lexeme`.

    """

    queryset = Lexeme.objects.all()
    serializer_class = serializers.LexemeSerializer
    filterset_class = filters.LexemeFilterSet
    ordering = ["id"]


class AnnotationCompletionView(generics.ListAPIView):
    """
    API view for querying `Annotation` models based on their associated `Language` and an
    initial `prompt`.

    """

    queryset = Annotation.objects.all()
    serializer_class = serializers.AnnotationSerializer
    filterset_class = filters.AnnotationFilterSet
    ordering = ["id"]


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


class PhraseCompletionView(generics.ListAPIView):
    """API View to list phrases containing a given substring."""

    queryset = Phrase.objects.all()
    serializer_class = serializers.PhraseSerializer
    filterset_class = filters.PhraseFilterSet
    ordering = ["id"]


@method_decorator(cache_page(60 * 60), name="dispatch")
class GimpedView(generics.ListAPIView):
    """
    This endpoint just shows `PhrasePair` models for a give `Language` pair such
    that the `target` language phrase contains a particular word.

    E.g. `/api/suggestion?base=en&target=es&lexeme=2985&annot=65`
    """

    queryset = PhrasePair.objects.select_related("base", "target")
    serializer_class = serializers.PhrasePairSerializer
    filterset_class = filters.GimpedFilterSet
    ordering = ["id"]


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
