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
    },
    "handlers": {
        "console": {
            "level": "DEBUG",
            "class": "logging.StreamHandler",
            "formatter": "verbose",
        }
    },
}
