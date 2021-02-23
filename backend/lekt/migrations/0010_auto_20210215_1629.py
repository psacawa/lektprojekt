# Generated by Django 3.1.4 on 2021-02-15 16:29

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("lekt", "0009_auto_20210215_1517"),
    ]

    operations = [
        migrations.AlterField(
            model_name="featureweight",
            name="feature",
            field=models.ForeignKey(
                db_column="observable_id",
                on_delete=django.db.models.deletion.RESTRICT,
                to="lekt.feature",
            ),
        ),
        migrations.AlterField(
            model_name="lexemeweight",
            name="lexeme",
            field=models.ForeignKey(
                db_column="observable_id",
                on_delete=django.db.models.deletion.RESTRICT,
                to="lekt.lexeme",
            ),
        ),
    ]
