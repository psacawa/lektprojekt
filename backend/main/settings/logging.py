# type: ignore
# default loggers in production

LOGS_DIR = environ.get("DJANGO_LOGS_DIR", (join(BASE_DIR, "logs")))
#  TODO 27/03/20 psacawa: somehow this is causing an error in docker build, investigate
if not isdir(LOGS_DIR):
    try:
        mkdir(LOGS_DIR)
    except Exception as e:
        pass


FORMATTERS = {
    "verbose": {
        "format": "[{asctime}] {levelname} {name} {lineno} {funcName} {message}",
        "style": "{",
    },
    "simple": {"format": "{levelname} {name} {message}", "style": "{"},
}

LEKTPROJEKT_LOGGED_MODULES = [
    "djstripe",
    "django.db.backends",
    "lekt.apps",
    "lekt.decorators",
    "lekt.filters",
    "lekt.loaders.language",
    "lekt.loaders.loaders",
    "lekt.models",
    "lekt.permissions",
    "lekt.serializers",
    "lekt.signals",
    "lekt.views",
    "main.apps",
    "main.middleware",
    "main.models",
    "main.signals",
    "main.views",
    "main.webhooks",
]
HANDLERS = {
    f"file/{module}": {
        "level": "DEBUG",
        "class": "logging.handlers.RotatingFileHandler",
        "filename": join(LOGS_DIR, f"{module}.log"),
        "maxBytes": 2 ** 20,
        "backupCount": 1,
        "formatter": "verbose",
    }
    for module in LEKTPROJEKT_LOGGED_MODULES
}
HANDLERS.update(
    {
        "console": {
            "level": "ERROR",
            "class": "logging.StreamHandler",
            "formatter": "verbose",
        }
    }
)
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": FORMATTERS,
    "loggers": {
        module: {
            "handlers": ["console", f"file/{module}"],
            "level": "DEBUG",
            "propagate": False,
        }
        for module in LEKTPROJEKT_LOGGED_MODULES
    },
    "handlers": HANDLERS,
}
