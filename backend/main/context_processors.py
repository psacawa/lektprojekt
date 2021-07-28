from django.conf import settings
from django.http import HttpRequest


def django_settings(request: HttpRequest):
    context = {
        "WEB_DOMAIN": settings.WEB_DOMAIN,
        "API_DOMAIN": settings.API_DOMAIN,
        "DOMAIN": settings.DOMAIN,
    }
    return context
