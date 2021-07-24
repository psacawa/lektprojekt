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


# AWS SES
if DJANGO_ENV in ["development", "test"]:
    EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"
else:
    EMAIL_BACKEND = "django_ses.SESBackend"
    AWS_ACCESS_KEY_ID = environ.get("DJANGO_AWS_ACCESS_KEY_ID")
    AWS_SECRET_ACCESS_KEY = environ.get("DJANGO_AWS_SECRET_ACCESS_KEY")
    AWS_SES_REGION_NAME = "us-east-2"
    AWS_SES_REGION_ENDPOINT = "email.us-east-2.amazonaws.com"
    ACCOUNT_EMAIL_SUBJECT_PREFIX = ""

    #  drop these once upstream djanog-ses drops dependency on m2crypto
    AWS_SES_VERIFY_EVENT_SIGNATURES = False
    AWS_SES_VERIFY_BOUNCE_SIGNATURES = False
