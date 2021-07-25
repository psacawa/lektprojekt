from django.conf import settings
from django.contrib.sites.models import Site
from django.core.management import BaseCommand
from django.db.utils import IntegrityError


class Command(BaseCommand):
    help = f"""Add {settings.WEB_DOMAIN} to the sites table"""

    def handle(self, **kwargs):
        site, created = Site.objects.get_or_create(id=100)
        if site.domain != settings.WEB_DOMAIN:
            created = True
        site.domain = settings.WEB_DOMAIN
        site.name = settings.SITE_NAME
        site.save()
        if created:
            print(f"{settings.WEB_DOMAIN} added to Sites table")
        else:
            print(f"{settings.WEB_DOMAIN} already in Sites table")
