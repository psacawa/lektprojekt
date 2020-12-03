from django.core.management.base import BaseCommand
from os.path import join
import psycopg2
from psycopg2.extensions import connection
from django.conf import settings
from django.apps import apps
import logging

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)


class Command(BaseCommand):
    help = "Load a parallel corpus into the default database."

    def handle(self, *args, **options):
        logger.debug(options)
        sql = self.get_views_SQL()

        NAME = settings.DATABASES["default"]["NAME"]
        USER = settings.DATABASES["default"]["USER"]
        PASSWORD = settings.DATABASES["default"]["PASSWORD"]
        #  conn_string = f"dbname={NAME} user={USER} password={PASSWORD}"
        # TODO: investigate this DB auth issue
        conn_string = f"dbname={NAME} user=psacawa password={PASSWORD}"
        logger.debug(f"Connecting with: {conn_string}")

        with psycopg2.connect(conn_string) as conn:
            with conn.cursor() as cur:
                cur.execute(sql)

        conn.close()

    def get_views_SQL(self):
        """Get the raw SQL to create indices. This involves access sql/views.sql """
        file_path = join(apps.get_app_config("lekt").path, "sql", "views.sql")
        raw_sql = open(file_path, "r").read()
        return raw_sql
