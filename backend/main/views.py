# type: ignore
import logging

import stripe
from allauth.socialaccount.providers.github.views import GitHubOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from dj_rest_auth.registration.views import SocialLoginView
from django.conf import settings
from django.contrib.auth.decorators import login_required
from django.http import HttpRequest, HttpResponse, JsonResponse
from django.http.request import HttpRequest
from django.shortcuts import redirect
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from django.views.generic import TemplateView
from djstripe.models import Customer, Price
from djstripe.models.checkout import Session
from rest_framework import mixins, viewsets
from rest_framework.exceptions import APIException
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request

from .models import User
from .serializers import CheckoutSessionSerializer, PriceSerializer

logger = logging.getLogger(__name__)

HOUR = 60 * 60

# AUTH


class PasswordResetView(TemplateView):
    """same as allauth, but override the origin"""

    template_name = "password_reset_confirm.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["WEB_ORIGIN"] = settings.WEB_ORIGIN
        return context


#  STRIPE


@method_decorator(cache_page(60), name="dispatch")
class PriceViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = (
        Price.objects.all()
        .select_related("product")
        .filter(active=True, livemode=settings.DJANGO_ENV == "production")
    )
    serializer_class = PriceSerializer
    pagination_class = None


class CheckoutSessionViewSet(
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):

    serializer_class = CheckoutSessionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user: User = self.request.user
        return user.checkout_sessions.all().order_by("created")

    def create(self, request: Request, **kwargs):
        """Create a CheckoutSession object in the Stripe API, redirect the user to the  web
        view of it."""
        try:
            price_id = request.data["price_id"]
        except KeyError as e:
            raise APIException("No price_id passed")
        try:
            price = Price.objects.get(id=price_id)
        except Price.DoesNotExist as e:
            return APIException("Unsupported price_id")
        #  TODO 02/08/20 psacawa: perhaps worthy of further abstraction?
        stripe_session = stripe.checkout.Session.create(
            success_url=(
                f"{settings.WEB_ORIGIN}/payments?"
                "session_id={CHECKOUT_SESSION_ID}&status=success"
            ),
            cancel_url=(
                f"{settings.WEB_ORIGIN}/payments?"
                "session_id={CHECKOUT_SESSION_ID}&status=cancelled"
            ),
            payment_method_types=["card"],
            mode="subscription",
            metadata={},
            line_items=[{"price": price, "quantity": 1}],
        )

        #  the webhook syncing can't have arrived yet, so we must manually write to DB
        #  this is an SQL INSERT when the webhook arrived, it will do an SQL UPDATE
        django_session = Session.sync_from_stripe_data(stripe_session)
        logger.info(f"Session {django_session.id} created/synced for {price_id}")
        user: User = request.user
        user.checkout_sessions.add(django_session.djstripe_id)
        logger.info(f"Session {django_session.id} attached to {user}")

        return JsonResponse(
            {
                "redirect_url": stripe_session.url,
            }
        )

    class Meta:
        models = Session
        fields = "__all__"


@login_required
def stripe_portal(request: HttpRequest):
    user: User = request.user
    try:
        customer = Customer.objects.get(subscriptions__user=user)
    except Customer.MultipleObjectsReturned as e:
        customer_ids = [
            cus.id for cus in Customer.objects.filter(subscriptions__user=user)
        ]
        logger.error(
            "User {user} has multiple stripe customer attached to him: {ids}".format(
                user=user, ids=",".join(customer_ids)
            )
        )
        raise e
    session = stripe.billing_portal.Session.create(
        customer=customer.id, return_url=f"{settings.WEB_ORIGIN}/profile/"
    )
    return redirect(session.url)


#  THIRD-PARTY AUTH


class GithubLoginView(SocialLoginView):
    adapter_class = GitHubOAuth2Adapter
    callback_url = "http://localhost:8000/accounts/github/login/callback/"
    client_class = OAuth2Client


#  HEALTH CHECK


def healthz(request: HttpRequest):
    """Health check."""
    return HttpResponse("ok", status=200)
