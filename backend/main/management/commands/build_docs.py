import subprocess
from os.path import join

from django.core.management import BaseCommand


class Command(BaseCommand):
    help = """Rebuild the documentation in ../docs/ directory"""

    def add_arguments(self, parser):
        parser.add_argument(
            "--output-dir",
            default="build",
            help="Folder in ../docs to put built static files into",
        )

    def handle(self, output_dir, **kwargs):
        subprocess.run(["sphinx-build", "../docs", join("..", "docs", output_dir)])
