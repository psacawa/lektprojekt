# type: ignore

#####################
# DJANGO EXTENSIONS
#####################
#  needed in production for adhoc DB admin tasks
SHELL_PLUS = "ipython"
SHELL_PLUS_IMPORTS = [
    "from django.db.models import Window",
    "from django.db.models.functions import Length, Rank",
    "from django.db.models.expressions import RawSQL",
    #  shadowed by djstripe.models.checkout.Session
    "from django.contrib.sessions.models import Session as AuthSession",
]

IPYTHON_ARGUMENTS = [
    "--TerminalInteractiveShell.prompts_class=IPython.terminal.prompts.ClassicPrompts",
    "--TerminalInteractiveShell.editing_mode=vi",
]
#  basic protection from accidental dangerous ORM commands
if DJANGO_ENV == "production":
    IPYTHON_ARGUMENTS += ["--colors=Linux"]
# for ORM nastiness
#  SHELL_PLUS_PRINT_SQL_TRUNCATE = None

######################
# DJANGO DEBUG TOOLBAR
######################
RESULTS_CACHE_SIZE = 50

#####################
#  STRIPE
#####################
STRIPE_TEST_SECRET_KEY = environ.get("STRIPE_TEST_SECRET_KEY", "sk_test_fake")
STRIPE_LIVE_SECRET_KEY = environ.get("STRIPE_LIVE_SECRET_KEY", "sk_live_fake")
DJSTRIPE_WEBHOOK_SECRET = environ.get("DJSTRIPE_WEBHOOK_SECRET", "whsec_fake")
DJSTRIPE_FOREIGN_KEY_TO_FIELD = "id"
DJSTRIPE_USE_NATIVE_JSONFIELD = True
# just a bit of security by obscurity against replay attacks
DJSTRIPE_WEBHOOK_URL = r"^nictuniema/$"
STRIPE_LIVE_MODE = DJANGO_STRIPE_ENV == "production"

STRIPE_CHECKOUT_REDIRECT = f"{API_ORIGIN}/payments?" "session_id={CHECKOUT_SESSION_ID}"

import stripe

stripe.set_app_info(
    "psacawa/lektprojekt",
    version=VERSION,
    url="www.lex.quest",
)
stripe.api_version = "2020-08-27"
stripe.api_key = (
    STRIPE_LIVE_SECRET_KEY if DJANGO_ENV == "production" else STRIPE_TEST_SECRET_KEY
)


#####################
# AWS SES
#####################
if DJANGO_SES_ENV in ["development", "test"]:
    EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"
else:
    EMAIL_BACKEND = "django_ses.SESBackend"
    AWS_ACCESS_KEY_ID = environ.get("AWS_ACCESS_KEY_ID")
    AWS_SECRET_ACCESS_KEY = environ.get("AWS_SECRET_ACCESS_KEY")
    AWS_SES_REGION_NAME = "us-east-2"
    AWS_SES_REGION_ENDPOINT = "email.us-east-2.amazonaws.com"
    ACCOUNT_EMAIL_SUBJECT_PREFIX = ""
    AWS_SES_CONFIGURATION_SET = environ.get("AWS_SES_CONFIGURATION_SET")

    #  drop these once upstream djanog-ses drops dependency on m2crypto
    AWS_SES_VERIFY_EVENT_SIGNATURES = False
    AWS_SES_VERIFY_BOUNCE_SIGNATURES = False

#####################
# SENTRY
#####################
import sentry_sdk
from django.core.checks import Error
from sentry_sdk.integrations.django import DjangoIntegration
from sentry_sdk.integrations.redis import RedisIntegration

SENTRY_IGNORE_EXCEPTIONS = (
    [
        KeyboardInterrupt,
        Error,
    ]
    if DEBUG
    else [
        KeyboardInterrupt,
    ]
)


def before_send(event, hint):
    if "exc_info" in hint:
        exc_type, exc_value, tb = hint["exc_info"]
        if any(map(lambda e: isinstance(exc_value, e), SENTRY_IGNORE_EXCEPTIONS)):
            return None
    return event


DJANGO_SENTRY_TRACE_SAMPLE_RATE = (
    1.0
    if DJANGO_SENTRY_ENV != "production"
    else float(environ.get("DJANGO_SENTRY_TRACE_SAMPLE_RATE", 0.2))
)
sentry_sdk.init(
    dsn=environ.get("DJANGO_SENTRY_DSN", None),
    integrations=[DjangoIntegration(), RedisIntegration()],
    # Set traces_sample_rate to 1.0 to capture 100%
    # of transactions for performance monitoring.
    # We recommend adjusting this value in production,
    traces_sample_rate=DJANGO_SENTRY_TRACE_SAMPLE_RATE,
    # If you wish to associate users to errors (assuming you are using
    # django.contrib.auth) you may enable sending PII data.
    send_default_pii=True,
    # By default the SDK will try to use the SENTRY_RELEASE
    # environment variable, or infer a git commit
    # SHA as release, however you may want to set
    # something more human-readable.
    # release="myapp@1.0.0",
    debug=DJANGO_SENTRY_ENV != "production",
    environment=DJANGO_SENTRY_ENV,
    before_send=before_send,
)
