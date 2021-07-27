import logging

import stripe
from allauth.socialaccount.providers.github.views import GitHubOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from dj_rest_auth.registration.views import SocialLoginView
from django.conf import settings
from django.http import HttpRequest, HttpResponse, HttpResponseBadRequest
from django.views.decorators.http import require_http_methods

logger = logging.getLogger(__name__)


def healthz(request: HttpRequest):
    """Health check."""
    return HttpResponse("ok", status=200)


@require_http_methods(["POST"])
def create_checkout_session(request: HttpRequest):
    """Create a CheckoutSession object in the Stripe API, redirect the user to the  web
    view of it."""
    try:
        price = request.POST["priceId"]
        stripe.checkout.Session.create(
            success_url="https://{settings.WEB_DOMAIN}/success.html?session_id={CHECKOUT_SESSION_ID}",
            cancel_url="https://{settings.WEB_DOMAIN}/canceled.html?session_id={CHECKOUT_SESSION_ID}",
            payment_method_types=["card"],
            mode="subscription",
            line_items=[{"price": price, "quantity": 1}],
        )
    except KeyError as e:
        return HttpResponseBadRequest("No priceId passed")
    except Exception as e:
        logger.error("Creating checkout session failed")
        raise (e)


class GithubLoginView(SocialLoginView):
    adapter_class = GitHubOAuth2Adapter
    callback_url = "http://localhost:8000/accounts/github/login/callback/"
    client_class = OAuth2Client
