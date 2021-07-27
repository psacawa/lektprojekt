# type: ignore
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

REST_AUTH_SERIALIZERS = {
    "USER_DETAILS_SERIALIZER": "main.serializers.UserDetailsSerializer"
}

ACCOUNT_LOGIN_ON_EMAIL_CONFIRMATION = True
ACCOUNT_AUTHENTICATION_METHOD = "username_email"
ACCOUNT_EMAIL_VERIFICATION = "mandatory"
ACCOUNT_CONFIRM_EMAIL_ON_GET = True
ACCOUNT_EMAIL_REQUIRED = True
ACCOUNT_USERNAME_REQUIRED = True
ACCOUNT_ADAPTER = "main.adapter.AccountAdapter"
ACCOUNT_DEFAULT_HTTP_PROTOCOL = "https"
LOGIN_REDIRECT_URL = f"{WEB_DOMAIN}/login"
ACCOUNT_EMAIL_CONFIRMATION_ANONYMOUS_REDIRECT_URL = (
    f"{ACCOUNT_DEFAULT_HTTP_PROTOCOL}://{WEB_DOMAIN}"
)
ACCOUNT_EMAIL_CONFIRMATION_AUTHENTICATED_REDIRECT_URL = (
    ACCOUNT_EMAIL_CONFIRMATION_ANONYMOUS_REDIRECT_URL
)

# email is relevant primarily for email-bases auth flow
# in development it's printed to the console
DEFAULT_FROM_EMAIL = "{name} <{email}>".format(name=SITE_NAME, email=f"info@{DOMAIN}")
SERVER_EMAIL = "{name} <{email}>".format(name="Alert", email=f"info@{DOMAIN}")


SOCIALACCOUNT_PROVIDERS = {
    "github": {
        "SCOPE": [
            "user",
            "repo",
            "read:org",
        ],
    }
}
