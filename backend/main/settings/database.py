# type: ignore
DB_HOST = environ.get("DJANGO_POSTGRES_HOST", "localhost")
DB_PASS = environ.get("DJANGO_POSTGRES_PASSWORD", "django-pass")


#  controlling the database from an environmental variable enables
#  DJANGO_ENV=test ./manage.py shell_plus
#  in order the directly examine the test database
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": "{}lekt_db".format("test_" if DJANGO_ENV == "test" else ""),
        # In development mode a database superuser is used
        # who can delete and recrete the database
        "USER": "lekt_admin" if DJANGO_ENV == "production" else "lekt_user",
        "HOST": DB_HOST,
        "PASSWORD": DB_PASS,
    }
}


REDIS_HOST = environ.get("DJANGO_REDIS_HOST", "localhost")

# caching in development makes tests flaky
if DJANGO_CACHE_ENV != "production":
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

DEFAULT_AUTO_FIELD = "django.db.models.AutoField"
