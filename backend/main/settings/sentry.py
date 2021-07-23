# type: ignore
import sentry_sdk
from sentry_sdk.integrations.django import DjangoIntegration
from sentry_sdk.integrations.redis import RedisIntegration

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
    traces_sample_rate=1.0,
    # If you wish to associate users to errors (assuming you are using
    # django.contrib.auth) you may enable sending PII data.
    send_default_pii=True,
    # By default the SDK will try to use the SENTRY_RELEASE
    # environment variable, or infer a git commit
    # SHA as release, however you may want to set
    # something more human-readable.
    # release="myapp@1.0.0",
)
