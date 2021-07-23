# type: ignore
import sentry_sdk
from sentry_sdk.integrations.django import DjangoIntegration
from sentry_sdk.integrations.redis import RedisIntegration


def before_send(event, hint):
    if "exc_info" in hint:
        exc_type, exc_value, tb = hint["exc_info"]
        if isinstance(exc_value, KeyboardInterrupt):
            return None
    return event


sentry_sdk.init(
    dsn=environ.get(
        #  "DJANGO_SENTRY_DSN", "https://examplePublicKey@o0.ingest.sentry.io/0"
        "DJANGO_SENTRY_DSN",
        "https://049a9389380446ef9ef2764676041ae1@o493812.ingest.sentry.io/5563785",
    ),
    integrations=[DjangoIntegration(), RedisIntegration()],
    # Set traces_sample_rate to 1.0 to capture 100%
    # of transactions for performance monitoring.
    # We recommend adjusting this value in production,
    traces_sample_rate=(1.0 if DEBUG else 0.2),
    # If you wish to associate users to errors (assuming you are using
    # django.contrib.auth) you may enable sending PII data.
    send_default_pii=True,
    # By default the SDK will try to use the SENTRY_RELEASE
    # environment variable, or infer a git commit
    # SHA as release, however you may want to set
    # something more human-readable.
    # release="myapp@1.0.0",
    environment=DJANGO_ENV,
    before_send=before_send,
)
