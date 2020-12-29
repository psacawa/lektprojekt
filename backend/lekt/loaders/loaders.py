import json
import logging
import sqlite3
import sys
from collections import namedtuple
from math import sqrt
from os.path import join
from typing import List

from django.conf import settings
from django.db import IntegrityError, connection, transaction
from progress.bar import Bar

from lekt import models
from lekt.loaders.language import LanguageParser, NLPModelLoadError, parser_dict
from lekt.models import Corpus, Language, Phrase, PhrasePair, Word

logger = logging.getLogger(__name__)

ValidationData = namedtuple("ValidationData", ["length", "propriety"])


class CorpusManager(object):

    parsers: List[LanguageParser] = []

    def __init__(
        self,
        corpus,
        **kwargs,
    ):
        logger.debug(f"{self.__class__.__name__} kwargs={kwargs}")
        self.corpus = corpus
        self.connection = sqlite3.connect(f"file:{corpus}?mode=ro", uri=True)
        self.lids = self.connection.execute("select lang1, lang2 from meta").fetchone()
        self.langs = [Language.objects.get(lid=lid) for lid in self.lids]
        self.name = self.connection.execute("select name from meta").fetchone()[0]
        self.domain = self.connection.execute("select domain from meta").fetchone()[0]
        self.init_corpus()
        self.init_parsers(**kwargs)

    def init_corpus(self):
        self.corpus, self.created = Corpus.objects.get_or_create(
            name=self.name, domain=self.domain
        )
        if self.created:
            self.corpus.languages.add(*self.langs)

    def init_parsers(self, **kwargs):
        """Set the parsers(pipelines) involved"""

        # mark whether the first of the two models was absent
        model_was_absent = False
        for i, lid in enumerate(self.lids):
            #  divide kwargs like lang1_size="md" between parser[0]/parser[1]
            parser_kwargs = {
                k.split("_")[1]: v for k, v in kwargs.items() if str(i + 1) in k
            }

            if kwargs.get("size", None):
                parser_kwargs["size"] = kwargs["size"]

            #  if a model was already not found, don't bofther actually loading the other
            if model_was_absent:
                kwargs["test_only"] = True
            try:
                self.parsers.append(
                    parser_dict.get(lid, LanguageParser)(**parser_kwargs)
                )
            except NLPModelLoadError as e:
                model_was_absent = True

        if model_was_absent:
            sys.exit()

    def remove(self):
        """Delete existing PhrasePairs/Phrases asssociated with the corpus"""
        Phrase.objects.filter(pair_from__source=self.corpus).delete()
        PhrasePair.objects.filter(source=self.corpus).delete()

    def load(self, reload=False, limit=None):
        """
        This is the entrypoint to the migration as called by RunPython
        """

        if not self.created and reload:
            self.remove()
        elif not self.created:
            print(
                f"Corpus {self.name} already present in database. Send --reload to reload from scratch"
            )
            sys.exit()

        select_cmd = "select * from phrases"
        if isinstance(limit, int):
            select_cmd += f" limit {limit}"
        else:
            limit = self.connection.execute("select count(*) from phrases").fetchone()[
                0
            ]

        # this is an instance of dependency injection, spacy if allowed to manage the raw
        # data because it can batch more efficiently
        records = self.connection.execute(select_cmd).fetchall()
        nlp_pipes = [
            self.parsers[i].get_pipe([record[i + 1] for record in records])
            for i in range(2)
        ]
        pipe = zip(*nlp_pipes)

        progress: Bar = Bar(f"Processing parallel corpus", max=limit)
        for doc_pair in pipe:
            phrases = []
            for i, doc in enumerate(doc_pair):
                phrases.append(self.parsers[i].process_phrase(doc))

            active = self.valid_phrase_pair(*phrases)
            PhrasePair.objects.bulk_create(
                [
                    PhrasePair(
                        base=phrases[0],
                        target=phrases[1],
                        source=self.corpus,
                        active=active,
                    ),
                    PhrasePair(
                        base=phrases[1],
                        target=phrases[0],
                        source=self.corpus,
                        active=active,
                    ),
                ]
            )
            progress.next()

        progress.finish()

    def create_corpus(self):
        """Add corpus model to database."""
        corpus: Corpus = Corpus.objects.create(name=self.name, domain=self.domain)
        corpus.languages.add(Language.objects.filter(lid__in=self.langs))
        return corpus

    def process_phrasepair(self, *phrase_texts):
        assert len(phrase_texts) == 2, "Phrase pair must have two elements"
        phrases = []
        for i, text in enumerate(phrase_texts):
            phrases.append(self.parsers[i].process_phrase(text=text))

        active = self.valid_phrase_pair(*phrases)
        PhrasePair.objects.bulk_create(
            [
                PhrasePair(
                    base=phrases[0],
                    target=phrases[1],
                    source=self.corpus,
                    active=active,
                ),
                PhrasePair(
                    base=phrases[1],
                    target=phrases[0],
                    source=self.corpus,
                    active=active,
                ),
            ]
        )

    def valid_phrase_pair(self, *phrases) -> bool:
        """
        Validates a phrase pair for suitability for active inclusion in the database.
        Invalid pairs are still included, but with 'active' attribute False.
        """
        validation_data = [phrase.validation_data for phrase in phrases]
        l2_prop = sqrt(
            validation_data[0].propriety ** 2 + validation_data[1].propriety ** 2
        )
        avg_len = (validation_data[0].length + validation_data[1].length) / 2

        #  arbitrary criterion
        valid = l2_prop < 0.4 and avg_len >= 4
        if not valid:
            logger.debug(
                f"Found invalid phrase pair: {phrases[0].text} {phrases[1].text}"
            )

        return valid


class PollyLoader(object):
    """
    import languages and accents from voices.json
    which is the output generated by:

    > aws --output json polly describe-voices
    """

    VOICE_DATA_SOURCE = join(settings.ASSET_DIR, "voices.json")
    assigned_voices = {("en", "Joanna"), ("es", "Lucia")}

    def __init__(self, apps):

        try:
            with open(self.VOICE_DATA_SOURCE) as voices_file:
                self.voices_json = json.loads(voices_file.read())
        except Exception as e:
            logger.error(f"Failure to read from {self.VOICE_DATA_SOURCE}")
            raise

        self.new_languages = []
        self.new_voices = []

        logger.info(f"Obtaining historal models Language, Voice.")
        self.Language = apps.get_model("lekt", "Language")
        self.Voice = apps.get_model("lekt", "Voice")

    def __call__(self):
        self.import_polly()
        self.assign_default_voices()

    def import_polly(self):

        progress = Bar("Importing voices", max=len(self.voices_json["Voices"]))
        for voice in self.voices_json["Voices"]:
            voice_name = voice["Id"]
            gender = voice["Gender"][0]
            aid = voice["LanguageCode"]
            accent_name: str = voice["LanguageName"]
            if len(accent_name.split()) == 1:
                base_lang_name = accent_name
            else:
                base_lang_name = accent_name.split()[1]
            lid = aid[:2]
            logger.debug(
                f"Processing {voice_name} ({gender}) who is {accent_name} ({aid}), "
                f"a dialect of {base_lang_name} ({lid})."
            )

            lang_query = self.Language.objects.filter(lid=lid)
            if lang_query.count() == 0:
                cur_lang = self.Language(name=base_lang_name, lid=lid)
                logger.debug(f"new language found: {cur_lang}")
                self.new_languages.append(cur_lang)
                cur_lang.save()
            else:
                cur_lang = lang_query[0]

            cur_voice = self.Voice(
                lang=cur_lang,
                name=voice_name,
                accent=accent_name,
                aid=aid,
                gender=gender,
            )
            self.new_voices.append(cur_voice)
            cur_voice.save()
            progress.next()
        progress.finish()

    def assign_default_voices(self):
        """docstring for assign_default_voices"""

        for lang in self.Language.objects.all():
            if lang.lid in self.assigned_voices:
                try:
                    voice = self.Voice.objects.get(name=self.assigned_voices[lang.lid])
                except KeyError as e:
                    logger.error(
                        f"Voice {self.assigned_voices[lang.lid]}"
                        "for {lang} not found in database."
                    )
            else:
                try:
                    voice = lang.voice_set.order_by("id")[0]
                except Exception as e:
                    logger.error(f"{__module__}: No voices attached to {lang}.")
                    raise e
            lang.default_voice = voice
            logger.debug(f"Setting {lang.lid} default voice to {voice.name}")
            lang.save()
