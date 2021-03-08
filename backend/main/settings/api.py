REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        #  "rest_framework.authentication.SessionAuthentication",
        "main.authentication.SessionAuthentication",
        "rest_framework.authentication.TokenAuthentication",
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

if DEBUG:
    REST_FRAMEWORK["DEFAULT_RENDERER_CLASSES"] += [
        "rest_framework.renderers.BrowsableAPIRenderer"
    ]
