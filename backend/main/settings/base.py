# type: ignore
"""Django settings for main project.

Generated by 'django-admin startproject' using Django 3.0.3.

For more information on this file, see
https://docs.djangoproject.com/en/3.0/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/3.0/ref/settings/
"""

from os import environ, mkdir, remove
from os.path import abspath, dirname, isdir, join

#  TODO 27/08/20 psacawa: figure out how to use this
#  import environental variables with prefixes DJANGO or LOGGING
for key, val in environ.items():
    if key.startswith("DJANGO") or key.startswith("LOGGING"):
        locals()[key] = "val"

VERSION = "0.2.0"

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
BASE_DIR = "/".join(abspath(__file__).split("/")[:-3])
ASSET_DIR = join(BASE_DIR, "assets")

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/3.0/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = environ.get("DJANGO_SECRET_KEY", "fake-key")

# the DEBUG variable is interpreted by django to turn on the server in development mode
# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = DJANGO_ENV == "development"

DJANGO_SENTRY_ENV = environ.get("DJANGO_SENTRY_ENV", DJANGO_ENV)
DJANGO_EMAIL_ENV = environ.get("DJANGO_EMAIL_ENV", DJANGO_ENV)
DJANGO_STRIPE_ENV = environ.get("DJANGO_STRIPE_ENV", DJANGO_ENV)
DJANGO_CACHE_ENV = environ.get("DJANGO_CACHE_ENV", DJANGO_ENV)

SITE_NAME = "LexQuest"
DOMAIN = environ.get("DJANGO_DOMAIN", "lex.quest")
WEB_DOMAIN = environ.get("DJANGO_WWW_DOMAIN", f"www.{DOMAIN}")
API_DOMAIN = environ.get("DJANGO_API_DOMAIN", f"api.{DOMAIN}")
#  for now this is made exclusive to the needs of the stripe integration
#  perhaps make more robust in future
API_ORIGIN = f"http://localhost:8000" if DEBUG else f"https://{API_DOMAIN}"
WEB_ORIGIN = f"http://localhost:3000" if DEBUG else f"https://{WEB_DOMAIN}"

ALLOWED_HOSTS = [DOMAIN, WEB_DOMAIN, API_DOMAIN]

LEKTPROJEKT_APPS = [
    # first party applications
    "lekt",
    "main",
]

# Application definition
INSTALLED_APPS = [
    "django.contrib.admin",
    #  kill?
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "django.contrib.sites",
    "django.contrib.admindocs",
    # REST API
    "rest_framework",
    "rest_framework.authtoken",
    "django_filters",
    "corsheaders",
    # accounts
    "allauth",
    "allauth.account",
    "allauth.socialaccount",
    "dj_rest_auth",
    "dj_rest_auth.registration",
    #  ad hoc administration in production
    "django_extensions",
    # third-party integrations
    "djstripe",
    "django_ses",
] + LEKTPROJEKT_APPS

MIDDLEWARE = [
    "main.middleware.HealtCheckMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "main.urls"
WSGI_APPLICATION = "main.wsgi.application"
#  needed for allauth - it's just a hardcoded primary key
SITE_ID = 100

LANGUAGE_CODE = "en-us"
TIME_ZONE = "America/Toronto"
USE_I18N = True
USE_L10N = True
USE_TZ = True

STATIC_URL = "/static/"
