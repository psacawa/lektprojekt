import shutil
from typing import Dict

import pytest
from assertpy import add_extension
from django.contrib.auth.models import User
from jq import jq as jq_base
from rest_framework.test import APIClient


def pytest_configure(*args):
    """docstring for pytest_cmdline_parse"""
    if not shutil.which("jq"):
        pytest.exit(
            "The JSON parsing utility jq is an external dependency of the lekt test "
            "suite. It was not found in PATH. Aborting..."
        )


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
