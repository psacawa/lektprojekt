import logging

from allauth.account.models import EmailAddress, EmailConfirmation
from allauth.account.signals import email_confirmed
from django.db import IntegrityError, transaction
from django.dispatch import receiver
from django.http.request import HttpRequest

logger = logging.getLogger(__name__)


@receiver(email_confirmed)
def transfer_anonymous_profile(
    request: HttpRequest, email_address: EmailAddress, **kwargs
):
    """When a user confirms their email, that HTTP GET fired from their email will carry
    the ambient authority of their session, and the anonymous user attached to it. This
    signal receiver will then transfer the courses of the uses to the new User account
    and delete the old."""
    if request.user.is_authenticated:
        try:
            with transaction.atomic():
                old_user = request.user
                new_user = email_address.user
                for course in old_user.courses.all():
                    course.owner = new_user
                    course.save()
                old_user.delete()
                logger.info(
                    f"Email address {email_address} confirmed: "
                    f"profile of {request.user=} tranferred"
                )
        except IntegrityError as e:
            logger.error(
                f"Transfor of profile of {request.user=} to {email_address} failed."
            )
