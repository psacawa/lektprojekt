import shutil
from typing import Dict

import pytest
from assertpy import add_extension
from django.contrib.auth.models import User
from jq import jq as jq_base
from rest_framework.test import APIClient

from lekt.models import Feature, Language, LanguageSubscription, Lexeme, TrackedList


def pytest_configure(*args):
    """docstring for pytest_cmdline_parse"""
    if not shutil.which("jq"):
        pytest.exit(
            "The JSON parsing utility jq is an external dependency of the lekt test "
            "suite. It was not found in PATH. Aborting..."
        )


@pytest.fixture()
def test_lexeme():
    """ example lexeme fixture: <Lexeme lemma=llegar pos=VERB> pk=37 """
    return Lexeme.objects.get(pk=37)


@pytest.fixture()
def test_feature():
    """ example lexeme fixture: <Feature Mood=Cnd conditional mood> pk=36 """
    return Feature.objects.get(pk=36)


@pytest.fixture()
def test_user():
    """ gets fresh user account to test with """
    user = User.objects.create(
        username="test_user", password="sdfgsdfg", email="test@a.com"
    )
    return user


@pytest.fixture()
def test_subscription(test_user):
    """ get en-es subscription for test_user """
    en = Language.objects.get(lid="en")
    es = Language.objects.get(lid="es")
    sub = LanguageSubscription.objects.create(
        owner_id=test_user.userprofile.id,
        base_lang=es,
        base_voice_id=es.default_voice_id,
        target_lang=en,
        target_voice_id=en.default_voice_id,
    )
    return sub


@pytest.fixture
def test_tracked_list(test_subscription):
    """ get a tracked list for test_subscription """
    tlist = TrackedList.objects.create(subscription=test_subscription, name="Test List")
    return tlist


def jq(query: str, input):
    """simple wrapper around jq"""
    return jq_base(query).input(input).all()
