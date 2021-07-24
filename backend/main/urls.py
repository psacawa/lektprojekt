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
from allauth.account.views import ConfirmEmailView, EmailVerificationSentView
from django.conf import settings
from django.contrib import admin
from django.urls import include, path, re_path
from django.views.generic.base import RedirectView

from .views import healthz

urlpatterns = [
    path(r"admin/doc/", include("django.contrib.admindocs.urls")),
    path(r"admin/", admin.site.urls),
    path(r"api/", include("lekt.urls")),
    path(r"healthz", healthz),
    path("stripe/", include("djstripe.urls", namespace="djstripe")),
    #  auth
    path(r"auth/", include("dj_rest_auth.urls")),
    path(r"auth/registration/", include("dj_rest_auth.registration.urls")),
    re_path(
        r"^auth/password-reset/confirm/(?P<uidb64>[0-9A-Za-z_\-]+)/(?P<token>[0-9A-Za-z]{1,13}-[0-9A-Za-z]{1,32})/$",
        RedirectView.as_view(url="/"),
        name="password_reset_confirm",
    ),
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
]

if settings.DEBUG:
    import debug_toolbar
    from django.views.generic import RedirectView

    urlpatterns = urlpatterns + [
        path("__debug__", include(debug_toolbar.urls)),
        path(r"", RedirectView.as_view(url="/docs"), name="redirect-to-dox"),
    ]
