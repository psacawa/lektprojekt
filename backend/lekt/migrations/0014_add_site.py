from django.conf import settings
from django.contrib.sites.models import Site
from django.db import migrations


def forwards(apps, schema_editor):
    Site.objects.create(id=100, domain=settings.DOMAIN, name="LektProjekt")


def backwards(apps, schema_editor):
    Site.objects.get(domain=settings.DOMAIN).delete()


class Migration(migrations.Migration):

    dependencies = [
        ("lekt", "0013_auto_20210225_0826"),
    ]

    operations = [migrations.RunPython(forwards, backwards)]
