from django.db import models
from django.contrib.auth.models import User

from model_utils.managers import InheritanceManager
from polymorphic.models import PolymorphicModel
from polymorphic.managers import PolymorphicManager
from tabulate import tabulate

from lekt import managers

import logging
logger = logging.getLogger(__name__)

class TimestampedModel(models.Model): 
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True
        # Any model that inherits from `TimestampedModel` should is ordered in 
        #  reverse-chronological order. This can be overriden on a per-model basis 
        ordering = ['-created_at', '-updated_at']


class Language(TimestampedModel, models.Model):
    """ Represent of a language. """

    id = models.AutoField(primary_key=True, db_column="lang_id")
    lid = models.CharField(max_length=10, unique=True)
    name = models.CharField(max_length=50, unique=True)
    default_voice = models.ForeignKey(
        "Voice",
        on_delete=models.PROTECT,
        null=True,
    )
    objects = managers.LektManager()

    def __repr__(self):
        return f"<Language name:{self.name}>"

    def __str__(self):
        return self.name


class Voice(TimestampedModel):
    """ Represents a particular language's accent: e.g. castellano spanish"""

    id = models.AutoField(primary_key=True, db_column="voice_id")
    # Spanish
    lang = models.ForeignKey(Language, on_delete=models.PROTECT)
    #  name of AWS Polly voice - this is use to the create the filename hash!
    # "Lucia"
    name = models.CharField(max_length=50, unique=True)
    # "Castilian Spanish"
    accent = models.CharField(max_length=50)
    # "es-ES"
    aid = models.CharField(max_length=10)
    GENDER_CHOICES = [("M", "Male"), ("F", "Female")]
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES)

    objects = managers.LektManager()

    def __repr__(self):
        return f"<Voice lang={self.accent}, voice={self.name}>"

    def __str__(self):
        return self.name


class Annotation(TimestampedModel):
    """
    Key-value annotation showing grammatical data determined by NLP engine.
    """

    id = models.AutoField(primary_key=True, db_column="annot_id")
    #  key = models.CharField(max_length=20)
    value = models.CharField(max_length=20)
    explanation = models.CharField(
        max_length=100,
        #  blank= True
        null=True,
    )
    # write now, an annotation is just a text string as returned by the language parser's
    #  work on the `tag_` attribute of the parsed token
    #  e.g. "Mood=Ind" or "PRPS"
    lang = models.ForeignKey(Language, on_delete=models.PROTECT)

    objects = managers.LektManager()

    def describe(self, lid=None):
        """ 
        Pretty print a table of annotations for a given langauge along with their
        explanation.
        """
        # nie działa - trzeba przenieść na menedżer
        results = self.objects.filter(lang__lid=lid).order_by("value")
        data = [[a.value, a.explanation] for a in results]
        table = tabulate(data, headers=["value", "explanation"])

    def __repr__(self):
        return f"<Annotation {self.value} {self.explanation}>"

    def __str__(self):
        return f"{self.value}"


class Word(TimestampedModel):
    """
    This model stores the word as parsed by Spacy, including all NLP annotations.
    That includes part of speech and grammatical annotations
    A key 
    """

    id = models.AutoField(primary_key=True, db_column="word_id")
    # Obtained from spacy models
    #  # Token.orth_ NOT represented
    # Token.norm_
    norm = models.CharField(max_length=50)
    # Token.lemma_.lower () ?
    lemma = models.CharField(max_length=50)
    # Token.pos_
    pos = models.CharField(max_length=50)
    # Token.tag_
    tag = models.CharField(max_length=200)
    # Token.ent_type_
    ent_type = models.CharField(max_length=50)
    # Token.is_oov
    is_oov = models.BooleanField()
    # Token.is_stop
    is_stop = models.BooleanField()
    # Token.prob
    prob = models.FloatField(default=0.0)
    #  <TODO 03/12/20: add logic to generate this in data pipeline>

    # m2m for annotations
    annotations = models.ManyToManyField(Annotation, through="WordAnnotation")
    # TODO: test also Hstore for this field, perform benchmark
    # i.e.annotations = models.HStoreField

    lang = models.ForeignKey(Language, on_delete=models.PROTECT)

    # here we track metadata pertaining to distribution semantics on the level of words
    # TODO: develop this
    corpus_occurences = models.IntegerField(default=0)

    objects = managers.LektManager()

    class Meta:
        # it's will remain unclear what should by a natural key as long as
        # there remain question about what a 'word' is in our modelling
        unique_together = (
            "norm",
            "lemma",
            "pos",
            "tag",
            "ent_type",
            "is_oov",
            "is_stop",
            "lang",
        )
        #  TODO: this fixes the stderr pagination messages from DRF, but at the cost of
        #  expensible queries. Find an alternative
        #  ordering = ['lemma']

    def __repr__(self):
        return f"<Word text={self.norm},{self.lemma},{self.pos},{self.tag}>"

    def __str__(self):
        return self.norm


class Phrase(TimestampedModel):
    """
    Represents a single phrase in a single language.
    """

    id = models.AutoField(primary_key=True, db_column="phrase_id")
    text = models.CharField(
        max_length=500,
        # can't have uniqueness of phrases because of multiple translation issue:
        # Sources may implement different translations for a given phrase
        # en: "Hi!" -> pl: "Siema! or pl: "Cześć!"
        unique = False
    )
    lang = models.ForeignKey(Language, on_delete=models.PROTECT)
    words = models.ManyToManyField(Word, through="PhraseWord")

    objects = managers.LektManager()

    def describe(self, attrs=[], add_attrs=True):
        """
        Brief description of phrase. `attrs` refers additional attributes to print, e.g.:
        `phrase.describe(["ent_type"])`
        """
        print(self.text)
        base_attrs = [
            "norm",
            "lemma",
            "pos",
            "tag",
        ]
        if add_attrs:
            attrs = base_attrs + attrs
        word_query = self.words.all().order_by("phraseword__number")
        table = [[getattr(w, at) for at in attrs] for w in word_query]
        print(tabulate(table, headers=attrs))

    def __repr__(self):
        return f"<Phrase text={self.text}>"

    def __str__(self):
        return self.text


class PhrasePair(TimestampedModel):
    """
    Represents a pair of phrases that are translations of one another. The attributes base
    and target should be understood in the send of base and target language. 

    Phrasepairs exist in a 2-to-2 relationship with Phrase objects. Therefore if the data 
    pipeline contains an exmample:

    en: "Hello!"  
    es: "¡Hola!"

    then there will exist a PhrasePair with either of the two as the `base` attribute, 
    that is 

    pp1.base.text == pp2.target.text  "Hello!"  
    pp1.target.text == pp1.base.text   "¡Hola!"

    `pp1`, `pp2` are targeted towards English learners of Spanish and Spanish learners of
    English, respectively.
    """
    id = models.AutoField(primary_key=True, db_column="phrasepair_id")
    base = models.OneToOneField(
        Phrase, on_delete=models.CASCADE, related_name="pair_from"
    )
    target = models.OneToOneField(
        Phrase, on_delete=models.CASCADE, related_name="pair_to"
    )

    # the source of the data is stored
    SOURCE_CHOICES = [("SD", "www.spanishdict.com"), ("GPT3", "OpenAI GPT3")] 
    source = models.CharField(
        max_length=10,
        choices=SOURCE_CHOICES,
    )
    active = models.BooleanField(default=True)

    #  TODO: investigate the crashing in ipython
    objects = managers.LektManager()
    enes = managers.PhrasePairQuerySet(base_lid="en", target_lid="es")
    esen = managers.PhrasePairQuerySet(base_lid="es", target_lid="en")

    class Meta:
        unique_together = ("base", "target")

    def __repr__(self):
        return f"<PhrasePair base={self.base.text} target={self.target.text}>"

    def __str__(self):
        return f"<{self.base.text} {self.target.text}>"


class UserProfile(TimestampedModel):
    """ Proxy model for User. User profiles internal to Lekt application. In accordance
    with Django best practices, applications will leave the User model for auth purposes,
    and UserProfile will be used for application-specific purpses.""" 

    id = models.AutoField(primary_key=True, db_column="userprofile_id")
    user = models.OneToOneField(User, on_delete=models.CASCADE)

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
    owner = models.ForeignKey(UserProfile, on_delete=models.CASCADE)

    base_lang = models.ForeignKey(Language, on_delete=models.PROTECT, related_name="+")
    target_lang = models.ForeignKey(
        Language, on_delete=models.PROTECT, related_name="+"
    )
    base_voice = models.ForeignKey(Voice, on_delete=models.PROTECT, related_name="+")
    target_voice = models.ForeignKey(Voice, on_delete=models.PROTECT, related_name="+")

    objects = managers.LektManager()

    class Meta:
        unique_together = ("owner", "base_lang", "target_lang")

    def __repr__(self):
        return "<Subscription owner={} base={} target={}>".format(
            self.owner, self.base_lang.lid, self.target_lang.lid
        )

    def __str__(self):
        return f"({self.owner}: {self.base_lang.lid}, {self.target_lang.lid})"


class TrackedItem(PolymorphicModel):
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
    Phrase to Word m2m bridge with the additional data of the ordering in which the
    words appears.
    """

    class Meta:
        db_table = "lekt_phrase_words"
        ordering = ["number"]

    id = models.AutoField(primary_key=True, db_column="phraseword_id")
    phrase = models.ForeignKey(Phrase, on_delete=models.CASCADE)
    word = models.ForeignKey(Word, on_delete=models.CASCADE)
    number = models.IntegerField()

    objects = managers.LektManager()

    def __str__(self):
        return f"<PhraseWord norm={self.word.norm} #{self.number}>"

    def __repr__(self):
        return "<PhraseWord text={}, norm={} #{}>".format(
            self.phrase.text, self.word.norm, self.number
        )


class WordAnnotation(models.Model):
    """Word to Annotation m2m bridge"""

    class Meta:
        db_table = "lekt_word_annotations"

    id = models.AutoField(primary_key=True, db_column="phraseword_id")
    word = models.ForeignKey(Word, on_delete=models.CASCADE)
    annot = models.ForeignKey(Annotation, on_delete=models.CASCADE)

    def __str__(self):
        return f"<WordAnnotation norm={self.word.norm} annot={self.annot.value}>"

    def __repr__(self):
        return f"<WordAnnotation norm={self.word.norm} annot={self.annot.value}>"
