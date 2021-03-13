from django.db import migrations


class Migration(migrations.Migration):
    """
    The ORM has the defect of not assigning primary key status to the PK in the derived
    models. This makes aggregate queries involving the derived classes impossible. This
    mgration patches them back in.
    """

    dependencies = [
        ("lekt", "0013_auto_20210225_0826"),
    ]

    operations = [
        migrations.RunSQL(
            sql="ALTER TABLE lekt_lexeme ADD primary key (observable_id);",
            reverse_sql="ALTER TABLE lekt_lexeme DROP CONSTRAINT lekt_lexeme_pkey;",
        ),
        migrations.RunSQL(
            sql="ALTER TABLE lekt_feature ADD primary key (observable_id);",
            reverse_sql="ALTER TABLE lekt_feature DROP CONSTRAINT lekt_feature_pkey;",
        ),
    ]
