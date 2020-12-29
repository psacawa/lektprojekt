from django.conf import settings
from django.contrib import admin
from django.urls import include, path
from rest_framework import routers

from . import views

router = routers.SimpleRouter()
router.register(r"subs", views.SubscriptionViewSet, basename="sub")
router.register(r"languages", views.LanguageViewSet, basename="language")
router.register(r"pairs", views.PhrasePairViewSet, basename="pair")
urlpatterns = router.urls

urlpatterns += [
    path(r"profile/", views.UserProfileView.as_view(), name="profile"),
    path(r"words/", views.WordCompletionView.as_view(), name="word-completion"),
    path(r"lexemes/", views.LexemeCompletionView.as_view(), name="lexeme-completion"),
    path(
        r"annots/",
        views.AnnotationCompletionView.as_view(),
        name="annotation-completion",
    ),
    path(r"phrases/", views.PhraseCompletionView.as_view(), name="phrase-completion"),
    # the viewset returning phrase pairs matching one lexeme + one annotation
]

if settings.DEBUG:
    urlpatterns += [
        path(r"docs/", views.docs_schema_view.with_ui("swagger"), name="docs"),
    ]
