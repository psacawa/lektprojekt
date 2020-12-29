import logging

from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework.request import Request

from .models import (
    Annotation,
    Language,
    Lexeme,
    Phrase,
    PhrasePair,
    PhraseWord,
    Subscription,
    TrackedAnnotation,
    TrackedItem,
    TrackedWord,
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


class AnnotationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Annotation
        exclude = ["created_at", "updated_at"]


class LexemeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lexeme
        exclude = ["created_at", "updated_at"]


class WordSerializer(serializers.ModelSerializer):
    annotations = AnnotationSerializer(many=True)
    lexeme = LexemeSerializer()

    class Meta:
        model = Word
        exclude = ["created_at", "updated_at"]


class PhraseWordSerializer(serializers.ModelSerializer):
    class Meta:
        model = PhraseWord
        fields = ["id", "number", "start", "end"]


class PhraseSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    text = serializers.CharField()

    def __init__(self, expand=None, *args, **kwargs):
        super().__init__(
            *args,
            **kwargs,
        )
        if expand == "lexeme":
            self.fields["lexeme_matches"] = PhraseWordSerializer(many=True)
        if expand == "annot":
            self.fields["annot_matches"] = PhraseWordSerializer(many=True)


class PhrasePairSerializer(serializers.ModelSerializer):
    base = PhraseSerializer()
    target = PhraseSerializer()

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request: Request = self.context["request"]
        if "lexeme" in request.query_params:
            self.fields["target"] = PhraseSerializer(expand="lexeme")
        elif "annot" in request.query_params:
            self.fields["target"] = PhraseSerializer(expand="annot")

    class Meta:
        model = PhrasePair
        fields = ["base", "target"]


class SubscriptionGetSerializer(serializers.ModelSerializer):
    """ Serialize the data for a language subscription."""

    base_lang = LanguageSerializer()
    target_lang = LanguageSerializer()
    base_voice = VoiceSerializer()
    target_voice = VoiceSerializer()

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
