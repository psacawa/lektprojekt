from django.core.management.base import BaseCommand
from argparse import ArgumentParser
from os.path import join, isfile
from django.conf import settings
from lekt.loaders import SpacyCorpusLoader, EnglishParser, SpanishParser

import logging

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)


class Command(BaseCommand):
    help = "Load a parallel corpus into the default database."

    def add_arguments(self, parser: ArgumentParser):
        parser.add_argument("corpus")
        parser.add_argument("--limit", type=int, nargs="?", default=None)

    def handle(self, *args, **options):
        logger.debug(options)
        corpus: str = options.get("corpus")
        if not corpus.endswith(".csv"):
            corpus += ".csv"
        if isfile(corpus):
            asset_file = corpus
        else:
            asset_file = join(settings.ASSET_DIR, corpus)

        limit = options.get("limit")

        sd_loader = SpacyCorpusLoader(
            parallel_corpus=asset_file, base=EnglishParser, target=SpanishParser,
        )
        sd_loader(limit=limit)
