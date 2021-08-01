"""
LektProject Main URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from allauth.account.views import (
    ConfirmEmailView,
    EmailVerificationSentView,
    password_reset_from_key,
)
from django.conf import settings
from django.contrib import admin
from django.contrib.auth.views import PasswordResetConfirmView
from django.urls import include, path, re_path
from django.views.generic import RedirectView, TemplateView
from django_ses.views import SESEventWebhookView
from rest_framework.routers import SimpleRouter

from .views import (
    CheckoutSessionView,
    GithubLoginView,
    PriceViewSet,
    create_checkout_session,
    healthz,
)

stripe_router = SimpleRouter()
stripe_router.register("prices", PriceViewSet, basename="prices")

urlpatterns = [
    path(r"admin/doc/", include("django.contrib.admindocs.urls")),
    path(r"admin/", admin.site.urls),
    path(r"api/", include("lekt.urls")),
    path(r"healthz", healthz),
    #  dj_rest_auth
    #  eventually indvidually set the paths
    path(r"auth/", include("dj_rest_auth.urls")),
    path(r"auth/registration/", include("dj_rest_auth.registration.urls")),
    #  what dj-rest-auth wants you to do
    # TODO: i'm going to implement the frontend view with react router routing
    re_path(
        r"^auth/password/reset/confirm/(?P<uidb64>[0-9A-Za-z_\-]+)/(?P<token>[0-9A-Za-z]{1,13}-[0-9A-Za-z]{1,32})/$",
        TemplateView.as_view(template_name="password_reset_confirm.html"),
        name="password_reset_confirm",
    ),
    #  allauth is secondary, all paths must by manually set
    re_path(
        r"^auth/confirm-email/(?P<key>[-:\w]+)/$",
        ConfirmEmailView.as_view(),
        name="account_confirm_email",
    ),
    path(
        r"auth/confirm-email/",
        EmailVerificationSentView.as_view(),
        name="account_email_verification_sent",
    ),
    # STRIPE
    path("stripe/", include(stripe_router.urls)),
    path(
        "stripe/create-checkout-session/",
        create_checkout_session,
        name="create-checkout-session",
    ),
    path(
        "stripe/checkout-session/",
        CheckoutSessionView.as_view(),
        name="create-checkout-session",
    ),
    path("stripe/", include("djstripe.urls", namespace="djstripe")),
    re_path(r"^admin/django-ses/", include("django_ses.urls")),
    # EMAILS
    re_path(
        r"^ses/nictuniema/$",
        SESEventWebhookView.as_view(),
        name="handle-event-webhook",
    ),
]

#  TODO 26/07/20 psacawa: Figure out a production solution for serving this static content
from django.contrib.staticfiles.urls import staticfiles_urlpatterns

urlpatterns += staticfiles_urlpatterns()

if settings.DEBUG:
    import debug_toolbar
    from django.views.generic import RedirectView

    urlpatterns = urlpatterns + [
        path("__debug__", include(debug_toolbar.urls)),
        path(r"", RedirectView.as_view(url="/api/docs"), name="redirect-to-dox"),
    ]
