def _get_database_config(mode="main"):
    """Get the DB config for either main or test database"""
    return {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": "{}lektprojekt_db".format("test_" if mode == "test" else ""),
        # In development mode a database superuser is used
        # who can delete and recrete the database
        "USER": "lektprojekt_pg_admin" if DEVELOPMENT else "lektprojekt_pg_user",
        "PASSWORD": "django-pass",
        "HOST": "localhost",
    }


#  controlling the database from an environmental variable enables
#  DJANGO_DATABASE=test ./manage.py runserver
#  in order the directly examine the test database
default_database = environ.get("DJANGO_DATABASE", "main")
DATABASES = {}
DATABASES["default"] = _get_database_config(default_database)

# caching in development makes tests flaky
if DEVELOPMENT:
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
            "LOCATION": "redis://127.0.0.1:6379",
            "OPTIONS": {
                "CLIENT_CLASS": "django_redis.client.DefaultClient",
            },
        }
    }
