# Generated by Django 3.1.4 on 2021-02-17 20:40

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("lekt", "0011_auto_20210217_1549"),
    ]

    operations = [
        migrations.RenameField(
            model_name="observable",
            old_name="observable_id",
            new_name="id",
        ),
    ]
