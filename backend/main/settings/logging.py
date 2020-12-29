# default loggers in production
if DEBUG:
    # for every module listed here, there will be a logger made with a file handler with level
    # DEBUG and verbose format, and a stderr handler with level ERROR and simple format
    # for both, there will be no propagation
    LEKTPROJEKT_LOGGED_MODULES = [
        "lekt.views",
        "lekt.serializers",
        "lekt.filters",
        "lekt.models",
        "lekt.signals",
        "lekt.loaders",
        "main.views",
        "main.models",
        "main.signals",
        "django.db.backends",
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
    HANDLERS |= {
        "console": {
            "level": "ERROR",
            "class": "logging.StreamHandler",
            "formatter": "verbose",
        }
    }

    LOGGING = {
        "version": 1,
        "disable_existing_loggers": False,
        "formatters": {
            "verbose": {
                "format": "[{asctime}] {levelname} {name} {lineno} {funcName} {message}",
                "style": "{",
            },
            "simple": {"format": "{levelname} {name} {message}", "style": "{"},
        },
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
