# Generated by Django 3.1.4 on 2021-02-10 22:26

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("lekt", "0003_auto_20210210_2204"),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name="word",
            unique_together={
                ("norm", "lexeme", "tag", "morph", "ent_type", "is_oov", "is_stop")
            },
        ),
    ]