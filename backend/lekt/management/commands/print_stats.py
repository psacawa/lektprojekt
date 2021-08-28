import shtab
from django.apps import apps
from django.core.management.base import BaseCommand
from tabulate import tabulate


class Command(BaseCommand):
    help = """Print basic statistics on the number of instances of an application's models
    present in the database. By default, statistics on lekt are printed."""

    def add_arguments(self, parser):
        parser.add_argument(
            "--app",
            default="lekt",
            type=str,
            help="App to show statistics for (default lekt)",
        )
        shtab.add_argument_to(parser, ["--print-completions"])

    def handle(self, app, **options):
        models = list(apps.get_app_config(app).get_models())
        data = list([m._meta.object_name, m.objects.count()] for m in models)
        print(tabulate(data, headers=["model name", "count"]))
