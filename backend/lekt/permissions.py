import logging

from django.http import Http404
from rest_framework.permissions import BasePermission
from rest_framework.request import Request
from rest_framework.views import APIView

from .models import LanguageSubscription, TrackedList, TrackedObservable, UserProfile

logger = logging.getLogger(__name__)


#  the following permissions test whether thw user associated with a given request owns a
#  particular object. Since DRF runs has_permission always and has_object_permission later
#  if it's a retrieve/destroy operation, these permissions attempt to cache the results of
#  queries between the two method calls


#  TODO 27/02/20 psacawa: fix these


class IsSubscriptionOwner(BasePermission):
    def has_object_permission(
        self, request: Request, view: APIView, sub: LanguageSubscription
    ):
        profile: UserProfile = sub.owner
        return request.user.id == profile.user_id


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
            profile = UserProfile.objects.get(subscriptions__lists__id=list_pk)
        except UserProfile.DoesNotExist as e:
            raise Http404
        return request.user.id == profile.user_id

    def has_object_permission(
        self, request: Request, view: APIView, tracked_list: TrackedList
    ):
        profile: UserProfile = tracked_list.subscription.owner
        return request.user.id == profile.user_id


class IsTrackedObservableOwner(BasePermission):
    def has_permission(self, request: Request, view: APIView):
        list_pk = view.kwargs.get("list_pk")
        try:
            self._tracked_list: TrackedList = TrackedList.objects.get(id=list_pk)
        except TrackedList.DoesNotExist as e:
            raise Http404
        self._subscription: LanguageSubscription = self._tracked_list.subscription
        self._profile: UserProfile = self._subscription.owner
        return request.user.id == self._profile.user_id

    def has_object_permission(
        self, request: Request, view: APIView, tracked_obs: TrackedObservable
    ):
        profile: UserProfile = tracked_obs.tracked_list.subscription.owner
        return request.user.id == profile.user_id
