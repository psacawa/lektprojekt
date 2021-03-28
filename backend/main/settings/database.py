DB_HOST = environ.get("POSTGRES_HOST", "localhost")
DB_PASS = environ.get("POSTGRES_PASSWORD", "django-pass")


def _get_database_config(mode="main"):
    """Get the DB config for either main or test database"""
    return {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": "{}lekt_db".format("test_" if mode == "test" else ""),
        # In development mode a database superuser is used
        # who can delete and recrete the database
        "USER": "lekt_admin" if DEBUG else "lekt_user",
        "HOST": DB_HOST,
        "PASSWORD": DB_PASS,
    }


#  controlling the database from an environmental variable enables
#  DJANGO_DATABASE=test ./manage.py runserver
#  in order the directly examine the test database
default_database = environ.get("DJANGO_DATABASE", "main")
DATABASES = {}
DATABASES["default"] = _get_database_config(default_database)

REDIS_HOST = environ.get("REDIS_HOST", "localhost")

# caching in development makes tests flaky
if DEBUG:
    CACHES = {
        "default": {
            "BACKEND": "django.core.cache.backends.dummy.DummyCache",
            "LOCATION": "localhost",
        }
    }
else:
    CACHES = {
        "default": {
            "BACKEND": "django_redis.cache.RedisCache",
            "TIMEOUT": 30,
            "LOCATION": f"redis://{REDIS_HOST}",
            "OPTIONS": {
                "CLIENT_CLASS": "django_redis.client.DefaultClient",
            },
        }
    }
