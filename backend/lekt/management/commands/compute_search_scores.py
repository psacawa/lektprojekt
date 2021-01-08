from os.path import join

from django.conf import settings
from django.core.management import BaseCommand
from django.db import connection


class Command(BaseCommand):
    help = """
    (Re)compute tf-idf weights for relevancy search. This powers all views that depend on
    searching phrase pairs for a large number of features prenent in them.
    """

    def handle(self, *args, **kwargs):
        script_file = join(settings.BASE_DIR, "lekt", "sql", "search.sql")
        script = open(script_file).read()
        with connection.cursor() as cursor:
            cursor.execute(script)
