# Database
# https://docs.djangoproject.com/en/3.0/ref/settings/#databases

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": "lektprojekt-db",
        # In development mode a database superuser is used
        # who can delete and recrete the database
        "USER": "lektprojekt_pg_admin" if DEVELOPMENT else "lektprojekt_pg_user",
        "PASSWORD": "django-pass",
        "HOST": "localhost",
    }
}

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
