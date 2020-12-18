from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from django.conf import settings

from . import views

router = routers.SimpleRouter()
router.register(r"subs", views.SubscriptionViewSet, basename="sub")
router.register(r"languages", views.LanguageViewSet, basename="language")
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
    path(r"gimped/", views.GimpedView.as_view(), name="gimped"),
]

if settings.DEBUG:
    urlpatterns += [
        path(r"docs/", views.docs_schema_view.with_ui("swagger"), name="docs"),
    ]
