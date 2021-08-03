import logging

import stripe
from allauth.socialaccount.providers.github.views import GitHubOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from dj_rest_auth.registration.views import SocialLoginView
from django.conf import settings
from django.http import HttpRequest, HttpResponse, JsonResponse
from django.http.request import HttpRequest
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from djstripe.models import Price
from djstripe.models.checkout import Session
from rest_framework import mixins, viewsets
from rest_framework.exceptions import APIException
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request

from lekt.models import UserProfile

from .serializers import CheckoutSessionSerializer, PriceSerializer

logger = logging.getLogger(__name__)

HOUR = 60 * 60


def healthz(request: HttpRequest):
    """Health check."""
    return HttpResponse("ok", status=200)


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
        return self.request.user.userprofile.checkout_sessions.all().order_by("created")

    def create(self, request: Request, **kwargs):
        """Create a CheckoutSession object in the Stripe API, redirect the user to the  web
        view of it."""
        try:
            price_id = request.data["price_id"]
            price = Price.objects.get(id=price_id)
            #  TODO 02/08/20 psacawa: perhaps worthy of further abstraction?
            WEB_ORIGIN = (
                "http://localhost:3000" if settings.DEBUG else "https://www.lex.quest"
            )
            stripe_session = stripe.checkout.Session.create(
                success_url=(
                    f"{WEB_ORIGIN}/payments?"
                    "session_id={CHECKOUT_SESSION_ID}&status=success"
                ),
                cancel_url=(
                    f"{WEB_ORIGIN}/payments?"
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
            userprofile: UserProfile = request.user.userprofile
            userprofile.checkout_sessions.add(django_session.djstripe_id)
            logger.info(f"Session {django_session.id} attached to {userprofile}")

            return JsonResponse(
                {
                    "redirect_url": stripe_session.url,
                }
            )
        except KeyError as e:
            raise APIException("No price_id passed")
        except Price.DoesNotExist as e:
            return APIException("Unsupported price_id")
        except Exception as e:
            logger.error(f"Creating checkout session for {price_id} failed")
            raise e

    class Meta:
        models = Session
        fields = "__all__"


#  THIRD-PARTY AUTH


class GithubLoginView(SocialLoginView):
    adapter_class = GitHubOAuth2Adapter
    callback_url = "http://localhost:8000/accounts/github/login/callback/"
    client_class = OAuth2Client
