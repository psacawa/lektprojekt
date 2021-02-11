# Generated by Django 3.1.4 on 2021-02-10 22:04

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("lekt", "0002_auto_20210210_2041"),
    ]

    operations = [
        migrations.AddField(
            model_name="feature",
            name="name",
            field=models.CharField(
                default="",
                help_text="value of Feature as attached by Spacy to the processed token, \n        e.g. PronType",
                max_length=20,
                verbose_name="Feature name",
            ),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name="feature",
            name="value",
            field=models.CharField(
                help_text="value of POS/tag as attached by Spacy to the processed token, \n        e.g. Sub in Mood=Sub",
                max_length=20,
                verbose_name="Feature value",
            ),
        ),
    ]
