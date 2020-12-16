from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from django.conf import settings

from . import views

router = routers.SimpleRouter()
router.register(r"subs", views.SubscriptionViewSet, basename="sub")
router.register(r"titems", views.TrackedItemViewSet, basename="titem")
router.register(r"twords", views.TrackedWordViewSet, basename="tword")
router.register(r"tannots", views.TrackedAnnotationViewSet, basename="tannot")
urlpatterns = router.urls

urlpatterns += [
    path(r"language/", views.LanguageListView.as_view(), name="lang-list"),
    path(r"profile/", views.UserProfileView.as_view(), name="profile"),
    path(r"select/", views.PhrasePairSuggestionView.as_view(), name="select"),
    path(r"words/", views.WordCompletionView.as_view(), name="word-completion"),
    path(r"phrases/", views.PhraseCompletionView.as_view(), name="phrase-completion"),
    path(r"suggestion/", views.GimpedView.as_view(), name="suggestion"),
]

if settings.DEBUG:
    urlpatterns.append(
        path(r"docs/", views.docs_schema_view.with_ui("redoc"), name="schema-redoc")
    )
