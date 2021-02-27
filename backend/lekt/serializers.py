import logging

from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework.request import Request
from rest_framework.views import APIView
from rest_polymorphic.serializers import PolymorphicSerializer

from .models import (
    Feature,
    Language,
    LanguageSubscription,
    Lexeme,
    Observable,
    Phrase,
    PhrasePair,
    PhraseWord,
    TrackedList,
    TrackedObservable,
    UserProfile,
    Voice,
    Word,
)

logger = logging.getLogger(__name__)


class VoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Voice
        exclude = ["created_at", "updated_at"]


class LanguageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Language
        exclude = ["created_at", "updated_at"]


class LanguageVoiceSerializer(LanguageSerializer):
    voice_set = VoiceSerializer(many=True)


class FeatureSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feature
        fields = ["id", "name", "value", "description"]


class LexemeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lexeme
        fields = ["id", "lemma", "pos"]


class WordSerializer(serializers.ModelSerializer):
    features = FeatureSerializer(many=True)
    lexeme = LexemeSerializer()

    class Meta:
        model = Word
        exclude = ["created_at", "updated_at"]


class PhraseWordSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    number = serializers.IntegerField()
    start = serializers.IntegerField()
    end = serializers.IntegerField()

    def __init__(self, show_related=None, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # related attributes added by Prefetch in queryset
        if show_related == "lexeme":
            self.fields["lexeme"] = serializers.IntegerField()
        elif show_related == "feature":
            self.fields["feature"] = serializers.IntegerField()


class PhraseSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    text = serializers.CharField()
    lang = serializers.PrimaryKeyRelatedField(read_only=True)

    def __init__(self, expand_matches=[], *args, **kwargs):
        super().__init__(
            *args,
            **kwargs,
        )
        logger.debug(f"{expand_matches=}")
        if "lexeme" in expand_matches:
            self.fields["lexeme_matches"] = PhraseWordSerializer(
                show_related="lexeme", many=True
            )
        if "feature" in expand_matches:
            self.fields["feature_matches"] = PhraseWordSerializer(
                show_related="feature", many=True
            )


class PhraseDetailSerializer(serializers.ModelSerializer):
    words = WordSerializer(many=True)

    class Meta:
        model = Phrase
        fields = ["words", "text", "lang", "id"]


class PhrasePairSerializer(serializers.ModelSerializer):
    base = PhraseSerializer()
    #  target serializer is added dynamically in __init__
    #  target = PhraseSerializer(...)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        expand_matches = self.context.get("expand_matches", [])
        self.fields["target"] = PhraseSerializer(expand_matches=expand_matches)

    class Meta:
        model = PhrasePair
        fields = ["id", "base", "target"]


class PhrasePairDetailSerializer(serializers.ModelSerializer):
    base = PhraseSerializer()
    target = PhraseDetailSerializer()

    class Meta:
        model = PhrasePair
        fields = ["id", "base", "target"]


class ObservableSerializer(PolymorphicSerializer):
    model_serializer_mapping = {
        Lexeme: LexemeSerializer,
        Feature: FeatureSerializer,
    }


class TrackedObservableSerializer(serializers.ModelSerializer):

    observable = ObservableSerializer()

    class Meta:
        model = TrackedObservable
        fields = ["id", "observable", "difficulty", "last_answered_at"]


class tracked_list_default:
    requires_context = True

    def __call__(self, serializer_field):
        view: APIView = serializer_field.context["view"]
        return TrackedList(id=view.kwargs.get("list_pk"))


class TrackedObservablePostSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrackedObservable
        fields = ["id", "tracked_list", "observable"]
        extra_kwargs = {
            "tracked_list": {"default": tracked_list_default(), "required": False}
        }


class TrackedListSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrackedList
        fields = ["id", "name", "subscription"]


class LanguageSubscriptionGetSerializer(serializers.ModelSerializer):
    """ Serialize the data for a language subscription."""

    base_lang = LanguageSerializer()
    target_lang = LanguageSerializer()
    base_voice = VoiceSerializer()
    target_voice = VoiceSerializer()
    lists = serializers.PrimaryKeyRelatedField(
        queryset=TrackedList.objects.all(), many=True, source="trackedlist_set"
    )

    class Meta:
        model = LanguageSubscription
        exclude = ["created_at", "updated_at", "owner"]


class LanguageSubscriptionPostSerializer(serializers.ModelSerializer):
    """ Serialize the data for a language subscription."""

    class Meta:
        model = LanguageSubscription
        fields = ["base_lang", "target_lang", "base_voice", "target_voice", "owner"]


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializes user's language subsriptions and User object."""

    subscription_set = LanguageSubscriptionGetSerializer(many=True)

    class Meta:
        model = UserProfile
        exclude = ["created_at", "updated_at"]
