from allauth.account.adapter import DefaultAccountAdapter
from django.conf import settings
from django.http.request import HttpRequest
from django.urls import reverse


class AccountAdapter(DefaultAccountAdapter):
    """ Customized allauth adapter to turn off messaging"""

    def add_message(self, *args, **kwargs):
        pass

    def get_email_confirmation_url(self, request: HttpRequest, emailconfirmation):
        """This differs from upstream only in that the origin is changed from
        API_ORIGIN to API_ORIGIN, substituting funciionality of build_absolute_uri"""
        url = reverse("account_confirm_email", args=[emailconfirmation.key])
        ret: str = f"{settings.WEB_ORIGIN}{url}"
        return ret
