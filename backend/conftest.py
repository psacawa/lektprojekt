import shutil
from typing import Dict

import pytest
from assertpy import add_extension
from jq import jq as jq_base
from rest_framework.test import APIClient

from lekt.models import Feature, Language, LanguageCourse, Lexeme, TrackedList
from main.models import User


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
def test_course(test_user):
    """ get en-es course for test_user """
    en = Language.objects.get(lid="en")
    es = Language.objects.get(lid="es")
    course = LanguageCourse.objects.create(
        owner_id=test_user.id,
        base_lang=es,
        base_voice_id=es.default_voice_id,
        target_lang=en,
        target_voice_id=en.default_voice_id,
    )
    return course


@pytest.fixture
def test_tracked_list(test_course):
    """ get a tracked list for test_course """
    tlist = TrackedList.objects.create(course=test_course, name="Test List")
    return tlist


@pytest.fixture
def client():
    """This returns a fresh  API client. This is inmportant in cases where the client  build
    up state, such as cookies"""
    return APIClient()


def jq(query: str, input):
    """simple wrapper around jq"""
    return jq_base(query).input(input).all()
