from django.core.checks import Tags, Warning, register
from django.db import close_old_connections, connection

from .models import Corpus, Language, Voice


def initial_migration_available():
    """Before querying the ORM, checks if models are represented in the database by
    querying the django_migrations table."""
    with connection.cursor() as cursor:
        cursor.execute("select tablename from pg_catalog.pg_tables ")
        tables = [record[0] for record in cursor.fetchall()]
        if "django_migrations" not in tables:
            return False
        cursor.execute("select count(*) from django_migrations")
        count = cursor.fetchall()[0][0]
    return count > 0


@register(Tags.models)
def corpus_data_check(app_configs, **kwargs):
    warnings = []
    if not initial_migration_available():
        return []
    if Corpus.objects.count() == 0:
        warnings.append(
            Warning(
                "No corpora detected in the database.",
                hint="Use the load_corpus command to load data into the database to "
                "serve, e.g.\n\t\tpython3 manage.py load_corpus mycorpus.sqlite",
                id="lekt.W001",
            )
        )
    # without close_old_connections we get the "database is being used" exception
    close_old_connections()
    return warnings


@register(Tags.models)
def language_data_check(app_configs, **kwargs):
    warnings = []
    if not initial_migration_available():
        return []
    if Language.objects.count() == 0 or Voice.objects.count() == 0:
        warnings.append(
            Warning(
                "No data for Language, Voice models detected",
                hint="Use the load_languages command to load data for the Language and Voice"
                "models. These data will also be loaded automatically by laod_corpus.",
                id="lekt.W002",
            )
        )
    close_old_connections()
    return warnings
