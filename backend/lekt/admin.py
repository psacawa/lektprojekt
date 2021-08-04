from django.contrib import admin

from .models import Feature, Language, LanguageCourse, Phrase, Voice, Word

admin.site.register(Language)
admin.site.register(Voice)
admin.site.register(LanguageCourse)
admin.site.register(Feature)
admin.site.register(Phrase)
admin.site.register(Word)
