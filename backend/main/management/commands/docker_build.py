import subprocess

from django.conf import settings
from django.core.management import BaseCommand


class Command(BaseCommand):
    help = f"""Add {settings.DOMAIN} to the sites table"""

    def handle(self, **kwargs):
        subprocess.run("docker build -t lektprojekt-backend-image .".split(" "))
