import logging

from django.contrib.auth.models import User
from django.db import models
from django.db.models import Lookup
from django.db.models.fields import Field
from model_utils.managers import InheritanceManager
from polymorphic.managers import PolymorphicManager
from polymorphic.models import PolymorphicModel
from tabulate import tabulate

from lekt import managers

logger = logging.getLogger(__name__)


class TimestampedModel(models.Model):
    created_at = models.DateTimeField(
        auto_now_add=True, verbose_name="time of creation"
    )
    updated_at = models.DateTimeField(auto_now=True, verbose_name="time of update")

    class Meta:
        abstract = True
        # Any model that inherits from `TimestampedModel` should is ordered in
        #  reverse-chronological order. This can be overriden on a per-model basis
        ordering = ["-created_at", "-updated_at"]


class Language(TimestampedModel):
    """
    Model representing an indvidual **language**.
    """

    id = models.AutoField(primary_key=True, db_column="lang_id")
    lid = models.CharField(
        max_length=10,
        unique=True,
        verbose_name="Language Id",
        help_text='Two-letter identifier used as a key. E.g.: "fr". ',
    )
    name = models.CharField(
        max_length=50,
        unique=True,
        verbose_name="Printable name",
        help_text='E.g. "French"',
    )
    default_voice = models.ForeignKey(
        "Voice",
        on_delete=models.PROTECT,
        null=True,
        verbose_name="Default voice",
        help_text="E.g. Voice=Chantal, Canadian French",
    )
    objects = managers.LektManager()

    def __repr__(self):
        return f"<Language name:{self.name}>"

    def __str__(self):
        return self.name


class Voice(TimestampedModel):
    """

    Model representing a **voice** that can be used to produce audio by the text-to-speech
    engine AWS Polly.

    These are distinguished by a common name (e.g. *Conchita*) and
    contain the data of the language, regional accent (e.g. Castilian Spanish *es-ES*),
    and the gender of the speaker's voice.
    These Voices exists in a many-to-one relationship with :model:`lekt.Language` models.
    """

    id = models.AutoField(primary_key=True, db_column="voice_id")
    lang = models.ForeignKey(
        Language, on_delete=models.PROTECT, verbose_name="Language"
    )
    name = models.CharField(
        max_length=50,
        unique=True,
        verbose_name="Voice Model Name",
        help_text='E.g. "Lucia"',
    )
    accent = models.CharField(
        max_length=50,
        verbose_name="Region/accent name",
        help_text='E.g. "Castilian Spanish"',
    )
    aid = models.CharField(
        max_length=10,
        verbose_name="Region code",
        help_text='E.g. "es-ES"',
    )
    GENDER_CHOICES = [("M", "Male"), ("F", "Female")]
    gender = models.CharField(
        max_length=10, choices=GENDER_CHOICES, verbose_name="Voice gender"
    )

    objects = managers.LektManager()

    def __repr__(self):
        return f"<Voice lang={self.accent}, voice={self.name}>"

    def __str__(self):
        return self.name


class Corpus(TimestampedModel):
    """
    Model representing source of phrases.

    These exist in a one-to-many relationship with :model:`lekt.PhrasePair` models.
    """

    name = models.CharField(
        max_length=100, unique=True, verbose_name="Parallel corpus name"
    )
    domain = models.CharField(
        max_length=100,
        blank=True,
        help_text="""Domain of data
            source, in case of scraping""",
    )
    languages = models.ManyToManyField(
        Language,
        help_text="""Two languages associated with
            the corpus""",
    )

    def remove(self):
        self.phrasepair_set.all().delete()
        #  TODO 09/12/20 psacawa: finish this

    def __repr__(self):
        return f"<Corpus source={self.name} domain={self.domain}>"

    def __str__(self):
        return self.name


class Annotation(TimestampedModel):
    """
    Model representing **annotation** indicating grammatical data determined by NLP engine.

    Right now these are parts of speech (POS) attached by the Spacy part-of-speech tagger
    and more detailed tags attached be Spacy detailed tagger.
    These represent grammatical annotations including POS, mood, and tense.
    The results of the NLP is
    postprocessed in a language-dependent manner during the execution of the
    ``load_corpus`` admin command.
    The annotation is distinguished by a *value* attribute.

    These objects exist in many-to-many relationship with :model:`lekt.Word` object.
    """

    id = models.AutoField(primary_key=True, db_column="annot_id")
    value = models.CharField(
        max_length=20,
        verbose_name="Annotation value",
        help_text="""value of POS/tag as attached by Spacy to the processed token, 
        e.g. Mood=Sub""",
    )
    explanation = models.CharField(
        max_length=100,
        null=True,
        verbose_name="Human readable description",
        help_text="""these descriptions are generated by spacy.explain but are not
        universally available""",
    )
    lang = models.ForeignKey(
        Language, on_delete=models.PROTECT, verbose_name="Language Id"
    )

    objects = managers.AnnotationManager()

    def __repr__(self):
        return f"<Annotation {self.value} {self.explanation}>"

    def __str__(self):
        return f"{self.value}"


class Lexeme(TimestampedModel):
    """
    This model represents lexemes in the linguistic sense. It's an approximation though:
    these Lexemes only include the lemmatized form of the word and the part of speech.

    These objects exist in one-to-many relationship with :model:`lekt.Word`
    and :model:`lekt.Annotation` objects.
    """

    id = models.AutoField(primary_key=True, db_column="lexeme_id")
    lemma = models.CharField(
        max_length=50,
        verbose_name="Token lemma",
        help_text="""the "base" form of the word, computed as Token.lemma_.lower(), 
        e.g. "hablar" """,
    )
    pos = models.CharField(
        max_length=50, verbose_name="Part of speech", help_text="computed as Token.pos_"
    )

    lang = models.ForeignKey(
        Language, on_delete=models.PROTECT, verbose_name="Language Id"
    )

    class Meta:
        unique_together = ["lemma", "pos", "lang"]

    def __repr__(self):
        return f"<Lexeme lemma={self.lemma} pos={self.pos}>"

    def __str__(self):
        return f"<{self.lemma} {self.pos}>"


class Word(TimestampedModel):
    """
    This model stores the word as parsed by Spacy, including all NLP annotations.

    These includes part of speech and other grammatical annotations.
    These are uniquely determined by the set of attributes in the ``Meta.unique_together``
    field. The Token.orth_ attribute is not represented as a field on this model.

    These objects exist in many-to-many relationship with :model:`lekt.Phrase`
    and :model:`lekt.Annotation` objects.
    """

    id = models.AutoField(primary_key=True, db_column="word_id")
    lexeme = models.ForeignKey(
        Lexeme, on_delete=models.PROTECT, verbose_name="Lexeme Id"
    )
    norm = models.CharField(
        max_length=50,
        verbose_name="Normal form",
        help_text='the raw text of the token, computed as Token.norm_, e.g. "hablara"',
    )
    tag = models.CharField(
        max_length=200,
        verbose_name="Detailed part of speech",
        help_text="""computed as Token.tag_,
        e.g. VERB__Mood=Ind|Number=Sing|Person=3|Tense=Imp|VerbForm=Fin""",
    )
    ent_type = models.CharField(
        max_length=50,
        verbose_name="Entity type",
        help_text="""Type of named entity as computed as Token.ent_type_
        e.g. PER for person for "Sra. Lopez"
        """,
    )
    is_oov = models.BooleanField(help_text="computed from Token.is_oov")
    #  TODO 04/12/20 psacawa: why is this field even here? Inverstigate
    is_stop = models.BooleanField(
        help_text="Whether the token a stop word, computed from Token.is_stop"
    )
    #  TODO 04/12/20 psacawa: why is this field even here? Inverstigate
    #  <TODO 03/12/20: add logic to generate this in data pipeline>
    prob = models.FloatField(default=0.0, help_text="computed from Token.prob")

    annotations = models.ManyToManyField(
        Annotation,
        through="WordAnnotation",
        help_text="grammatical annotations attached to the word",
    )
    # TODO: test also Hstore for this field, perform benchmark
    # i.e.annotations = models.HStoreField

    # here we track metadata pertaining to distributional semantics on the level of words
    # TODO: develop this
    corpus_occurences = models.IntegerField(default=0)

    objects = managers.LektManager()

    class Meta:
        # it's will remain unclear what should by a natural key as long as
        # there remain question about what a 'word' is in our modelling
        unique_together = (
            "norm",
            "lexeme",
            "tag",
            "ent_type",
            "is_oov",
            "is_stop",
        )
        #  TODO: this fixes the stderr pagination messages from DRF, but at the cost of
        #  expensible queries. Find an alternative
        #  ordering = ['lemma']

    def __repr__(self):
        return (
            f"<Word text={self.norm},{self.lexeme.lemma},{self.lexeme.pos},{self.tag}>"
        )

    def __str__(self):
        return self.norm


class Phrase(TimestampedModel):
    """
    This model represents a single phrase in a single language.

    These *phrases* should be understood loosely. They are just the examples in the input
    data. They can be multiple sentences long.

    """

    id = models.AutoField(primary_key=True, db_column="phrase_id")
    text = models.CharField(
        max_length=500,
        # can't have uniqueness of phrases because of multiple translation issue:
        # Sources may implement different translations for a given phrase
        # en: "Hi!" -> pl: "Siema! or pl: "Cześć!"
        unique=False,
        verbose_name="Raw text of phrase",
    )
    lang = models.ForeignKey(
        Language, on_delete=models.PROTECT, verbose_name="Language Id"
    )
    words = models.ManyToManyField(
        Word, through="PhraseWord", verbose_name="Words in the phrase"
    )

    objects = managers.LektManager()

    def describe(self, attrs=[], add_attrs=True):
        """
        Brief description of phrase. `attrs` refers additional attributes to print, e.g.:
        `phrase.describe(["ent_type"])`
        """

        def nested_getattr(x, s: str):
            """getattr admitting dot syntax for atribute access"""
            attrs = s.split(".")
            for attr in attrs:
                x = getattr(x, attr)
            return x

        print(self.text)
        base_attrs = [
            "norm",
            "lexeme.lemma",
            "lexeme.pos",
            "tag",
        ]
        if add_attrs:
            attrs = base_attrs + attrs
        word_query = self.words.all().order_by("phraseword__number")
        table = [[nested_getattr(w, at) for at in attrs] for w in word_query]
        print(tabulate(table, headers=attrs))

    def __repr__(self):
        return f"<Phrase text={self.text}>"

    def __str__(self):
        return self.text


class PhrasePair(TimestampedModel):
    """
    This model represents a pair of phrases that are translations of one another.

    The attributes base and target should be understood in the send of base and
    target language.  Phrasepairs exist in a 2-to-2 relationship with :model:`lekt.Phrase`
    objects.  Therefore if the data pipeline contains an exmample:

    English: *"Hello!"*
    Spanish: *"¡Hola!"*

    then there will exist a PhrasePair with either of the two as the `base` attribute,
    that is

    ``pp1.base.text == pp2.target.text == "Hello!"``

    ``pp1.target.text == pp1.base.text == "¡Hola!"``

    ``pp1``, ``pp2`` are targeted towards English learners of Spanish and
    Spanish learners of English, respectively.
    """

    id = models.AutoField(primary_key=True, db_column="phrasepair_id")
    # because dererred constraints don't work in
    #  TODO 15/12/20 psacawa: find out why transaction.atomic() doesn't work
    base = models.OneToOneField(
        Phrase,
        on_delete=models.SET_NULL,
        null=True,
        related_name="pair_from",
        verbose_name="Base language phrase",
    )
    target = models.OneToOneField(
        Phrase,
        on_delete=models.SET_NULL,
        null=True,
        related_name="pair_to",
        verbose_name="Target language phrase",
    )

    source = models.ForeignKey(
        Corpus,
        verbose_name="Source of the data",
        help_text="""This is one of a set of sources of examples which 
        are added and tracked manually by administrators.""",
        on_delete=models.PROTECT,
    )

    active = models.BooleanField(
        default=True,
        verbose_name="Active",
        help_text="""According to need, PhrasePair objects can be marked inactive in the
        database. This is separate from a soft delete.""",
    )

    #  TODO: investigate the crashing in ipython
    objects = managers.LektManager()
    #  aliases that give quick access to some PhrasePairs, e.g.
    # PhrasePair.enes.all() gives those with base & target == en & es
    enes = managers.PhrasePairQuerySet(base_lid="en", target_lid="es")
    esen = managers.PhrasePairQuerySet(base_lid="es", target_lid="en")

    class Meta:
        unique_together = ("base", "target")

    def __repr__(self):
        return f"<PhrasePair base={self.base.text} target={self.target.text}>"

    def __str__(self):
        return f"<{self.base.text} {self.target.text}>"


class UserProfile(TimestampedModel):
    """
    User profiles internal to Lekt application.

    Proxy model for User. In accordance with Django best practices, applications will
    leave the User model for auth purposes, and UserProfile will be used for
    application-specific purpses.

    These models exists in one-to-many relationship with :model:`lekt.Subscription`.
    """

    id = models.AutoField(primary_key=True, db_column="userprofile_id")
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        verbose_name="User",
        help_text="User account attached to the profile",
    )

    objects = managers.LektManager()

    def __repr__(self):
        return f"<UserProfile user={self.user.username}>"

    def __str__(self):
        return self.user.username


class Subscription(TimestampedModel):
    """
    Represents the configuration data for a single language pair tracked by a single user.

    A user may start learning with Spanish with the Castellano voice as the base
    language and English with British voice as the target language. That is respresented
    by this object.
    """

    id = models.AutoField(primary_key=True, db_column="sub_id")
    owner = models.ForeignKey(
        UserProfile,
        on_delete=models.CASCADE,
        verbose_name="Owner's profile",
        help_text="UserProfile of the account owning the subscription",
    )

    base_lang = models.ForeignKey(
        Language,
        on_delete=models.PROTECT,
        related_name="+",
        verbose_name="Base language",
        help_text="Learner's native language",
    )
    target_lang = models.ForeignKey(
        Language,
        on_delete=models.PROTECT,
        related_name="+",
        verbose_name="Target language",
        help_text="Learner's target language",
    )
    base_voice = models.ForeignKey(
        Voice,
        on_delete=models.PROTECT,
        related_name="+",
        verbose_name="Base language voice",
        help_text="voice/locale for the learner's base language",
    )
    target_voice = models.ForeignKey(
        Voice,
        on_delete=models.PROTECT,
        related_name="+",
        verbose_name="Target language voice",
        help_text="voice/locale for the learner's target language",
    )

    objects = managers.LektManager()

    class Meta:
        unique_together = ("owner", "base_lang", "target_lang")

    def __repr__(self):
        return "<Subscription owner={} base={} target={}>".format(
            self.owner, self.base_lang.lid, self.target_lang.lid
        )

    def __str__(self):
        return f"({self.owner}: {self.base_lang.lid}, {self.target_lang.lid})"


class TrackedItem(PolymorphicModel, TimestampedModel):
    """
    Base class for items that a user may be presently tracking.
    Derived classes include TrackedAnnotation and TrackedWord.

    """

    base_id = models.AutoField(primary_key=True, db_column="titem_id")
    subscription = models.ForeignKey(
        Subscription, on_delete=models.CASCADE, db_column="sub_id"
    )
    active = models.BooleanField(default=True)

    objects = PolymorphicManager()
    #  <TODO 03/12/20: PolyManager has issues with integrity. investigate>
    #  objects = InheritanceManager()


class TrackedAnnotation(TrackedItem):
    """
    In v0.1 encompasses all tracked data pertaining to filtering
    Most of the application logic dpeends on this data
    """

    id = models.AutoField(primary_key=True, db_column="tannot_id")
    # linguistic/auxiliary data
    annotation = models.ForeignKey(
        Annotation, on_delete=models.PROTECT, db_column="annot_id"
    )

    def __repr__(self):
        return "<TrackedAnnotation user={} annot={}>".format(
            self.subscription.owner.user.username, self.annotation.value
        )

    def __str__(self):
        return self.annotation.value

    # TODO: this does not work in django on account of the polymorphicity. Fix this
    #  class Meta:
    #      unique_together = ['subscription', 'annotation']


class TrackedWord(TrackedItem):
    """ Represents that user's Subscription is tracking a word It's just a stub. """

    id = models.AutoField(primary_key=True, db_column="tword_id")
    # linguistic/auxiliary data
    word = models.ForeignKey(Word, on_delete=models.PROTECT)

    def __repr__(self):
        return "<TrackedWord user={} word={}>".format(
            self.subscription.owner.user.username, self.word.norm
        )

    def __str__(self):
        return self.word.norm


class PhraseWord(models.Model):
    """
    Phrase to Word many-to-many bridge with the additional data of the ordering in which
    the words appear in the phrase.
    """

    class Meta:
        db_table = "lekt_phrase_words"
        ordering = ["number"]

    id = models.AutoField(primary_key=True, db_column="phraseword_id")
    phrase = models.ForeignKey(Phrase, on_delete=models.CASCADE)
    word = models.ForeignKey(Word, on_delete=models.CASCADE)
    number = models.IntegerField()
    start = models.IntegerField()
    end = models.IntegerField()

    objects = managers.LektManager()

    def __str__(self):
        return self.word.norm

    def __repr__(self):
        return "<PhraseWord text={}, norm={} #{} start={} end={}>".format(
            self.phrase.text, self.word.norm, self.number, self.start, self.end
        )


class WordAnnotation(models.Model):
    """
    Word to Annotation many-to-many bridge
    """

    class Meta:
        db_table = "lekt_word_annotations"

    id = models.AutoField(primary_key=True, db_column="phraseword_id")
    word = models.ForeignKey(Word, on_delete=models.CASCADE)
    annot = models.ForeignKey(Annotation, on_delete=models.CASCADE)

    def __str__(self):
        return f"<WordAnnotation norm={self.word.norm} annot={self.annot.value}>"

    def __repr__(self):
        return f"<WordAnnotation norm={self.word.norm} annot={self.annot.value}>"


class LexemeWeight(models.Model):
    """
    This table represents
    """

    id = models.AutoField(primary_key=True, db_column="id")
    base_lang = models.ForeignKey(
        "Language", on_delete=models.RESTRICT, related_name="+"
    )
    target_lang = models.ForeignKey(
        "Language", on_delete=models.RESTRICT, related_name="+"
    )
    lexeme = models.ForeignKey("Lexeme", on_delete=models.RESTRICT)
    phrasepair = models.ForeignKey(
        "PhrasePair", on_delete=models.CASCADE, related_name="lexeme_weights"
    )
    weight = models.FloatField(default=0.0)
    objects = managers.LektManager()

    class Meta:
        managed = False
        db_table = "lekt_lexeme_weight"


# custom lookup to implement SQL's LIKE clause
@Field.register_lookup
class Like(Lookup):
    lookup_name = "like"

    def as_sql(self, compiler, connection):
        lhs, lhs_params = self.process_lhs(compiler, connection)
        rhs, rhs_params = self.process_rhs(compiler, connection)
        params = lhs_params + rhs_params
        return "%s LIKE %s" % (lhs, rhs), params
