# Generated by Django 3.1.4 on 2021-02-17 15:49

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("lekt", "0010_auto_20210215_1629"),
    ]

    operations = [
        migrations.AlterField(
            model_name="featureweight",
            name="feature",
            field=models.ForeignKey(
                db_column="feature_id",
                on_delete=django.db.models.deletion.RESTRICT,
                to="lekt.feature",
            ),
        ),
        migrations.AlterField(
            model_name="lexemeweight",
            name="lexeme",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.RESTRICT, to="lekt.lexeme"
            ),
        ),
    ]