# Password validation
# https://docs.djangoproject.com/en/3.0/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]

AUTHENTICATION_BACKENDS = [
    "django.contrib.auth.backends.ModelBackend",
    "allauth.account.auth_backends.AuthenticationBackend",
]

LOGIN_REDIRECT_URL = "/"
ACCOUNT_EMAIL_CONFIRMATION_ANONYMOUS_REDIRECT_URL = "/"
ACCOUNT_EMAIL_CONFIRMATION_AUTHENTICATED_REDIRECT_URL = "/"

REST_AUTH_SERIALIZERS = {
    "USER_DETAILS_SERIALIZER": "main.serializers.UserDetailsSerializer"
}

ACCOUNT_LOGIN_ON_EMAIL_CONFIRMATION = True
ACCOUNT_AUTHENTICATION_METHOD = "email"
ACCOUNT_EMAIL_VERIFICATION = "mandatory"
ACCOUNT_CONFIRM_EMAIL_ON_GET = True
ACCOUNT_EMAIL_REQUIRED = True
ACCOUNT_USERNAME_REQUIRED = True
ACCOUNT_ADAPTER = "main.adapter.AccountAdapter"

# email is relevant primarily for email-bases auth flow
# in development it's printed to the console
DEFAULT_FROM_EMAIL = "{name} <{email}>".format(name=SITE_NAME, email=f"info@{DOMAIN}")
SERVER_EMAIL = "{name} <{email}>".format(name="Alert", email=f"info@{DOMAIN}")

if ENVIRONMENT in ["dev", "test"]:
    EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"
else:

    EMAIL_BACKEND = "django_ses.SESBackend"
    #  TODO 06/03/20 psacawa: recreate aws user credentials and config env. var
    AWS_ACCESS_KEY_ID = environ.get("DJANGO_AWS_ACCESS_KEY_ID")
    AWS_SECRET_ACCESS_KEY = environ.get("DJANGO_AWS_SECRET_ACCESS_KEY")
    AWS_SES_REGION_NAME = "us-east-2"
    AWS_SES_REGION_ENDPOINT = "email.us-east-2.amazonaws.com"
    ACCOUNT_EMAIL_SUBJECT_PREFIX = ""
