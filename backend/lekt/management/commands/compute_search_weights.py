from argparse import ArgumentParser
from os.path import join

from django.conf import settings
from django.core.management import BaseCommand
from django.db import connection


class Command(BaseCommand):
    help = """
    (Re)compute tf-idf weights for relevancy search. This powers all views that depend on
    searching phrase pairs for a large number of features prenent in them.
    """

    def add_arguments(self, parser: ArgumentParser):
        parser.add_argument("-a", "--all", action="store_true")
        parser.add_argument("-c", "--corpus", type=str)

    def handle(self, *args, all=None, corpus=None, **kwargs):
        script_file = join(settings.BASE_DIR, "lekt", "sql", "search.sql")
        script = open(script_file).read()
        with connection.cursor() as cursor:
            cursor.execute(script)
            print("Computing lexeme weights...")
            cursor.execute("CALL compute_lexeme_weights ();")
            print("Computing feature weights...")
            cursor.execute("CALL compute_feature_weights ();")
            print("Computing observable weights...")
            cursor.execute("CALL compute_observable_weights ();")
