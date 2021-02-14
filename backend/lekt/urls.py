from django.conf import settings
from django.contrib import admin
from django.urls import include, path
from rest_framework import routers

from . import views

router = routers.SimpleRouter()
router.register(r"subs", views.LanguageSubscriptionViewSet, basename="sub")
router.register(r"languages", views.LanguageViewSet, basename="language")
router.register(r"lexemes", views.LexemeViewSet, basename="lexeme")
router.register(r"features", views.FeatureViewSet, basename="features")
urlpatterns = router.urls

urlpatterns += [
    path(r"profile/", views.UserProfileView.as_view(), name="profile"),
    path(r"words/", views.WordCompletionView.as_view(), name="word-completion"),
    path(r"phrases/", views.PhraseCompletionView.as_view(), name="phrase-completion"),
    path(r"pairs/<int:pk>/", views.PhrasePairDetailView.as_view(), name="pair-detail"),
    path(
        r"pairs/lexeme-search/",
        views.PhrasePairLexemeSearchView().as_view(),
        name="pair-lexeme-search",
    ),
    path(
        r"pairs/feature-search/",
        views.PhrasePairFeatureSearchView().as_view(),
        name="pair-feature-search",
    ),
    path(
        r"pairs/search/",
        views.PhrasePairObservableSearchView().as_view(),
        name="pair-search",
    ),
    path(r"pairs/", views.PhrasePairListView.as_view(), name="pair-list"),
]

if settings.DEBUG:
    urlpatterns += [
        path(r"docs/", views.docs_schema_view.with_ui("swagger"), name="docs"),
    ]
