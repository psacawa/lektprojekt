from typing import Dict

import pytest
from assertpy import add_extension
from django.contrib.auth.models import User
from jq import jq as jq_base
from rest_framework.test import APIClient


@pytest.fixture()
def test_user(client: APIClient):
    """ gets fresh user account to test with """
    user = User.objects.create(
        username="test_user", password="sdfgsdfg", email="test@a.com"
    )
    return user


def jq(query: str, input):
    """simple wrapper around jq"""
    return jq.compile(query).input(input).all()
