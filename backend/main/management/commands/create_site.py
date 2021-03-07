from django.conf import settings
from django.contrib.sites.models import Site
from django.core.management import BaseCommand
from django.db.utils import IntegrityError


class Command(BaseCommand):
    help = """Add www.lektprojekt.com to the sites table"""

    def handle(self, **kwargs):
        try:
            Site.objects.create(id=100, domain=settings.DOMAIN, name="LektProjekt")
        except IntegrityError as e:
            print("Site is already in the Sites table")
        else:
            print("f{settings.DOMAIN} added to Sites table")
