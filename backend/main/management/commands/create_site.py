from django.conf import settings
from django.contrib.sites.models import Site
from django.core.management import BaseCommand
from django.db.utils import IntegrityError


class Command(BaseCommand):
    help = """Add www.lektprojekt.com to the sites table"""

    def handle(self, **kwargs):
        site, created = Site.objects.get_or_create(id=100)
        if site.domain != settings.DOMAIN:
            created = True
        site.domain = settings.DOMAIN
        site.name = "LektProjekt"
        site.save()
        if created:
            print(f"{settings.DOMAIN} added to Sites table")
        else:
            print(f"{settings.DOMAIN} already in Sites table")
