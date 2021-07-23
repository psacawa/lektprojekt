# type: ignore
from os import environ

from split_settings.tools import include

DJANGO_ENV = environ.get("DJANGO_ENV", "development")
assert DJANGO_ENV in ("development", "test", "production"), (
    f'Unsupported value of DJANGO_ENV: "{DJANGO_ENV}". '
    'Supported values are "development", "test", "production"'
)
#  development: all the bells and whistles for debugging
#  test: this will run in CI using using docker-compose up needs to work here
#  it needs to be controllable from the command line, so debugging can occur
#  TODO 27/03/20 psacawa: figure the test out
#  production: production

base_patterns = [
    "base.py",
    "auth.py",
    "templates.py",
    "api.py",
    "database.py",
    "logging.py",
    "sentry.py",
    "extra.py",
    f"{DJANGO_ENV}.py",
]

include(*base_patterns)
