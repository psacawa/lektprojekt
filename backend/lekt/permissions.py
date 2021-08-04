import logging

from django.http import Http404
from rest_framework.permissions import BasePermission
from rest_framework.request import Request
from rest_framework.views import APIView

from main.models import User

from .models import LanguageCourse, TrackedList, TrackedObservable

logger = logging.getLogger(__name__)


#  the following permissions test whether thw user associated with a given request owns a
#  particular object. Since DRF runs has_permission always and has_object_permission later
#  if it's a retrieve/destroy operation, these permissions attempt to cache the results of
#  queries between the two method calls


#  TODO 27/02/20 psacawa: fix these


class IsCourseOwner(BasePermission):
    def has_object_permission(
        self, request: Request, view: APIView, course: LanguageCourse
    ):
        #  TODO 03/08/20 psacawa: save a query here
        user: User = course.owner
        return request.user == user


class IsTrackedListOwner(BasePermission):
    """
    This permission will check the URL param list_pk if one was passed, and the object
    identified in get_object
    """

    def has_permission(self, request: Request, view: APIView):
        list_pk = view.kwargs.get("list_pk")
        if list_pk is None:
            return True
        try:
            user = User.objects.get(courses__lists__id=list_pk)
        except User.DoesNotExist as e:
            raise Http404
        return request.user == user

    def has_object_permission(
        self, request: Request, view: APIView, tracked_list: TrackedList
    ):
        user: User = tracked_list.course.owner
        return request.user == user


class IsTrackedObservableOwner(BasePermission):
    def has_permission(self, request: Request, view: APIView):
        list_pk = view.kwargs.get("list_pk")
        try:
            self._tracked_list: TrackedList = TrackedList.objects.get(id=list_pk)
        except TrackedList.DoesNotExist as e:
            raise Http404
        self._course: LanguageCourse = self._tracked_list.course
        self._user: User = self._course.owner
        return request.user == self._user

    def has_object_permission(
        self, request: Request, view: APIView, tracked_obs: TrackedObservable
    ):
        user: User = tracked_obs.tracked_list.course.owner
        return request.user == user
