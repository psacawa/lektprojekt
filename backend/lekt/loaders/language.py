import functools
import importlib
import logging
import re
import sys
from collections import namedtuple
from functools import lru_cache
from string import Template
from typing import Tuple

import spacy
from django.core.exceptions import MultipleObjectsReturned
from django.db import IntegrityError, transaction
from django.db.models import Model
from progress.bar import Bar
from spacy.tokens import Doc

from lekt.models import Annotation, Language, Lexeme, Phrase, PhraseWord, Word

ValidationData = namedtuple("ValidationData", ["length", "propriety"])
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)


class LanguageParser(object):
    """
    This class is repsponible for parsing the documents attached to a particular
    language and maintains references to the data pertaining to that language:
    NLP model, django model, etc.
    Created django models of the class `Word` and `Annotation` are cached
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
    modelname: str = None
    modelname_template: Template = None

    def __init__(self, size=None, modelname=None, test_only=False, **kwargs):

        assert isinstance(self.lid, str) and isinstance(
            self.modelname_template, Template
        ), (
            " LanguageParser subclasses must define 'lid' and 'modelname_template'"
            "attributes."
        )
        # select a model prioritizing kwargs passed in precedence of their specificity
        if modelname is not None:
            self.modelname = modelname
        elif size is not None:
            self.modelname = self.modelname_template.substitute(lid=self.lid, size=size)
        else:
            candidate_modelnames = [
                self.modelname_template.substitute(lid=self.lid, size=size)
                for size in ["lg", "md", "sm"]
            ]
            # attempt to find each of the candidate models
            for modelname in candidate_modelnames:
                if importlib.util.find_spec(modelname):
                    self.modelname = modelname
                    break
            if self.modelname is None:
                print(
                    f"None of the spacy models {','.join(candidate_modelnames)} detected"
                )
                raise NLPModelLoadError()
        print(f"Selected model {self.modelname}")
        print("Obtaining model...")
        try:
            self.lang = Language.objects.get(lid=self.lid)
        except IntegrityError as e:
            logger.error("Languages {self.lid} not created yet.")
            raise

        if importlib.util.find_spec(self.modelname):
            if not test_only:
                self.nlp = spacy.load(self.modelname)
        else:
            print(f"Unable to find Spacy model {self.modelname}.")
            raise NLPModelLoadError()

    def process_phrase(self, text: str) -> Tuple[Model, ValidationData]:
        with transaction.atomic():
            phrase = Phrase.objects.create(text=text, lang=self.lang)
            doc = self.nlp(text)
            validation_data = self.get_validation_data(doc)
            cur_phrase_words = []
            for i, token in enumerate(doc):

                text = token.orth_
                lemma = token.lemma_
                norm = token.norm_
                pos = token.pos_
                tag: str = token.tag_
                ent_type = token.ent_type_
                is_oov = token.is_oov
                is_stop = token.is_stop
                prob = token.prob

                # TODO: ad hoc filtration logic, should be refactored
                if pos == "PUNCT":
                    continue
                # this is here to deal with the "-PRON-" issue
                if lemma == "-PRON-":
                    lemma = norm
                # this is still necessary; lemmtziation does nothing normalize capitalization
                lemma = lemma.lower()

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
                    annot_values = self.parse_annotations(tag)

                    annots = {
                        self.get_annotation(value=value, lang=self.lang)
                        for value in annot_values
                    }
                    cur_word.annotations.add(*annots)

                cur_phrase_words.append(
                    PhraseWord(word=cur_word, phrase=phrase, number=i)
                )
                #  try:
                #      phrase.words.add(cur_word, through_defaults={"number": i})
                #  except ValueError as e:
                #      logger.critical(f"Failed to add {cur_word} to phrase")
                #      raise e
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
        ent_type=None,
        is_oov=None,
        is_stop=None,
    ):
        cur_word, word_created = Word.objects.get_or_create(
            lexeme=lexeme,
            norm=norm,
            tag=tag,
            ent_type=ent_type,
            is_oov=is_oov,
            is_stop=is_stop,
        )
        cur_word.word_created = word_created
        return cur_word

    @functools.lru_cache()
    def get_annotation(self, **kwargs):
        """
        Unlimited cache for annotations. Logic for settings human-readable explanataions
        impplemented here.
        """
        value = kwargs.pop("value")
        lang = kwargs.pop("lang")
        annot, annot_created = Annotation.objects.get_or_create(
            value=value, lang=self.lang
        )
        if annot_created:
            explanation = self.explain_annotation(value)
            if isinstance(explanation, str) and len(explanation) > 0:
                annot.explanation = explanation
                annot.save()
            logger.debug(f"")
        return annot

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
        return ValidationData(propriety=len(propx) / len(doc), length=len(doc))

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

    def parse_annotations(self, tag: str):
        """
        For models en_core_web_* and other language models, the Token.tag_ attribute
        contains the morphological data, so we return it in a list. This is treated a
        default behaviour.
        """
        return [tag]

    def explain_annotation(self, tag: str):
        """For some labelling schemes, spacy.explain has data"""
        return spacy.explain(tag)


class SpanishParser(LanguageParser):
    """Subclass for parsing with the family of models es-core-news-XX."""

    modelname_template = Template("${lid}_core_news_${size}")
    lid = "es"
    value_explanation_dict = {
        "Case=Acc": "accusative case",
        "Case=Com": "conjunctive case",
        "Case=Dat": "dative case",
        "Case=Nom": "nominative case",
        "Gender=Fem": "femininine gender",
        "Gender=Masc": "masculine gender",
        "Mood=Cnd": "conditional mood",
        "Mood=Imp": "imperative mood",
        "Mood=Ind": "indicative mood",
        "Mood=Sub": "subjunctive mood",
        "Person=1": "first person",
        "Person=2": "second person",
        "Person=3": "third person",
        "PronType=Art": "article",
        "PronType=Dem": "demonstrative pronoun",
        "PronType=Ind": "indicative pronoun",
        "PronType=Int": "interrogative pronoun",
        "PronType=Neg": "negative pronoun",
        "PronType=Prs": "personal pronoun",
        "PronType=Tot": "universal pronoun",
        "Number=Plur": "plural",
        "Number=Sing": "singular",
        "Poss=Yes": "possesive",
        "VerbForm=Fin": "finite verb form",
        "VerbForm=Ger": "present particle",
        "VerbForm=Inf": "infinitive verb form",
        "VerbForm=Part": "past particle",
        "Tense=Fut": "future tense",
        "Tense=Imp": "imperfect tense",
        "Tense=Past": "preterite tense",
        "Tense=Pres": "present tense",
    }
    #  AdpType=Prep
    #  AdpType=Preppron
    #  AdvType=Tim
    #  Definite=Def
    #  Definite=Ind
    #  Degree=Abs
    #  Degree=Cmp
    #  Degree=Sup
    #  Number[psor]=Plur
    #  Number[psor]=Sing
    #  NumForm=Digit
    #  NumType=Card
    #  NumType=Frac
    #  NumType=Ord
    #  Polarity=Neg
    #  Polite=Form
    #  PrepCase=Npr
    #  PrepCase=Pre
    #  Reflex=Yes

    @staticmethod
    @lru_cache()
    def parse_annotations(tag: str):
        """
        "VERB__Mood=Sub|Number=Sing|Person=3|Tense=Pres|VerbForm=Fin" ->
        [Mood=Sub, Number=Sing, Person=3, Tense=Pres, VerbForm=Fin]
        """
        tag_parts = re.split(r"__", tag)
        if len(tag_parts) == 2 and len(tag_parts[1]) > 0:
            annots = tag_parts[1].split("|")
            ret = []
            for annot in annots:
                # handle the PronType=Int,Rel case
                match = re.fullmatch("(\w+)=(\w+),(\w+)", annot)
                if match:
                    k, v1, v2 = match.groups()
                    if k == "Case":
                        ret.append(f"{k}={v1}")
                        ret.append(f"{k}={v2}")
                    else:
                        ret.append(f"{k}={v1}")
                else:
                    ret.append(annot)
            return ret
        else:
            return []

    def explain_annotation(self, value: str):
        """ spacy does not explain es_core_news_md annotations"""
        return (
            self.value_explanation_dict[value]
            if value in self.value_explanation_dict
            else value
        )


class EnglishParser(LanguageParser):
    """Subclass for parsing with the family of models en-core-web-XX."""

    modelname_template = Template("${lid}_core_web_${size}")
    lid = "en"


class PolishParser(LanguageParser):
    """Subclass for parsing with the family of models pl-core-news-*."""

    modelname_template = Template("${lid}_core_news_${size}")
    lid = "pl"


class NLPModelLoadError(Exception):
    pass
