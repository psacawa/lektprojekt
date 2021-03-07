from os import environ

from split_settings.tools import include

ENVIRONMENT = environ.get("DJANGO_ENV", "dev")
assert ENVIRONMENT in ("dev", "staging", "prod",), (
    f'Unsupported value of DJANGO_ENV: "{ENVIRONMENT}". '
    'Supported values are "dev", "staging", "prod"'
)

base_patterns = [
    "base.py",
    "auth.py",
    "templates.py",
    "api.py",
    "database.py",
    "logging.py",
    f"{ENVIRONMENT}.py",
]

include(*base_patterns)
