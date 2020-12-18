from argparse import ArgumentParser
from os.path import join

from django.conf import settings
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = """
    Load languages and voices read from a json file into the current database. By default
    this will look for voices.json in ASSET_DIR, though a positional argument can be 
    provided. The file is expected to be in in the format of the output of
    aws --output json polly describe-voices
    """

    def add_arguments(self, parser: ArgumentParser):
        parser.add_argument(
            "file",
            default=join(settings.ASSET_DIR, "voices.json"),
            help="json file with language/voice data",
        )

    def handle(self):
        pass
        #  TODO 03/12/20 psacawa: refactor to put loading voices here
