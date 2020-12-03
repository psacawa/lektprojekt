# Generated by Django 3.1.4 on 2020-12-03 23:40

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('contenttypes', '0002_remove_content_type_name'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Annotation',
            fields=[
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('id', models.AutoField(db_column='annot_id', primary_key=True, serialize=False)),
                ('value', models.CharField(max_length=20)),
                ('explanation', models.CharField(max_length=100, null=True)),
            ],
            options={
                'ordering': ['-created_at', '-updated_at'],
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='Language',
            fields=[
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('id', models.AutoField(db_column='lang_id', primary_key=True, serialize=False)),
                ('lid', models.CharField(max_length=10, unique=True)),
                ('name', models.CharField(max_length=50, unique=True)),
            ],
            options={
                'ordering': ['-created_at', '-updated_at'],
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='Phrase',
            fields=[
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('id', models.AutoField(db_column='phrase_id', primary_key=True, serialize=False)),
                ('text', models.CharField(max_length=500)),
                ('lang', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='lekt.language')),
            ],
            options={
                'ordering': ['-created_at', '-updated_at'],
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='Subscription',
            fields=[
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('id', models.AutoField(db_column='sub_id', primary_key=True, serialize=False)),
                ('base_lang', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='+', to='lekt.language')),
            ],
        ),
        migrations.CreateModel(
            name='TrackedItem',
            fields=[
                ('base_id', models.AutoField(db_column='titem_id', primary_key=True, serialize=False)),
                ('active', models.BooleanField(default=True)),
                ('polymorphic_ctype', models.ForeignKey(editable=False, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='polymorphic_lekt.trackeditem_set+', to='contenttypes.contenttype')),
                ('subscription', models.ForeignKey(db_column='sub_id', on_delete=django.db.models.deletion.CASCADE, to='lekt.subscription')),
            ],
            options={
                'abstract': False,
                'base_manager_name': 'objects',
            },
        ),
        migrations.CreateModel(
            name='Word',
            fields=[
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('id', models.AutoField(db_column='word_id', primary_key=True, serialize=False)),
                ('norm', models.CharField(max_length=50)),
                ('lemma', models.CharField(max_length=50)),
                ('pos', models.CharField(max_length=50)),
                ('tag', models.CharField(max_length=200)),
                ('ent_type', models.CharField(max_length=50)),
                ('is_oov', models.BooleanField()),
                ('is_stop', models.BooleanField()),
                ('prob', models.FloatField(default=0.0)),
                ('corpus_occurences', models.IntegerField(default=0)),
            ],
        ),
        migrations.CreateModel(
            name='WordAnnotation',
            fields=[
                ('id', models.AutoField(db_column='phraseword_id', primary_key=True, serialize=False)),
                ('annot', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='lekt.annotation')),
                ('word', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='lekt.word')),
            ],
            options={
                'db_table': 'lekt_word_annotations',
            },
        ),
        migrations.AddField(
            model_name='word',
            name='annotations',
            field=models.ManyToManyField(through='lekt.WordAnnotation', to='lekt.Annotation'),
        ),
        migrations.AddField(
            model_name='word',
            name='lang',
            field=models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='lekt.language'),
        ),
        migrations.CreateModel(
            name='Voice',
            fields=[
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('id', models.AutoField(db_column='voice_id', primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=50, unique=True)),
                ('accent', models.CharField(max_length=50)),
                ('aid', models.CharField(max_length=10)),
                ('gender', models.CharField(choices=[('M', 'Male'), ('F', 'Female')], max_length=10)),
                ('lang', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='lekt.language')),
            ],
            options={
                'ordering': ['-created_at', '-updated_at'],
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='UserProfile',
            fields=[
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('id', models.AutoField(db_column='userprofile_id', primary_key=True, serialize=False)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-created_at', '-updated_at'],
                'abstract': False,
            },
        ),
        migrations.AddField(
            model_name='subscription',
            name='base_voice',
            field=models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='+', to='lekt.voice'),
        ),
        migrations.AddField(
            model_name='subscription',
            name='owner',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='lekt.userprofile'),
        ),
        migrations.AddField(
            model_name='subscription',
            name='target_lang',
            field=models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='+', to='lekt.language'),
        ),
        migrations.AddField(
            model_name='subscription',
            name='target_voice',
            field=models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='+', to='lekt.voice'),
        ),
        migrations.CreateModel(
            name='PhraseWord',
            fields=[
                ('id', models.AutoField(db_column='phraseword_id', primary_key=True, serialize=False)),
                ('number', models.IntegerField()),
                ('phrase', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='lekt.phrase')),
                ('word', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='lekt.word')),
            ],
            options={
                'db_table': 'lekt_phrase_words',
                'ordering': ['number'],
            },
        ),
        migrations.AddField(
            model_name='phrase',
            name='words',
            field=models.ManyToManyField(through='lekt.PhraseWord', to='lekt.Word'),
        ),
        migrations.AddField(
            model_name='language',
            name='default_voice',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.PROTECT, to='lekt.voice'),
        ),
        migrations.AddField(
            model_name='annotation',
            name='lang',
            field=models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='lekt.language'),
        ),
        migrations.AlterUniqueTogether(
            name='word',
            unique_together={('norm', 'lemma', 'pos', 'tag', 'ent_type', 'is_oov', 'is_stop', 'lang')},
        ),
        migrations.CreateModel(
            name='TrackedWord',
            fields=[
                ('trackeditem_ptr', models.OneToOneField(auto_created=True, on_delete=django.db.models.deletion.CASCADE, parent_link=True, to='lekt.trackeditem')),
                ('id', models.AutoField(db_column='tword_id', primary_key=True, serialize=False)),
                ('word', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='lekt.word')),
            ],
            options={
                'abstract': False,
                'base_manager_name': 'objects',
            },
            bases=('lekt.trackeditem',),
        ),
        migrations.CreateModel(
            name='TrackedAnnotation',
            fields=[
                ('trackeditem_ptr', models.OneToOneField(auto_created=True, on_delete=django.db.models.deletion.CASCADE, parent_link=True, to='lekt.trackeditem')),
                ('id', models.AutoField(db_column='tannot_id', primary_key=True, serialize=False)),
                ('annotation', models.ForeignKey(db_column='annot_id', on_delete=django.db.models.deletion.PROTECT, to='lekt.annotation')),
            ],
            options={
                'abstract': False,
                'base_manager_name': 'objects',
            },
            bases=('lekt.trackeditem',),
        ),
        migrations.AlterUniqueTogether(
            name='subscription',
            unique_together={('owner', 'base_lang', 'target_lang')},
        ),
        migrations.CreateModel(
            name='PhrasePair',
            fields=[
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('id', models.AutoField(db_column='phrasepair_id', primary_key=True, serialize=False)),
                ('source', models.CharField(choices=[('SD', 'www.spanishdict.com'), ('GPT3', 'OpenAI GPT3')], max_length=10)),
                ('active', models.BooleanField(default=True)),
                ('base', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='pair_from', to='lekt.phrase')),
                ('target', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='pair_to', to='lekt.phrase')),
            ],
            options={
                'unique_together': {('base', 'target')},
            },
        ),
    ]
