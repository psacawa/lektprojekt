import pytest
from django.contrib.auth.models import User
from rest_framework.test import APIClient


@pytest.fixture()
def client():
    """ DRF API client"""
    return APIClient()


@pytest.fixture()
def test_user(client: APIClient):
    """ gets fresh user account to test with """
    user = User.objects.create(
        username="test_user", password="sdfgsdfg", email="test@a.com"
    )
    return user
