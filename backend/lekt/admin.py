from django.contrib import admin

from .models import Feature, Language, Phrase, Subscription, UserProfile, Voice, Word

admin.site.register(UserProfile)
admin.site.register(Language)
admin.site.register(Voice)
admin.site.register(Subscription)
admin.site.register(Feature)
admin.site.register(Phrase)
admin.site.register(Word)
