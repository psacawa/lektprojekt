import os
import subprocess
from os.path import join

from django.conf import settings
from django.core.management import BaseCommand


class Command(BaseCommand):
    help = """Open DB with pglci"""

    def add_arguments(self, parser):
        parser.add_argument(
            "--database",
            default="default",
            help="Django name for Postgres database to open",
        )

    def handle(self, database, **kwargs):
        os.environ["PGPASSWORD"] = settings.DATABASES[database]["PASSWORD"]
        subprocess.run(
            "pgcli -h {host} -U {user} {db}".format(
                host=settings.DB_HOST,
                user=settings.DATABASES[database]["USER"],
                db=settings.DATABASES[database]["NAME"],
            ).split(" ")
        )
        #  FIXME 22/07/20 psacawa: password?
