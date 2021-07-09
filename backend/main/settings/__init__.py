from os import environ

from split_settings.tools import include

ENVIRONMENT = environ.get("DJANGO_ENV", "dev")
assert ENVIRONMENT in ("dev", "test", "prod",), (
    f'Unsupported value of DJANGO_ENV: "{ENVIRONMENT}". '
    'Supported values are "dev", "test", "prod"'
)
#  dev: all the bells and whistles for debugging
#  test: this will run in CI using using docker-compose up needs to work here
#  it needs to be controllable from the command line, so debugging can occur
#  TODO 27/03/20 psacawa: figure the test out
#  prod: production

base_patterns = [
    "base.py",
    "auth.py",
    "templates.py",
    "api.py",
    "database.py",
    "logging.py",
    "extra.py",
    f"{ENVIRONMENT}.py",
]

include(*base_patterns)
