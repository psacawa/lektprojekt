# type: ignore
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        #  token auth has to be first otherwise the lazy signup mechanism will take
        #  precedence on the views it's activated on, and the user will be identified as
        #  an anonymous new account if there is no sessionid cookie accompanying the
        #  Authorization header
        "rest_framework.authentication.TokenAuthentication",
        #  this is the same as rest_framework SessionAuthentication, but it does not have
        #  the csrf check. It promotes the django HttpRequest user to the rest_framework
        #  Request user
        #  NOTE 25/07/20 psacawa: wiem że niezalogowany klient będzie korzystał ze sesji,
        #  ale jeśli to nadal działa dla zalogowanego użytkownika, to po co w ogóle się tym
        #  trudzić?
        "main.authentication.SessionAuthentication",
    ],
    "DEFAULT_PAGINATION_CLASS": "lekt.pagination.NormalPageNumberPagination",
    "PAGE_SIZE": 25,
    "DEFAULT_RENDERER_CLASSES": [
        "rest_framework.renderers.JSONRenderer",
    ],
    "DEFAULT_THROTTLE_CLASSES": [
        #  'rest_framework.throttling.UserRateThrottle',
    ],
    "DEFAULT_THROTTLE_RATES": {"user": "1/second", "anon": "10/minute"},
    "DEFAULT_FILTER_BACKENDS": ["django_filters.rest_framework.DjangoFilterBackend"],
}

from corsheaders.defaults import default_headers

CORS_ALLOWED_ORIGINS = [f"https://{WEB_DOMAIN}"]
CORS_ALLOW_ALL_ORIGINS = DJANGO_ENV != "production"
CORS_ALLOW_HEADERS = "*"

if DEBUG:
    REST_FRAMEWORK["DEFAULT_RENDERER_CLASSES"] += [
        "rest_framework.renderers.BrowsableAPIRenderer"
    ]
