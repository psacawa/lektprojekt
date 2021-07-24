# type: ignore
# Django Extensions settings
#  needed in production for adhoc DB admin tasks
SHELL_PLUS = "ipython"
SHELL_PLUS_IMPORTS = [
    "from django.db.models import Window",
    "from django.db.models.functions import Length, Rank",
    "from django.db.models.expressions import RawSQL",
]
IPYTHON_ARGUMENTS = [
    "--TerminalInteractiveShell.prompts_class=IPython.terminal.prompts.ClassicPrompts",
    "--TerminalInteractiveShell.editing_mode=vi",
]
# for ORM nastiness
#  SHELL_PLUS_PRINT_SQL_TRUNCATE = None

#  STRIPE
STRIPE_LIVE_SECRET_KEY = environ.get("STRIPE_LIVE_SECRET_KEY", None)
STRIPE_TEST_SECRET_KEY = environ.get("STRIPE_TEST_SECRET_KEY", None)
STRIPE_LIVE_MODE = DJANGO_ENV == "production"

DJSTRIPE_WEBHOOK_SECRET = environ.get("DJSTRIPE_WEBHOOK_SECRET", None)
DJSTRIPE_FOREIGN_KEY_TO_FIELD = "id"
DJSTRIPE_USE_NATIVE_JSONFIELD = True
# just a bit of security by obscurity against replay attacks
DJSTRIPE_WEBHOOK_URL = r"^nictuniema/$"
