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
