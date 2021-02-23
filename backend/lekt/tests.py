import sys
from pprint import pprint

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
class FeatureViewTest:
    def list_test(self):
        with assertNumQueries(1):
            response: Response = client.get("/api/features/?lang=4")
            assert response.status_code == 200
        results = response.data
        assert_that(results).is_length(46).extracting("description").contains(
            "dative case",
            "present tense",
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
class PhrasePairViewTest:
    def phrasepair_detail_view_test(self):
        with assertNumQueries(4):
            response: Response = client.get("/api/pairs/100/")
            assert response.status_code == 200

        assert_that(response.data)


@pytest.mark.django_db
class PhrasePairLexemeSearchViewTest:
    #  <Lexeme lemma=deber pos=AUX> pk=35
    #  <Lexeme lemma=llegar pos=VERB> pk=37
    #  <Lexeme lemma=ser pos=AUX> pk=67

    def lexeme_search_test(self):
        with assertNumQueries(3):
            response = client.get(
                "/api/pairs/lexeme-search/?base=3&target=4&lexemes=67"
            )
            assert response.status_code == 200

    @pytest.mark.parametrize(
        "url",
        [
            "/api/pairs/lexeme-search/?base=3&target=4&lexemes=35,37",
            "/api/pairs/lexeme-search/?base=3&target=4&lexemes=35,37&noise=ASDF",
        ],
    )
    def lexeme_search_success_test(self, url):
        response: Response = client.get(url)
        pprint(response.data)
        assert response.status_code == 200, f" Wrong status code at {url}"

    @pytest.mark.parametrize(
        "url",
        [
            "/api/pairs/lexeme-search/?base=3&target=&lexemes=67",
            "/api/pairs/lexeme-search/?base=&target=4&lexemes=67",
            "/api/pairs/lexeme-search/?target=4&lexemes=67",
            "/api/pairs/lexeme-search/?base=ASDF&target=4&lexemes=67",
        ],
    )
    def lexeme_search_malformed_test(self, url):
        response: Response = client.get(url)
        pprint(response.data)
        assert response.status_code == 400, f" Wrong status code at {url}"

    def no_language_search_test(self):
        response: Response = client.get("/api/pairs/?base=es&lexeme=67")
        assert response.status_code == 400
        assert "target" in response.data
        assert_that(response.data["target"]).is_equal_to(["This field is required."])
        assert_that(response.data["base"]).is_equal_to(["Enter a number."])

        response: Response = client.get("/api/pairs/?target=es&lexeme=67")
        assert response.status_code == 400
        assert "base" in response.data
        assert_that(response.data["base"]).is_equal_to(["This field is required."])
        assert_that(response.data["target"]).is_equal_to(["Enter a number."])


@pytest.mark.django_db
class PhrasePairFeatureSearchViewTest:
    #  <Feature Mood=Cnd conditional mood> pk=19
    #  <Feature VerbForm=Ger present particle> pk=71
    #  <Feature Polite=Form Polite=Form> pk=76

    def feature_search_test(self):
        #  <Feature VerbForm=Ger present particle> pk=71
        with assertNumQueries(3):
            response: Response = client.get(
                "/api/pairs/feature-search/?base=3&target=4&features=71"
            )
            assert response.status_code == 200
        results = response.data["results"]

    @pytest.mark.parametrize(
        "url",
        [
            "/api/pairs/feature-search/?base=3&target=4&features=19,71",
            "/api/pairs/feature-search/?base=3&target=4&features=19,71&noise=ASDF",
        ],
    )
    def feature_search_success_test(self, url):
        response: Response = client.get(url)
        pprint(response.data)
        assert response.status_code == 200, f" Wrong status code at {url}"

    @pytest.mark.parametrize(
        "url",
        [
            "/api/pairs/feature-search/?base=3&target=&features=",
            "/api/pairs/feature-search/?base=&target=4",
            "/api/pairs/feature-search/?base=3&target=&lexemes=19",
            "/api/pairs/feature-search/?base=ASDF&target=4&features=19",
        ],
    )
    def feature_search_malformed_test(self, url):
        response: Response = client.get(url)
        print(response.data)
        assert response.status_code == 400, f" Wrong status code at {url}"


@pytest.mark.django_db
class PhrasePairObservableSearchViewTest:
    #  <Lexeme lemma=deber pos=AUX> pk=35
    #  <Lexeme lemma=llegar pos=VERB> pk=19
    #  <Feature Mood=Cnd conditional mood> pk=19
    #  <Feature VerbForm=Ger present particle> pk=71

    def observable_search_test(self):
        with assertNumQueries(6):
            response: Response = client.get(
                "/api/pairs/search/?base=3&target=4&lexemes=35,19&features=19,71"
            )
            assert response.status_code == 200
        results = response.data["results"]

    @pytest.mark.parametrize(
        "url",
        [
            "/api/pairs/search/?base=3&target=4&features=19,71",
            "/api/pairs/search/?base=3&target=4&lexemes=35.19&noise=ASDF",
            "/api/pairs/search/?base=3&target=4&features=19,71&lexemes=35,19&noise=ASDF",
        ],
    )
    def observable_search_success_test(self, url):
        response: Response = client.get(url)
        print(response.data)
        assert response.status_code == 200, f" Wrong status code at {url}"

    @pytest.mark.parametrize(
        "url",
        [
            "/api/pairs/search/?base=3&target=4&features=",
            "/api/pairs/search/?base=3&target=4",
            "/api/pairs/search/?base=3&target=4&lexemes=",
            "/api/pairs/search/?base=3&target=4&features=35 19",
            "/api/pairs/search/?base=3&target=4&lexemes=ASDF",
            "/api/pairs/search/?base=ASDF&target=4&features=19",
        ],
    )
    def observable_search_malformed_test(self, url):
        response: Response = client.get(url)
        print(response.data)
        assert response.status_code == 400, f" Wrong status code at {url}"
