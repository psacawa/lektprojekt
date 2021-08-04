#  type: ignore
import sys
from pprint import pprint

import pytest
from assertpy import assert_that
from django.conf import settings
from pytest_django.asserts import assertNumQueries
from rest_framework.response import Response
from rest_framework.test import APIClient

from conftest import jq

from .models import (
    Feature,
    Language,
    LanguageCourse,
    Lexeme,
    Observable,
    Phrase,
    PhrasePair,
    TrackedList,
    TrackedObservable,
    User,
)

#  different apps represent auth(entication|orization) differently
#  using e.g. 404 instead. We split the difference
AUTH_FAILURE_CODES = (401, 403, 404)

client = APIClient()


@pytest.mark.django_db
def db_smoke_test():
    """Is the database correctly configured for this test suite. As documented in
    backend.rst, it runs on a fixed suite of 200 phrases. Check if these are loaded."""
    phrase_count = PhrasePair.objects.count()
    assert (
        phrase_count == 200
    ), f"database not configured correctly DATABASES = {settings.DATABASES}"


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
        assert_that(results).extracting("lid").contains("en", "es", "fr", "de")


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
    #  <Lexeme lemma=ser pos=AUX> pk=104

    def lexeme_search_test(self):
        with assertNumQueries(3):
            response = client.get(
                "/api/pairs/lexeme-search/?base=3&target=4&lexemes=104"
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
            "/api/pairs/lexeme-search/?base=3&target=&lexemes=104",
            "/api/pairs/lexeme-search/?base=&target=4&lexemes=104",
            "/api/pairs/lexeme-search/?target=4&lexemes=104",
            "/api/pairs/lexeme-search/?base=ASDF&target=4&lexemes=104",
        ],
    )
    def lexeme_search_malformed_test(self, url):
        response: Response = client.get(url)
        pprint(response.data)
        assert response.status_code == 400, f" Wrong status code at {url}"

    def no_language_search_test(self):
        response: Response = client.get("/api/pairs/?base=es&lexeme=104")
        assert response.status_code == 400
        assert "target" in response.data
        assert_that(response.data["target"]).is_equal_to(["This field is required."])
        assert_that(response.data["base"]).is_equal_to(["Enter a number."])

        response: Response = client.get("/api/pairs/?target=es&lexeme=104")
        assert response.status_code == 400
        assert "base" in response.data
        assert_that(response.data["base"]).is_equal_to(["This field is required."])
        assert_that(response.data["target"]).is_equal_to(["Enter a number."])


@pytest.mark.django_db
class PhrasePairFeatureSearchViewTest:
    #  <Feature Mood=Cnd conditional mood> pk=36
    #  <Feature VerbForm=Ger present particle> pk=682
    #  <Feature Polite=Form Polite=Form> pk=878

    def feature_search_test(self):
        #  <Feature VerbForm=Ger present particle> pk=682
        #  with assertNumQueries(3):
        response: Response = client.get(
            "/api/pairs/feature-search/?base=3&target=4&features=682"
        )
        assert response.status_code == 200
        results = response.data["results"]

    @pytest.mark.parametrize(
        "url",
        [
            "/api/pairs/feature-search/?base=3&target=4&features=36,682",
            "/api/pairs/feature-search/?base=3&target=4&features=36,682&noise=ASDF",
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
            "/api/pairs/feature-search/?base=3&target=&lexemes=36",
            "/api/pairs/feature-search/?base=ASDF&target=4&features=36",
        ],
    )
    def feature_search_malformed_test(self, url):
        response: Response = client.get(url)
        print(response.data)
        assert response.status_code == 400, f" Wrong status code at {url}"


@pytest.mark.django_db
class PhrasePairObservableSearchViewTest:
    #  <Lexeme lemma=deber pos=AUX> pk=35
    #  <Lexeme lemma=llegar pos=VERB> pk=37
    #  <Feature Mood=Cnd conditional mood> pk=36
    #  <Feature VerbForm=Ger present particle> pk=682

    def observable_search_test(self):
        with assertNumQueries(6):
            response: Response = client.get(
                "/api/pairs/search/?base=3&target=4&lexemes=35,37&features=36,682"
            )
            assert response.status_code == 200
        results = response.data["results"]

    @pytest.mark.parametrize(
        "url",
        [
            "/api/pairs/search/?base=3&target=4&features=36,682",
            "/api/pairs/search/?base=3&target=4&lexemes=35.37&noise=ASDF",
            "/api/pairs/search/?base=3&target=4&features=36,682&lexemes=35,37&noise=ASDF",
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
            "/api/pairs/search/?base=3&target=4&features=35 36",
            "/api/pairs/search/?base=3&target=4&lexemes=ASDF",
            "/api/pairs/search/?base=ASDF&target=4&features=36",
        ],
    )
    def observable_search_malformed_test(self, url):
        response: Response = client.get(url)
        print(response.data)
        assert response.status_code == 400, f" Wrong status code at {url}"


@pytest.mark.django_db
class CourseViewTest:
    def course_crud_test(self, test_user):
        assert LanguageCourse.objects.count() == 0
        client.force_login(user=test_user)

        #  CREATE
        response: Response = client.post(
            "/api/courses/", {"base_lang": 3, "target_lang": 4}
        )
        assert response.status_code == 201
        assert LanguageCourse.objects.count() == 1

        #  READ
        response = client.get("/api/courses/")
        assert response.status_code == 200
        assert_that(response.data["results"]).is_length(1)


@pytest.mark.django_db
class TrackedListViewTest:
    def tracked_list_crud_test(self, test_course, test_user):
        client.force_login(user=test_user)

        #  CREATE
        with assertNumQueries(5):
            response: Response = client.post(
                "/api/lists/", {"name": "mylist", "course": test_course.id}
            )
        output = response.data
        assert response.status_code == 201
        assert output["name"] == "mylist"
        tlist = TrackedList.objects.get(pk=output["id"])

        #  UPDATE
        with assertNumQueries(7):
            response = client.patch(
                f"/api/lists/{tlist.id}/", data={"name": "new_mylist"}
            )
        assert response.status_code == 200
        assert response.data["name"] == "new_mylist"

        #  DESTROY
        with assertNumQueries(7):
            response = client.delete(f"/api/lists/{tlist.id}/")
        assert response.status_code == 204

    def not_found_test(self):
        response: Response = client.delete("/api/lists/100/")
        assert response.status_code == 404

    def unauthorized_request_test(self, test_tracked_list):
        #  UPDATE
        tlist = test_tracked_list
        response: Response = client.patch(f"/api/lists/{tlist.id}/")
        assert response.status_code in AUTH_FAILURE_CODES

        #  DESTROY
        response = client.delete(f"/api/lists/{tlist.id}/")
        assert response.status_code in AUTH_FAILURE_CODES


@pytest.mark.django_db
class TrackedObservableViewTest:
    #  <Lexeme lemma=deber pos=AUX> pk=35
    #  <Feature Mood=Cnd conditional mood> pk=36

    def tracked_obs_crud_test(self, test_user, test_tracked_list):
        tlist = test_tracked_list
        client.force_login(user=test_user)

        #  CREATE
        response: Response = client.post(
            f"/api/lists/{tlist.id}/obs/", data={"observable": 35}
        )
        assert response.status_code == 201
        tobs_id = response.data["id"]

        #  LIST
        response = client.get(f"/api/lists/{tlist.id}/obs/")
        assert response.status_code == 200
        assert_that(response.data["results"]).is_length(1).extracting(
            "observable"
        ).extracting("lemma").contains("deber")

        #  DESTROY
        response = client.delete(f"/api/lists/{tlist.id}/obs/35/")
        assert response.status_code == 204

    def not_found_test(self, test_user, test_tracked_list):
        client.force_login(user=test_user)
        tlist = test_tracked_list
        response: Response = client.delete(f"/api/lists/{tlist.id}/obs/1/")
        assert response.status_code == 404

    def unauthorized_request_test(self, test_tracked_list):
        tlist = test_tracked_list

        #  CREATE
        response: Response = client.post(
            f"/api/lists/{tlist.id}/obs/", data={"observable": 35}
        )
        assert response.status_code in AUTH_FAILURE_CODES

        #  LIST
        response = client.get(f"/api/lists/{tlist.id}/obs/")
        assert response.status_code in AUTH_FAILURE_CODES

        #  DESTROY
        tobs = TrackedObservable.objects.create(observable_id=35, tracked_list=tlist)
        response = client.delete(f"/api/lists/{tlist.id}/obs/35/")
        assert response.status_code in AUTH_FAILURE_CODES

    def lexeme_and_feature_list_test(
        self, test_tracked_list, test_user, test_lexeme, test_feature
    ):
        tlist: TrackedList = test_tracked_list
        client.force_login(user=test_user)
        tlist.add_observables((test_feature, test_lexeme))

        #  OBSERVABLES
        response: Response = client.get(f"/api/lists/{tlist.id}/obs/")
        assert_that(response.data["results"]).is_length(2).extracting(
            "observable"
        ).extracting("id").is_equal_to([test_feature.id, test_lexeme.id])

        #  LEXEMES
        response = client.get(f"/api/lists/{tlist.id}/lexemes/")
        assert response.status_code == 200
        assert_that(response.data["results"]).is_length(1).extracting(
            "observable"
        ).extracting("lemma").is_equal_to(["llegar"])

        #  FEATURES
        response = client.get(f"/api/lists/{tlist.id}/features/")
        assert response.status_code == 200
        assert jq(".results[].observable|[.name, .value]", response.data) == [
            ["Mood", "Cnd"]
        ]


@pytest.mark.django_db
class PairCountViewTest:
    def list_test(self):
        response = client.get("/api/pair-counts/")
        assert response.status_code == 200


@pytest.mark.django_db
class SupportedLanguagesTest:
    def list_test(self):
        response = client.get("/api/supported-language-pairs/")
        assert response.status_code == 200
