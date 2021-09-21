# Generated by Django 3.2.6 on 2021-08-27 19:35

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("lekt", "0004_observableweight_asdf"),
    ]

    operations = [
        migrations.RemoveConstraint(
            model_name="lexemeweight",
            name="lekt_lexeme_weight_unique",
        ),
        migrations.RemoveConstraint(
            model_name="observableweight",
            name="asdf",
        ),
        migrations.AddConstraint(
            model_name="lexemeweight",
            constraint=models.UniqueConstraint(
                fields=("base_lang", "target_lang", "lexeme", "phrasepair"),
                name="lekt_lexemeweight_unique",
            ),
        ),
        migrations.AddConstraint(
            model_name="observableweight",
            constraint=models.UniqueConstraint(
                fields=("base_lang", "target_lang", "observable", "phrasepair"),
                name="lekt_observableweight_unique",
            ),
        ),
    ]