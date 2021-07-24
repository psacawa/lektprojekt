# Generated by Django 3.2.3 on 2021-07-24 05:37

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("lekt", "0019_auto_20210720_1609"),
    ]

    operations = [
        migrations.AddField(
            model_name="userprofile",
            name="level",
            field=models.CharField(
                choices=[("free", "free"), ("premium", "premium"), ("test", "test")],
                default="free",
                max_length=10,
            ),
        ),
    ]
