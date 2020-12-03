from django.db import migrations
from django.db.migrations import RunPython

from lekt.loaders.loaders import PollyLoader

def forwards(apps, schema_editor):
    """Load languages, voices, and assign defaults."""
    polly_loader = PollyLoader(apps)
    polly_loader()


class Migration(migrations.Migration):
    """ Migration to create Language and Voice objects as supported by AWS Polly """

    dependencies = [("lekt", "0001_initial")]

    operations = [
        migrations.RunPython(forwards, reverse_code=RunPython.noop, elidable=True)
    ]
