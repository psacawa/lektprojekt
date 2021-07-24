import logging
from functools import wraps
from uuid import uuid4

from django.conf import settings
from django.contrib.auth import SESSION_KEY, authenticate, login
from django.contrib.auth.models import User
from rest_framework.request import Request

logger = logging.getLogger(__name__)


def generate_lazy_user(func):
    """
    This decorator generates a User attached to the request and if the the current user is
    not authenticated. The new user is persisted in the session.
    """

    def wrapped(request: Request, *args, **kwargs):
        assert hasattr(request, "session"), (
            "You need to have the session " "app installed"
        )
        if request.user.is_anonymous:
            # If not, then we have to create a user, and log them in.
            username = uuid4().hex
            password = uuid4().hex
            user = User.objects.create_user(username=username, password=password)
            logger.debug(f"{user=}")
            request.user = None
            user = authenticate(username=username, password=password)
            assert user, "Lazy user creation and authentication failed."
            request.session[SESSION_KEY] = user.id
            login(request, user)
        return func(request, *args, **kwargs)

    return wraps(func)(wrapped)
