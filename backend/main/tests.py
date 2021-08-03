#  type: ignore
import sys
from pprint import pprint

import pytest
from assertpy import assert_that
from django.conf import settings
from pytest_django.asserts import assertNumQueries
from rest_framework.response import Response
from rest_framework.test import APIClient

AUTH_FAILURE_CODES = (401, 403, 404)
client = APIClient()


@pytest.mark.django_db
class PriceViewTest:
    def list_test(self):
        with assertNumQueries(1):
            response: Response = client.get("/stripe/prices/")
            assert response.status_code == 200


@pytest.mark.django_db
class CheckoutSessionsTest:
    def unauthenticated_test(self):
        response: Response = client.get("/stripe/checkout-sessions/")
        assert response.status_code in AUTH_FAILURE_CODES

    def create_list_test(self, test_user):
        client.force_login(user=test_user)
        #  TODO 03/08/20 psacawa: create checkout_session
        #  ...
        response: Response = client.get("/stripe/checkout-sessions/")
        assert response.status_code == 200
        assert_that(response.data["results"])
