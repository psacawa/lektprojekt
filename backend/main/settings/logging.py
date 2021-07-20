# type: ignore
# default loggers in production

FORMATTERS = {
    "verbose": {
        "format": "[{asctime}] {levelname} {name} {lineno} {funcName} {message}",
        "style": "{",
    },
    "simple": {"format": "{levelname} {name} {message}", "style": "{"},
}

if DEBUG:
    # for every module listed here, there will be a logger made with a file handler with level
    # DEBUG and verbose format, and a stderr handler with level ERROR and simple format
    # for both, there will be no propagation
    LEKTPROJEKT_LOGGED_MODULES = [
        "django.db.backends",
        "lekt.decorators",
        "lekt.filters",
        "lekt.loaders.language",
        "lekt.loaders.loaders",
        "lekt.models",
        "lekt.permissions",
        "lekt.serializers",
        "lekt.signals",
        "lekt.views",
        "main.middleware",
        "main.models",
        "main.apps",
        "lekt.apps",
        "main.signals",
        "main.views",
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
else:
    LOGGING = {
        "version": 1,
        "disable_existing_loggers": False,
        "formatters": FORMATTERS,
        "handlers": {
            "file/django": {
                "level": "DEBUG",
                "class": "logging.handlers.RotatingFileHandler",
                "filename": join(LOGS_DIR, "django.log"),
                "maxBytes": 2 ** 20,
                "backupCount": 1,
                "formatter": "verbose",
            },
            "file/django.server": {
                "level": "INFO",
                "class": "logging.handlers.RotatingFileHandler",
                "filename": join(LOGS_DIR, "django.server.log"),
                "maxBytes": 2 ** 20,
                "backupCount": 1,
                "formatter": "verbose",
            },
        },
        "loggers": {
            "django": {
                "handlers": ["file/django"],
                "level": "ERROR",
                "propagate": False,
            },
            "django.server": {
                "handlers": ["file/django.server"],
                "level": "INFO",
                "propagate": False,
            },
        },
    }


ADMINS = [("paweł", "pawelsacawa@gmail.com")]
