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
    MIDDLEWARE += ["debug_toolbar.middleware.DebugToolbarMiddleware"]

# Django Extensions settings
SHELL_PLUS = "ipython"

DEBUG_TOOLBAR_CONFIG = {
    "RESULTS_STORE_SIZE": 100,
}
