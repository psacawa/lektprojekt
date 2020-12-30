from argparse import ArgumentParser
from os.path import join

from django.conf import settings
from django.core.management.base import BaseCommand

from lekt.loaders import PollyLanguageLoader
from lekt.models import Language, Voice


class Command(BaseCommand):
    help = """
    Load languages and voices read from a json file into the current database. By default
    this will look for voices.json in ASSET_DIR, though a positional argument can be 
    provided. The file is expected to be in in the format of the output of
    aws --output json polly describe-voices
    """

    def add_arguments(self, parser: ArgumentParser):
        parser.add_argument(
            "--file",
            default=join(settings.ASSET_DIR, "voices.json"),
            help="json file with language/voice data",
        )

    def handle(self, **kwargs):
        if Language.objects.count() != 0 or Voice.objects.count() != 0:
            print(
                "There is already data for the Language and Voice models in the database."
                "This command doesn't gracefully reloading. To reset the whole database,"
                "use the reset_db command."
            )
            return
        polly_loader = PollyLanguageLoader()
        polly_loader()
