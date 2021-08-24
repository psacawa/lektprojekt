#  type: ignore
import re
import sys
from pprint import pprint
from typing import List

import pytest
from assertpy import assert_that
from django.conf import settings
from django.core.mail import EmailMessage
from pytest_django.asserts import assertNumQueries
from rest_framework.response import Response
from rest_framework.test import APIClient

from main.models import User

AUTH_FAILURE_CODES = (401, 403, 404)


@pytest.mark.django_db
class PriceViewTest:
    def list_test(self, client: APIClient):
        with assertNumQueries(1):
            response: Response = client.get("/stripe/prices/")
            assert response.status_code == 200


@pytest.mark.django_db
class CheckoutSessionsTest:
    def unauthenticated_test(self, client: APIClient):
        response: Response = client.get("/stripe/checkout-sessions/")
        assert response.status_code in AUTH_FAILURE_CODES

    def create_list_test(self, test_user, client: APIClient):
        client.force_login(user=test_user)
        #  TODO 03/08/20 psacawa: create checkout_session
        #  ...
        response: Response = client.get("/stripe/checkout-sessions/")
        assert response.status_code == 200
        assert_that(response.data["results"])


@pytest.mark.django_db
class AuthTest:
    def unauthenticated_test(self, client: APIClient):
        response: Response = client.get("/auth/user/")
        assert response.status_code == 401

    def create_account_test(self, client: APIClient, mailoutbox: List[EmailMessage]):
        #  create account
        response: Response = client.post(
            "/auth/registration/",
            {
                "username": "user1",
                "email": "user1@fake.com",
                "password1": "sdfgsdfg",
                "password2": "sdfgsdfg",
            },
        )
        assert response.status_code == 201
        assert len(mailoutbox) == 1

        #  email confirmation message
        mail = mailoutbox[0]
        assert "Please Confirm Your E-mail Address" in mail.subject
        assert "user1" in mail.body
        assert "info@lex.quest" in mail.from_email
        assert "LexQuest" in mail.from_email
        assert ["user1@fake.com"] == mail.recipients()
        match = re.search(r"(?m)https?://.*/auth/confirm-email/.*", mail.body)
        assert match is not None, f"No email confirmation link in email {mail.body}"
        #  TODO 23/08/20 psacawa: assertion about origin of link?

        response = client.get("/auth/user/")
        assert response.status_code == 401

        response = client.get(match.group())
        assert response.status_code == 302

        response = client.get("/auth/user/")
        assert response.status_code == 200
        assert response.data["username"] == "user1"
        assert response.data["email"] == "user1@fake.com"
        assert (
            response.data["level"] == "basic"
        ), "New User didn't have support level basic"

        def password_reset_test(
            self, test_user: User, client: APIClient, mailoutbox: List[EmailMessage]
        ):
            #  my question: what the hell is this even testing?

            client.force_login(user=test_user)

            response = client.post("/auth/password/reset/", {"email": test_user.email})
            assert response.status_code == 200
            assert len(mailoutbox) == 1
