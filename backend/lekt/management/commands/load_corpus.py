import logging
import sys
from argparse import ArgumentParser
from os.path import isfile, join

from django.conf import settings
from django.core.management.base import BaseCommand
from django.db import transaction

from lekt.loaders import CorpusManager, EnglishParser, SpanishParser
from lekt.models import Corpus, Phrase, PhrasePair

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)


class Command(BaseCommand):
    help = """\
    Manage parallel corpora, loading/reloading them into the default database and deleting
    them. 

    The corpora are in the format SQLite databases with two tables "phrases", "meta"
    of a particular schema (cf. examples among assets). The tables contain the raw data
    and metadata respectively.
    """

    output_transaction = True

    def add_arguments(self, parser: ArgumentParser):
        parser.add_argument("corpus", help="SQLite database containing corpus")
        parser.add_argument(
            "--limit",
            "-l",
            type=int,
            nargs="?",
            help="Limit on number of phrase pairs to load",
        )
        parser.add_argument(
            "--reload",
            "-r",
            action="store_true",
            help="Reload a corpus when it's already present, erasing existing items",
        )
        parser.add_argument(
            "--delete",
            "-d",
            action="store_true",
            help="""Delete an active corpus instead of loading it.""",
        )
        model_selection_group = parser.add_argument_group(
            "model selection arguments", "Parameter controlling model selection"
        )
        model_selection_group.add_argument(
            "--size",
            "-s",
            choices=["lg", "md", "sm"],
            help="Size of models to work with",
        )
        for lang in ["lang1", "lang2"]:
            model_selection_group.add_argument(
                f"--{lang}-size",
                choices=["lg", "md", "sm"],
                help=f"Size of {lang} model to work with",
            )
            model_selection_group.add_argument(
                f"--{lang}-model",
                help=f"Model of {lang} to work with",
            )

    def handle(
        self,
        corpus: str,
        limit=None,
        delete=False,
        reload=False,
        size=None,
        lang1_size=None,
        lang1_model=None,
        lang2_size=None,
        lang2_model=None,
        **kwargs,
    ):
        logger.debug(corpus)
        if delete:
            self.remove(corpus)
        else:
            corpus_file = Command.resolve_corpus_file(corpus)
            corpus_manager = CorpusManager(
                corpus,
                size=size,
                lang1_size=lang1_size,
                lang1_model=lang1_model,
                lang2_size=lang2_size,
                lang2_model=lang2_model,
            )
            corpus_manager.load(limit=limit, reload=reload)

    @staticmethod
    def resolve_corpus_file(filename):
        """
        Check some locations for the filename file. If it's not found, print an error
        message.
        """
        if isfile(filename):
            pass
        elif isfile(join(settings.ASSET_DIR, filename)):
            filename = join(settings.ASSET_DIR, filename)
        else:
            print(
                f"""Couldn't find {filename}. Assets are sought relative to current
                    directory and ASSET_DIR={settings.ASSET_DIR}"""
            )
            sys.exit()
        return filename

    def remove(self, name: str):
        corpus = Corpus.objects.get(name__iexact=name)
        Phrase.objects.filter(pair_from__source=corpus).delete()
        PhrasePair.objects.filter(source=corpus).delete()
        corpus.delete()
