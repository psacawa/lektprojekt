# settings active only in development environment

# next line necessary for django-debug-toolbar
INTERNAL_IPS = ALLOWED_HOSTS

# developer convenience - django-(extensions|debug-toolbar)
if DEVELOPMENT:
    INSTALLED_APPS += [
        "drf_yasg",
        "django_extensions",
        "debug_toolbar",
    ]
    #  debug toolbar middleware needs to be before GzipMiddleware
    MIDDLEWARE.insert(0, "debug_toolbar.middleware.DebugToolbarMiddleware")

# Django Extensions settings
SHELL_PLUS = "ipython"
SHELL_PLUS_IMPORTS = [
    "from django.db.models import Window",
    "from django.db.models.functions import Length, Rank",
    "from django.db.models.expressions import RawSQL",
]
# for ORM nastiness
#  SHELL_PLUS_PRINT_SQL_TRUNCATE = None

DEBUG_TOOLBAR_CONFIG = {"RESULTS_STORE_SIZE": 100, "PROFILER_MAX_DEPTH": 20}
