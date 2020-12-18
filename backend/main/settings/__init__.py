from os import environ

from split_settings.tools import include

ENVIRONMENT = environ.get("DJANGO_ENVIRONMENT", "development")
assert ENVIRONMENT in ("development", "staging", "production",), (
    f'Unsupported value of DJANGO_ENVIRONMENT: "{ENVIRONMENT}". '
    'Supported values are "development", "staging", "production"'
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
