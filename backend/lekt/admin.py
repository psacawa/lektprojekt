from django.contrib import admin

from .models import (
    Feature,
    Language,
    LanguageSubscription,
    Phrase,
    UserProfile,
    Voice,
    Word,
)

admin.site.register(UserProfile)
admin.site.register(Language)
admin.site.register(Voice)
admin.site.register(LanguageSubscription)
admin.site.register(Feature)
admin.site.register(Phrase)
admin.site.register(Word)
