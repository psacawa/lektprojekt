import logging
import sys
from argparse import ArgumentParser
from os.path import isfile, join

import spacy
from django.conf import settings
from django.contrib.sites.models import Site
from django.core.management import call_command
from django.core.management.base import BaseCommand
from django.db import transaction

from lekt.loaders import CorpusManager
from lekt.models import Corpus, Language, Phrase, PhrasePair, Voice

logger = logging.getLogger(__name__)


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
            choices=["lg", "md", "sm", "trf"],
            help="Size of models to work with",
        )
        for lang in ["lang1", "lang2"]:
            model_selection_group.add_argument(
                f"--{lang}-size",
                choices=["lg", "md", "sm", "trf"],
                help=f"Size of {lang} model to work with",
            )
            model_selection_group.add_argument(
                f"--{lang}-model",
                help=f"Model of {lang} to work with",
            )
        parser.add_argument(
            "--compute-weights",
            type=bool,
            default=True,
            help="wether to run SQL script to refresh search weights",
        )
        parser.add_argument(
            "--gpu",
            "-g",
            type=bool,
            default=False,
            help="Allocate model memory on GPU (doesn't help speed)",
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
        compute_weights=None,
        gpu=None,
        **kwargs,
    ):

        if gpu:
            spacy.require_gpu()

        try:
            Site.objects.get(domain=f"{settings.DOMAIN}")
        except:
            print(f"{settings.DOMAIN} site absent...Automatically loading")
            call_command("create_site")

        if Language.objects.count() == 0 or Voice.objects.count() == 0:
            print("Language, Voice data not detected...Automatically creating")
            call_command("load_languages")

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

        if compute_weights:
            print("Recomputing search weights...")
            call_command("compute_search_weights")

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
