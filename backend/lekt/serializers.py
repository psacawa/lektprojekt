from django.contrib.auth.models import User
from rest_framework import serializers
from rest_polymorphic.serializers import PolymorphicSerializer

from .models import (
    Annotation,
    Language,
    Phrase,
    PhrasePair,
    Subscription,
    TrackedAnnotation,
    TrackedItem,
    TrackedWord,
    UserProfile,
    Voice,
    Word,
)


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


class AnnotationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Annotation
        exclude = ["created_at", "updated_at"]


class WordSerializer(serializers.ModelSerializer):
    annotations = AnnotationSerializer(many=True)

    class Meta:
        model = Word
        exclude = ["created_at", "updated_at"]


class PhraseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Phrase
        exclude = ["created_at", "updated_at", "words"]


class PhrasePairSerializer(serializers.ModelSerializer):
    base = PhraseSerializer()
    target = PhraseSerializer()

    class Meta:
        model = PhrasePair
        exclude = ["created_at", "updated_at"]


class PhrasePairSuggestionSerializer(PhrasePairSerializer):
    score = serializers.IntegerField(read_only=True)


class TrackedItemSerializer(serializers.ModelSerializer):
    """ Serialize the data for a tracked word."""

    class Meta:
        model = TrackedItem
        exclude = ["created_at", "updated_at", "polymorphic_ctype"]


class TrackedAnnotationGetSerializer(serializers.ModelSerializer):
    """ Serialize the data for a tracked word."""

    annotation = AnnotationSerializer()

    class Meta:
        model = TrackedAnnotation
        exclude = ["created_at", "updated_at", "polymorphic_ctype"]


class TrackedAnnotationPostSerializer(serializers.ModelSerializer):
    """ Serialize the data for a tracked word."""

    class Meta:
        model = TrackedAnnotation
        exclude = ["created_at", "updated_at", "polymorphic_ctype"]


class TrackedWordGetSerializer(serializers.ModelSerializer):
    """ Serialize the data for a tracked word."""

    word = WordSerializer()

    class Meta:
        model = TrackedWord
        exclude = ["created_at", "updated_at", "polymorphic_ctype"]


class TrackedWordPostSerializer(serializers.ModelSerializer):
    """ Serialize the data for a tracked word."""

    class Meta:
        model = TrackedWord
        exclude = [
            "created_at",
            "updated_at",
            "polymorphic_ctype",
            "trackeditem_ptr",
        ]


class TrackedItemPolySerializer(PolymorphicSerializer):
    """ Serialize the data for a tracked word."""

    model_serializer_mapping = {
        TrackedItem: TrackedItemSerializer,
        TrackedWord: TrackedWordGetSerializer,
        TrackedAnnotation: TrackedAnnotationGetSerializer,
    }


class SubscriptionGetSerializer(serializers.ModelSerializer):
    """ Serialize the data for a language subscription."""

    base_lang = LanguageSerializer()
    target_lang = LanguageSerializer()
    base_voice = VoiceSerializer()
    target_voice = VoiceSerializer()
    # NOTE : This somehow fails without "many=True". Investigate
    trackeditem_set = TrackedItemPolySerializer(many=True)

    class Meta:
        model = Subscription
        exclude = ["created_at", "updated_at", "owner"]


class SubscriptionPostSerializer(serializers.ModelSerializer):
    """ Serialize the data for a language subscription."""

    class Meta:
        model = Subscription
        fields = ["base_lang", "target_lang", "base_voice", "target_voice", "owner"]


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializes user's language subsriptions and User object."""

    subscription_set = SubscriptionGetSerializer(many=True)

    class Meta:
        model = UserProfile
        exclude = ["created_at", "updated_at"]