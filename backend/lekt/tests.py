from test_plus.test import TestCase
from django.db.models import Model
from django.contrib.auth.models import User
from django.contrib import auth
from factory.django import DjangoModelFactory
from factory import Faker
from .models import Word, Phrase, UserProfile
from django.http.response import HttpResponse
from rest_framework.test import APIClient
from django.test import tag

import sys
import json
from jq import jq
import logging

logger = logging.getLogger(__name__)

#  TODO 03/12/20 psacawa: Move this whole suite to pytest


class JqTestCase(TestCase):
    """
    My TestCase subclass that admits testings of JSON API results via JQ query strings.
    """

    @staticmethod
    def _parse_data(response: HttpResponse):
        if not hasattr(response, "parsed_data"):
            response.parsed_data = json.loads(response.content)

    def assertEqualJq(self, response: HttpResponse, query: str, expected, **kwargs):
        JqTestCase._parse_data(response)
        result = jq(query).transform(response.parsed_data, multiple_output=True)
        self.assertEqual(result, expected, **kwargs)

    def assertInJq(self, response: HttpResponse, query: str, expected, **kwargs):
        JqTestCase._parse_data(response)
        result = jq(query).transform(response.parsed_data, multiple_output=True)
        self.assertIn(result, expected, **kwargs)

    def assertNotInJq(self, response: HttpResponse, query: str, expected, **kwargs):
        JqTestCase._parse_data(response)
        result = jq(query).transform(response.parsed_data, multiple_output=True)
        self.assertNotIn(result, expected, **kwargs)


class UserFactory(DjangoModelFactory):
    class Meta:
        model = User

    username = Faker("first_name")


class AccountCreator(object):
    def setUp(self):
        #  self.user : User = UserFactory.create ()
        self.user: User = User(username="user")
        self.user.set_password("pass")
        self.user.save()


#  @tag ('api')
class APITests(AccountCreator, JqTestCase):
    """
    Test API views.
    """

    #  fixtures = ["test_data_1000.json"]
    client_class = APIClient

    def test_profile_view(self):
        response: HttpResponse = self.client.get("/api/profile/")
        self.response_403(response)
        self.client.login(username="user", password="pass")
        response: HttpResponse = self.client.get("/api/profile/")
        self.response_200(response)
        self.assertEqualJq(response, ".subscription_set|length", [0])
        self.client.get("/configure/")
        self.assertEqualJq(response, ".subscription_set|length", [1])

    def test_word_completion_view(self):
        """ /api/word/"""
        response: HttpResponse = self.client.get("/api/words/?prompt=loc")
        data = json.loads(response.content)
        norms = jq(".results[].norm").transform(data, multiple_output=True)
        self.assertIn("locación", norms)
        self.assertIn("local", norms)
        self.assertNotIn("block", norms)

        response: HttpResponse = self.client.get("/api/words/?prompt=legal&lid=en")
        data = json.loads(response.content)
        norms = jq(".results[].norm").transform(data, multiple_output=True)
        lids = jq(".results[].lang").transform(data, multiple_output=True)
        self.assertIn("legal", norms)
        self.assertIn(3, lids)
        self.assertNotIn("legales", norms)
        self.assertNotIn(4, lids)

        response: HttpResponse = self.client.get("/api/words/?prompt=legal&lid=es")
        data = json.loads(response.content)
        norms = jq(".results[].norm").transform(data, multiple_output=True)
        lids = jq(".results[].lang").transform(data, multiple_output=True)
        self.assertNotIn(3, lids)
        self.assertIn("legales", norms)
        self.assertIn(4, lids)

    def test_language_view(self):
        """ /api/language/ """
        response: HttpResponse = self.client.get("/api/language/?lid=es")
        self.assertEqualJq(response, ".count", [1])
        self.assertEqualJq(response, ".results[].lid", ["es"])
        self.assertEqualJq(response, ".results[].name", ["Spanish"])
        self.assertEqualJq(response, ".results[].default_voice", [5])
        response: HttpResponse = self.client.get("/api/language/?lid=ru")
        russian_voiceset = [
            {
                "id": 2,
                "name": "Maxim",
                "accent": "Russian",
                "aid": "ru-RU",
                "gender": "M",
                "lang": 2,
            },
            {
                "id": 48,
                "name": "Tatyana",
                "accent": "Russian",
                "aid": "ru-RU",
                "gender": "F",
                "lang": 2,
            },
        ]
        self.assertEqualJq(response, ".results[].voice_set[]", russian_voiceset)

    def test_subscription_view(self):
        user: User = User.objects.create(username="user_sub")
        user.set_password("pass")
        user.save()

        response = self.client.get("/api/subs/")
        self.response_403(response)
        self.client.login(username="user_sub", password="pass")
        response = self.client.get("/api/subs/")
        self.response_200(response)
        self.assertEqualJq(
            response,
            ".count",
            [0],
            msg="Virgin account did not have zero subscriptions",
        )
        self.client.get("/configure/")
        response = self.client.get("/api/subs/")
        self.response_200(response)
        self.assertEqualJq(
            response,
            ".count",
            [1],
            msg="Virgin account did not get subscription after visiting conf page",
        )


class FrontendViewTests(AccountCreator, TestCase):
    """ 
    Test frontend views.
    fixtures = ["test_data_1000.json"]
    """

    def test_home(self):
        with self.assertNumQueries(0):
            response = self.client.get("/")
        self.response_200(response)


class ModelTests(TestCase):
    """Test basic model functionality."""

    def test_userprofile_created(self):
        user = User.objects.create(username="user1", password="pass")
        assoc_profile_num = UserProfile.objects.filter(user__username="user1").count()
        self.assertEqual(assoc_profile_num, 1)
