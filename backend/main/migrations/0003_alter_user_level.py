# Generated by Django 3.2.5 on 2021-08-04 20:24

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("main", "0002_auto_20210804_1529"),
    ]

    operations = [
        migrations.AlterField(
            model_name="user",
            name="level",
            field=models.CharField(
                choices=[("basic", "basic"), ("plus", "plus")],
                default="basic",
                max_length=20,
            ),
        ),
    ]
