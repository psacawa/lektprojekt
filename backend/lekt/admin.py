from django.contrib import admin

from .models import Annotation, Language, Phrase, Subscription, UserProfile, Voice, Word

admin.site.register(UserProfile)
admin.site.register(Language)
admin.site.register(Voice)
admin.site.register(Subscription)
admin.site.register(Annotation)
admin.site.register(Phrase)
admin.site.register(Word)
