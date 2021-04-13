"""Django settings for main project.

Generated by 'django-admin startproject' using Django 3.0.3.

For more information on this file, see
https://docs.djangoproject.com/en/3.0/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/3.0/ref/settings/
"""

from os import environ, mkdir, remove
from os.path import abspath, dirname, isdir, join

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
BASE_DIR = "/".join(abspath(__file__).split("/")[:-3])
ASSET_DIR = join(BASE_DIR, "assets")
LOGS_DIR = join(BASE_DIR, "logs")
#  TODO 27/03/20 psacawa: somehow this is causing an error in docker build, investigate
if not isdir(LOGS_DIR):
    try:
        mkdir(LOGS_DIR)
    except Exception as e:
        pass

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/3.0/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = environ.get("SECRET_KEY", "fake-key")

# the DEBUG variable is interpreted by django to turn on the server in development mode
# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = ENVIRONMENT == "dev"

SITE_NAME = "LexQuest"
DOMAIN = "lex.quest"
ALLOWED_HOSTS = [DOMAIN]

LEKTPROJEKT_APPS = [
    # first party applications
    "lekt",
    "main",
]

# Application definition
INSTALLED_APPS = [
    "django.contrib.admin",
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
    # accounts
    "allauth",
    "allauth.account",
    "allauth.socialaccount",
    "dj_rest_auth",
    "dj_rest_auth.registration",
    #  ad hoc administration in production
    "django_extensions",
] + LEKTPROJEKT_APPS

MIDDLEWARE = [
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
TIME_ZONE = "UTC"
USE_I18N = True
USE_L10N = True
USE_TZ = True

STATIC_URL = "/static/"
