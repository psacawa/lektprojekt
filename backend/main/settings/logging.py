#  <TODO 03/12/20 psacawa: conf. logging base on ENVIRONMENT>
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
        "main": {
            "handlers": ["console"],
            "level": "DEBUG",
            "propagate": True,
        },
        "lekt.signals": {"handlers": ["console"], "level": "DEBUG"},
        "lekt.views": {"handlers": ["console"], "level": "DEBUG"},
        "django.db.backends": {"handlers": ["db_file"], "level": "DEBUG"},
        "django.request": {"handlers": ["request_file"], "level": "DEBUG"},
    },
    "handlers": {
        "console": {
            "level": "DEBUG",
            "class": "logging.StreamHandler",
            "formatter": "verbose",
        },
        "db_file": {
            "level": "DEBUG",
            "class": "logging.FileHandler",
            "formatter": "verbose",
            "filename": join(LOGS_DIR, "db.log"),
        },
        "request_file": {
            "level": "DEBUG",
            "class": "logging.FileHandler",
            "formatter": "verbose",
            "filename": join(LOGS_DIR, "request.log"),
        },
    },
}
