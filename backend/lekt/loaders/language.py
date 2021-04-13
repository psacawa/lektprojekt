import functools
import importlib
import logging
import re
import sys
from collections import namedtuple
from functools import lru_cache
from inspect import isclass
from string import Template
from typing import Tuple

import spacy
from django.core.exceptions import MultipleObjectsReturned
from django.db import IntegrityError, transaction
from django.db.models import Model
from progress.bar import Bar
from spacy.language import Language as SpacyLanguage
from spacy.tokens import Doc

from lekt.models import Feature, Language, Lexeme, Phrase, PhraseWord, Word

ValidationData = namedtuple("ValidationData", ["length", "propriety"])
logger = logging.getLogger(__name__)


class LanguageParser(object):
    """
    This class is repsponible for parsing the documents attached to a particular
    language and maintains references to the data pertaining to that language:
    NLP model, django model, etc.
    Created django models of the class `Word` and `Feature` are cached
    for faster parsing.

    Example usage:
    # fails if es_core_news_lg is absent
    SpanishParser(size='lg')
    # uses es_core_news_lg/md/sm in that order of preference, fails if absent
    SpanishParser()
    # uses 'mymodel', fails if absent
    SpanishParser(model='mymodel')

    The optional parameter test_only prevents model loading,
    """

    lid: str = None
    model: str = None
    model_template: Template = None
    nlp: SpacyLanguage

    def __init__(self, lid, size=None, model=None, test_only=False, **kwargs):

        self.lid = lid
        self.model_template = self.model_template(self.lid)

        # select a model prioritizing kwargs passed in precedence of their specificity
        if model is not None:
            self.model = model
        elif size is not None:
            self.model = self.model_template.substitute(lid=self.lid, size=size)
        else:
            candidate_modelnames = [
                self.model_template.substitute(lid=self.lid, size=size)
                for size in ["lg", "md", "sm", "trf"]
            ]
            # attempt to find each of the candidate models
            for model in candidate_modelnames:
                if importlib.util.find_spec(model):
                    self.model = model
                    break
            if self.model is None:
                print(
                    f"None of the spacy models {','.join(candidate_modelnames)} detected"
                )
                raise NLPModelLoadError()
        print(f"Selected model {self.model}")
        print("Obtaining model...")
        try:
            self.lang = Language.objects.get(lid=self.lid)
        except IntegrityError as e:
            logger.error("Languages {self.lid} not created yet.")
            raise

        if importlib.util.find_spec(self.model):
            if not test_only:
                self.nlp = spacy.load(self.model)
        else:
            print(f"Unable to find Spacy model {self.model}.")
            raise NLPModelLoadError()

    @staticmethod
    def model_template(lid: str):
        """E.g. en ->  Template("${lid}_core_web_${size}") """
        #  the family of English models uniqely has a different naming scheme
        if lid == "en":
            return Template("${lid}_core_web_${size}")
        else:
            return Template("${lid}_core_news_${size}")

    def get_pipe(self, phrases):
        return self.nlp.pipe(phrases)

    def process_phrase(self, doc: Doc) -> Tuple[Model, ValidationData]:
        try:
            phrase = Phrase.objects.create(text=doc.text, lang=self.lang)
        except Exception as e:
            logger.error(e)
            raise PhraseRejectException

        validation_data = self.get_validation_data(doc)
        cur_phrase_words = []
        for i, token in enumerate(doc):

            text = token.orth_
            lemma = token.lemma_
            norm = token.norm_
            pos = token.pos_
            tag = token.tag_
            morph = str(token.morph)
            ent_type = token.ent_type_
            is_oov = token.is_oov
            is_stop = token.is_stop
            prob = token.prob

            # TODO: ad hoc filtration logic, should be refactored
            if pos == "PUNCT" or pos == "X":
                continue

            try:
                cur_lexeme = self.get_lexeme(
                    lemma=lemma,
                    pos=pos,
                )
            except MultipleObjectsReturned as e:
                logger.error(
                    "Lexeme get_or create returned multiple objects on {lemma}, {pos}"
                )

            try:
                cur_word = self.get_word(
                    lexeme=cur_lexeme,
                    norm=norm,
                    tag=tag,
                    morph=morph,
                    ent_type=ent_type,
                    is_oov=is_oov,
                    is_stop=is_stop,
                )
            except MultipleObjectsReturned as e:
                logger.error(
                    "Word get_or create returned multiple objects "
                    f"on {lemma},{norm},{pos}, {tag} "
                )

            # this is an ad hoc means to determine if the word hase been processed before
            if cur_word.word_created:

                # to remove the newly created flag
                cur_word.word_created = False
                cur_word.save()

                logger.debug(f"New word for {self.lid}: {text}")

                cur_word.prob = prob
                features = {m.split("=")[0]: m.split("=")[1] for m in list(token.morph)}

                features = {
                    self.get_feature(name=n, value=v, lang=self.lang)
                    for n, v in features.items()
                }
                cur_word.features.add(*features)

            cur_phrase_words.append(
                PhraseWord(
                    word=cur_word,
                    phrase=phrase,
                    number=i,
                    start=token.idx,
                    end=token.idx + len(token),
                )
            )
        PhraseWord.objects.bulk_create(cur_phrase_words)

        #  just return the validation data directly as an attribute of the Phrase
        phrase.validation_data = validation_data
        return phrase

    # this is perhaps the maximum permissible
    @functools.lru_cache(maxsize=2 ** 17)
    def get_lexeme(
        self,
        lemma=None,
        pos=None,
    ):
        cur_lexeme, lexeme_created = Lexeme.objects.get_or_create(
            lemma=lemma,
            pos=pos,
            lang=self.lang,
        )
        cur_lexeme.lexeme_created = lexeme_created
        return cur_lexeme

    @functools.lru_cache(maxsize=2 ** 17)
    def get_word(
        self,
        lexeme=None,
        norm=None,
        tag=None,
        morph=None,
        ent_type=None,
        is_oov=None,
        is_stop=None,
    ):
        cur_word, word_created = Word.objects.get_or_create(
            lexeme=lexeme,
            norm=norm,
            tag=tag,
            morph=morph,
            ent_type=ent_type,
            is_oov=is_oov,
            is_stop=is_stop,
        )
        cur_word.word_created = word_created
        return cur_word

    @functools.lru_cache()
    def get_feature(self, **kwargs):
        """
        Unlimited cache for features. Logic for settings human-readable explanataions
        impplemented here.
        """
        name = kwargs.pop("name")
        value = kwargs.pop("value")
        lang = kwargs.pop("lang")
        feature, feature_created = Feature.objects.get_or_create(
            name=name, value=value, lang=self.lang
        )
        if feature_created:
            description = self.describe_feature(name, value)
            if isinstance(description, str) and len(description) > 0:
                feature.description = description
                feature.save()
        return feature

    @staticmethod
    def get_validation_data(doc: Doc) -> ValidationData:
        """
        For now return propriety naively computed as fraction of "PROPN" or "X",
        as well as the 'real' length as measured in non-PUNCT tokens.
        This is held in a namedtuple called ValidationData.
        Later may return a more sophisticated collection of grammatical data.
        """
        doc = [t for t in doc if t.pos_ != "PUNCT"]
        propx = list((filter(lambda t: t.pos_ == "PROPN" or t.pos_ == "X", doc)))
        try:
            #  NOTE: length of doc could be zero
            return ValidationData(propriety=len(propx) / len(doc), length=len(doc))
        except ZeroDivisionError:
            raise PhraseRejectException

    def compute_occurences(self):
        """
        Compute the number of occurences of each word. on the corpus.
        """
        # TODO: When multiple corpora will be used, this will need to update the existing
        #  count, as opposed to computing the whole corpus word count
        progress: Bar = Bar(
            f"Computing counts of {self.lang.name} words",
            max=Word.objects.count(),
        )
        for w in Word.objects.filter(lang__lid=self.lid):
            # FIXME: This query is wrong. It does not account for a word appearing in a
            #  phrase multiple times, and therefore undercounts significantly
            w.corpus_occurences += w.phrase_set.filter(pair_from__source="SD").count()
            w.save()
            progress.next()
        progress.finish()

    @staticmethod
    def describe_feature(name, value):
        """Yield human-facing textual description of a feature."""
        return feature_description_dict.get((name, value), f"{name}={value}")


#  TODO 10/02/20 psacawa: get a more robust solution for these data
#  supporting multiple locales
feature_description_dict = {
    ("AdpType", "Prep"): "preposition",
    ("AdpType", "Preppron"): "prepositional pronoun",
    ("AdvType", "Ex"): "existential adverb",
    ("AdvType", "Tim"): "time adverb",
    ("Aspect", "Perf"): "perfect aspect",
    ("Aspect", "Prog"): "progressive aspect",
    ("Case", "Acc"): "accusative case",
    ("Case", "Com"): "conjunctive case",
    ("Case", "Dat"): "dative case",
    ("Case", "Nom"): "nominative case",
    ("ConjType", "Cmp"): "comparing conjunction",
    ("Definite", "Def"): "definite",
    ("Definite", "Def"): "definite",
    ("Definite", "Ind"): "indefinite",
    ("Degree", "Abs"): "absolute superlative",
    ("Degree", "Cmp"): "comparative",
    ("Degree", "Pos"): "positive",
    ("Degree", "Sup"): "absolute superlative",
    ("Gender", "Fem"): "femininine gender",
    ("Gender", "Masc"): "masculine gender",
    ("Gender", "Neut"): "neuter gender",
    ("Mood", "Cnd"): "conditional mood",
    ("Mood", "Imp"): "imperative mood",
    ("Mood", "Ind"): "indicative mood",
    ("Mood", "Sub"): "subjunctive mood",
    ("NounType", "Prop"): "",
    ("Number", "Plur"): "plural",
    ("Number", "Sing"): "singular",
    ("Number[psor]", "Plur"): "plural possessor",
    ("Number[psor]", "Sing"): "singular possessor",
    ("NumForm", "Digit"): "digits",
    ("NumType", "Card"): "cardinal",
    ("NumType", "Frac"): "fraction",
    ("NumType", "Ord"): "ordinal",
    ("Person", "1"): "first person",
    ("Person", "2"): "second person",
    ("Person", "3"): "third person",
    ("Polarity", "Neg"): "negative",
    ("Polite", "Form"): "polite form",
    ("Poss", "Yes"): "possesive",
    ("PrepCase", "Npr"): "non-prepositional case",
    ("PrepCase", "Pre"): "prepositional case",
    ("PronType", "Art"): "article",
    ("PronType", "Dem"): "demonstrative pronoun",
    ("PronType", "Ind"): "indicative pronoun",
    ("PronType", "Int"): "interrogative pronoun",
    ("PronType", "Neg"): "negative pronoun",
    ("PronType", "Prs"): "personal pronoun",
    ("PronType", "Rel"): "relative pronoun",
    ("PronType", "Tot"): "universal pronoun",
    ("Reflex", "Yes"): "reflexive",
    ("Tense", "Fut"): "future tense",
    ("Tense", "Imp"): "imperfect tense",
    ("Tense", "Past"): "preterite tense",
    ("Tense", "Pres"): "present tense",
    ("VerbForm", "Fin"): "finite verb form",
    ("VerbForm", "Ger"): "present particle",
    ("VerbForm", "Inf"): "infinitive verb form",
    ("VerbForm", "Part"): "past particle",
    ("VerbType", "Mod"): "modal verb",
}


class NLPModelLoadError(Exception):
    pass


class PhraseRejectException(Exception):
    pass
