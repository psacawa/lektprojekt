import logging

import stripe
from allauth.socialaccount.providers.github.views import GitHubOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from dj_rest_auth.registration.views import SocialLoginView
from django.conf import settings
from django.http import HttpRequest, HttpResponse, HttpResponseBadRequest
from django.http.request import HttpRequest
from django.shortcuts import redirect
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from django.views.decorators.http import require_http_methods
from djstripe.models import Price
from djstripe.models.checkout import Session
from rest_framework import generics, mixins, viewsets
from rest_framework.decorators import api_view

from .serializers import PriceSerializer

logger = logging.getLogger(__name__)

HOUR = 60 * 60


def healthz(request: HttpRequest):
    """Health check."""
    return HttpResponse("ok", status=200)


#  STRIPE


@method_decorator(cache_page(HOUR), name="dispatch")
class PriceViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Price.objects.all().select_related("product").filter(active=True)
    serializer_class = PriceSerializer


#  TODO 31/07/20 psacawa: make this rest instead?
@require_http_methods(["POST"])
def create_checkout_session(request: HttpRequest):
    """Create a CheckoutSession object in the Stripe API, redirect the user to the  web
    view of it."""
    try:
        price_id = request.data["price_id"]
        price = Price.objects.get(id=price_id)
        checkout_session = stripe.checkout.Session.create(
            success_url=(
                f"https://{settings.WEB_DOMAIN}/payments?"
                "session_id={CHECKOUT_SESSION_ID}&status=success"
            ),
            cancel_url=(
                f"https://{settings.WEB_DOMAIN}/payments?"
                "session_id={CHECKOUT_SESSION_ID}&status=cancelled"
            ),
            payment_method_types=["card"],
            mode="subscription",
            line_items=[{"price": price, "quantity": 1}],
        )
        return redirect(
            checkout_session.url,
        )
    except KeyError as e:
        return HttpResponseBadRequest("No price_id passed")
    except Price.DoesNotExist as e:
        return HttpResponseBadRequest("Unsupported price_id")
    except Exception as e:
        logger.error("Creating checkout session failed")
        raise (e)


class CheckoutSessionView(generics.RetrieveAPIView):
    class Meta:
        models = Session
        fields = "__all__"


#  THIRD-PARTY AUTH


class GithubLoginView(SocialLoginView):
    adapter_class = GitHubOAuth2Adapter
    callback_url = "http://localhost:8000/accounts/github/login/callback/"
    client_class = OAuth2Client
