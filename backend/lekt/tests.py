import sys

import pytest
from assertpy import assert_that
from pytest_django.asserts import assertNumQueries
from rest_framework.response import Response
from rest_framework.test import APIClient

from conftest import jq

from .models import Language, Phrase

client = APIClient()


@pytest.mark.django_db
class LexemeViewTest:
    def search_test(self):
        with assertNumQueries(2):
            response: Response = client.get("/api/lexemes/?lang=4&prompt=per")
            assert response.status_code == 200
        results = response.data["results"]
        assert_that(results).extracting("lemma").contains("pero", "personal")


@pytest.mark.django_db
class AnnotationViewTest:
    def list_test(self):
        with assertNumQueries(2):
            response: Response = client.get("/api/annots/?lang=4")
            assert response.status_code == 200
        results = response.data["results"]
        assert_that(results).is_length(46).extracting("explanation").contains(
            "dative case",
            "present tense",
        )

    def complete_test(self):
        with assertNumQueries(2):
            response: Response = client.get("/api/annots/?lang=4&prompt=Tense")
            assert response.status_code == 200
        results = response.data["results"]
        assert_that(results).is_length(4).extracting("explanation").is_equal_to(
            [
                "future tense",
                "imperfect tense",
                "preterite tense",
                "present tense",
            ]
        )


@pytest.mark.django_db
class LanguageViewTest:
    def list_test(self):
        with assertNumQueries(3):
            response: Response = client.get("/api/languages/")
            assert response.status_code == 200
        assert "results" in response.data
        results = response.data["results"]
        assert_that(results).is_length(20)


@pytest.mark.django_db
class PhrasePairViewsTest:
    def phrasepair_detail_view_test(self, django_assert_num_queries):
        with assertNumQueries(4):
            response: Response = client.get("/api/pairs/100/")
            assert response.status_code == 200

        assert_that(response.data)

    def lexeme_search_test(self):
        #  <Lexeme lemma=ser pos=AUX> pk=67
        with assertNumQueries(3):
            response: Response = client.get(
                "/api/pairs/lexeme-search/?base=3&target=4&lexemes=67"
            )
            assert response.status_code == 200
        results = response.data["results"]
        assert_that(results).contains(
            {
                "id": 7,
                "base": {
                    "id": 7,
                    "text": "It remains to be seen whether the candidate can weather "
                    "this latest storm.",
                },
                "target": {
                    "id": 8,
                    "text": "Está por verse si el candidato es capaz de superar este "
                    "escándalo más reciente.",
                    "lexeme_matches": [{"id": 90, "number": 6, "start": 31, "end": 33}],
                },
            }
        )

    def annot_search_test(self):
        #  <Annotation VerbForm=Ger present particle> pk=71
        with assertNumQueries(3):
            response: Response = client.get(
                "/api/pairs/annot-search/?base=3&target=4&annots=71"
            )
            assert response.status_code == 200
        results = response.data["results"]
        assert_that(results).contains(
            {
                "id": 109,
                "base": {
                    "id": 109,
                    "text": "What's that song called? - Do you mean the one playing "
                    "a moment ago?",
                },
                "target": {
                    "id": 110,
                    "text": "¿Cómo se llama esa canción? - ¿Dices la que estaba sonando "
                    "hace un momento?",
                    "annot_matches": [
                        {"id": 1194, "number": 13, "start": 51, "end": 58}
                    ],
                },
            },
        )

    def no_language_search_test(self):
        response: Response = client.get("/api/pairs/?base=es&lexeme=67")
        print(response.data)
        assert response.status_code == 400
        assert "target" in response.data
        assert_that(response.data["target"]).is_equal_to(["This field is required."])
        assert_that(response.data["base"]).is_equal_to(["Enter a number."])

        response: Response = client.get("/api/pairs/?target=es&lexeme=67")
        print(response.data)
        assert response.status_code == 400
        assert "base" in response.data
        assert_that(response.data["base"]).is_equal_to(["This field is required."])
        assert_that(response.data["target"]).is_equal_to(["Enter a number."])
