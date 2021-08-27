# type: ignore
# settings active only in development environment

import sys

from debug_toolbar.settings import PANELS_DEFAULTS

ALLOWED_HOSTS += ["lex.quest", "127.0.0.1", "localhost", "l"]
# next line necessary for django-debug-toolbar
INTERNAL_IPS = ALLOWED_HOSTS

# developer convenience - django-(debug-toolbar)
if DEBUG:
    INSTALLED_APPS += ["drf_yasg", "debug_toolbar", "djdt_flamegraph"]
    #  debug toolbar middleware needs to be before GzipMiddleware
    MIDDLEWARE.insert(0, "debug_toolbar.middleware.DebugToolbarMiddleware")

DEBUG_TOOLBAR_CONFIG = {"RESULTS_STORE_SIZE": 100, "PROFILER_MAX_DEPTH": 20}

DEBUG_TOOLBAR_PANELS = PANELS_DEFAULTS

#  for flamegraph to work https://github.com/brendangregg/FlameGraph must be installed
#  and the server must be run: ./manage.py runserver --nothreading --noreload
if "--nothreading" in sys.argv and "--noreload" in sys.argv:
    DEBUG_TOOLBAR_PANELS.append("djdt_flamegraph.FlamegraphPanel")
