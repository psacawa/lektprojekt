# settings active only in development environment

# developer convenience - django-(extensions|debug-toolbar)
if DEVELOPMENT:
    INSTALLED_APPS += [
        "django_extensions",
        "debug_toolbar",
    ]
    MIDDLEWARE += ["debug_toolbar.middleware.DebugToolbarMiddleware"]

# Django Extensions settings
SHELL_PLUS = "ipython"

DEBUG_TOOLBAR_CONFIG = {
    "RESULTS_STORE_SIZE": 100,
}
