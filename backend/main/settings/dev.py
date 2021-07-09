# type: ignore
# settings active only in development environment

ALLOWED_HOSTS += ["lex.quest", "127.0.0.1", "localhost", "l"]
# next line necessary for django-debug-toolbar
INTERNAL_IPS = ALLOWED_HOSTS

# developer convenience - django-(debug-toolbar)
if DEBUG:
    INSTALLED_APPS += [
        "drf_yasg",
        "debug_toolbar",
    ]
    #  debug toolbar middleware needs to be before GzipMiddleware
    MIDDLEWARE.insert(0, "debug_toolbar.middleware.DebugToolbarMiddleware")

DEBUG_TOOLBAR_CONFIG = {"RESULTS_STORE_SIZE": 100, "PROFILER_MAX_DEPTH": 20}
