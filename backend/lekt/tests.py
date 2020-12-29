import sys

import pytest
from assertpy import assert_that
from rest_framework.response import Response
from rest_framework.test import APIClient

from .models import Language, Phrase


@pytest.mark.django_db
class LexemeViewTest:
    def search_test(self, client: APIClient):
        response: Response = client.get("/api/lexemes/?lang=es&prompt=per")
        assert response.status_code == 200
        results = response.data["results"]
        assert_that(results).extracting("lemma").contains("pero", "personal")


@pytest.mark.django_db
class AnnotationViewTest:
    def list_test(self, client: APIClient):
        response: Response = client.get("/api/annots/?lid=es")
        assert response.status_code == 200
        results = response.data["results"]
        assert_that(results).is_length(46).extracting("explanation").contains(
            "dative case",
            "present tense",
        )

    def complete_test(self, client: APIClient):
        response: Response = client.get("/api/annots/?lid=es&prompt=Tense")
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
    def list_test(self, client: APIClient):
        response: Response = client.get("/api/languages/")
        assert response.status_code == 200
        assert "results" in response.data
        results = response.data["results"]
        assert_that(results).is_length(20)


@pytest.mark.django_db
class PhrasePairViewTest:
    def lexeme_search_test(self, client: APIClient):
        #  <Lexeme lemma=ser pos=AUX> pk=67
        response: Response = client.get("/api/pairs/?base=en&target=es&lexeme=67")
        assert response.status_code == 200
        results = response.data["results"]
        assert_that(results).contains(
            {
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

    def annot_search_test(self, client: APIClient):
        #  <Annotation VerbForm=Ger present particle> pk=71
        response: Response = client.get("/api/pairs/?base=en&target=es&annot=71")
        assert response.status_code == 200
        results = response.data["results"]
        assert_that(results).contains(
            {
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

    def no_language_search_test(self, client: APIClient):
        response: Response = client.get("/api/pairs/?base=es&lexeme=67")
        print(response.data)
        assert response.status_code == 400
        assert "target" in response.data
        assert_that(response.data["target"]).is_equal_to(["This field is required."])

        response: Response = client.get("/api/pairs/?target=es&lexeme=67")
        print(response.data)
        assert response.status_code == 400
        assert "base" in response.data
        assert_that(response.data["base"]).is_equal_to(["This field is required."])
