import sys

import pytest
from assertpy import assert_that
from rest_framework.response import Response
from rest_framework.test import APIClient


@pytest.mark.django_db
class LexemeViewTest:
    def search_test(self, client: APIClient):
        response: Response = client.get("/api/lexemes/?lang=en&prompt=t")
        assert response.status_code == 200


@pytest.mark.django_db
class PhraseViewTest:
    def search_test(self, client: APIClient):
        response: Response = client.get("/api/annots/?lang=es&prompt=Mood")
        assert response.status_code == 200


@pytest.mark.django_db
class LanguageViewTest:
    def list_test(self, client: APIClient):
        response: Response = client.get("/api/languages/")
        assert response.status_code == 200
        assert "results" in response.data
        results = response.data["results"]
        assert_that(results).is_length(20)
