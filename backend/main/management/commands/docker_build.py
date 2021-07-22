import subprocess

from django.conf import settings
from django.core.management import BaseCommand


class Command(BaseCommand):
    help = f"""Build docker container locally"""

    def handle(self, **kwargs):
        subprocess.run("docker build -t lekt-backend-image .".split(" "))
