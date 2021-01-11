import logging

from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework.request import Request
from rest_framework.views import APIView

from .models import (
    Annotation,
    Language,
    Lexeme,
    Phrase,
    PhrasePair,
    PhraseWord,
    Subscription,
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
        fields = ["id", "value", "explanation"]


class LexemeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lexeme
        fields = ["id", "lemma", "pos"]


class WordSerializer(serializers.ModelSerializer):
    annotations = AnnotationSerializer(many=True)
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
        elif show_related == "annot":
            self.fields["annotation"] = serializers.IntegerField()


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
        if "annot" in expand_matches:
            self.fields["annot_matches"] = PhraseWordSerializer(
                show_related="annot", many=True
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
        expand_matches = self.context["expand_matches"]
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
