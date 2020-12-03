from django.core.management.base import BaseCommand
from tabulate import tabulate
from lekt import models


class Command(BaseCommand):
    help = "Print statistics of lekt models."

    def add_arguments(self, parser):
        pass

    def handle(self, *args, **options):
        models_to_print = [
            models.Language,
            models.Voice,
            models.Phrase,
            models.Word,
            models.Annotation,
            models.Subscription,
            models.TrackedItem,
            models.TrackedWord,
            models.TrackedAnnotation,
            models.UserProfile,
        ]
        data = [[m._meta.object_name, m.objects.count()] for m in models_to_print]
        print(tabulate(data, headers=["model name", "count"]))
