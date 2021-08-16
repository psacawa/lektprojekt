import logging

import stripe
from django.conf import settings
from django.core.mail import send_mail
from django.db import transaction
from djstripe import webhooks
from djstripe.models import Customer, Event, Subscription
from sentry_sdk import capture_exception, capture_message

from main.models import User

logger = logging.getLogger(__name__)


@webhooks.handler("customer.subscription.trial_will_end")
def trial_will_end_handler(event: Event, **kwargs):
    print("We should probably notify the user at this point")
    logger.info(f"Event {event.id}: type {event.data['type']}")


@webhooks.handler("invoice.paid")
def invoice_paid_handler(event: Event, **kwargs):
    """Invoice was paid.
    Continue to provision the subscription as payments continue to be made.
    """
    logger.info(f"Invoice paid: {event.id}")


@webhooks.handler(
    "checkout.session.completed",
)
def session_completed_handler(event: Event, **kwargs):
    """
    Payment is successful and the subscription is created.
    You should provision the subscription and save the customer ID to your database.
    Store the status in your database and check when a user accesses your service.
    This approach helps you avoid hitting rate limits.
    """
    try:
        logger.info(f"Event {event.id}, type {event.type}")
        session_id = event.data["object"]["id"]
        user: User = User.objects.filter(checkout_sessions__id=session_id).first()

        #  provision access for user
        sub_id = event.data["object"]["subscription"]
        stripe_sub = stripe.Subscription.retrieve(id=sub_id)
        django_sub = Subscription.sync_from_stripe_data(stripe_sub)
        #  stripe_customer = stripe.Customer.retrieve(id=django_sub.customer_id)
        #  django_customer = Customer.sync_from_stripe_data(stripe_customer)
        with transaction.atomic():
            user.subscription = django_sub
            user.level = "plus"
            user.save()

        product = django_sub.plan.product
        message = (
            f"Thanks {user.username}!\n"
            f"Your subscription to {product.name} has been activated.\n"
            f"{settings.SITE_NAME} team\n"
        )
        send_mail(
            "Subscription Activated!",
            message=message,
            from_email=None,
            recipient_list=[user.email],
            fail_silently=False,
        )

        logger.info(f"Assigned subscription={django_sub} to {user=}")
    except Subscription.DoesNotExist as e:
        capture_exception(e)
        logger.error(
            f"Subscription for event {session_id} didn't exist after checkout completion"
        )
    except Exception as e:
        capture_message("Could not complete checkout session")
        capture_exception(e)
        session_id = event.data["object"]["id"]
        logger.error(f"Checkout completion for {session_id} failed.")
        raise e


@webhooks.handler("invoice.payment_failed")
def payment_failed_handler(event: Event, **kwargs):
    """
    The payment failed or the customer does not have a valid payment method.
    The subscription becomes past_due. Notify your customer and send them to the
    customer portal to update their payment information.
    """
    logger.info(f"Event {event.id}: type {event.data['object']}")
    invoice = event.data["object"]
    try:
        stripe_sub = invoice["subscription"]
        stripe_customer = invoice["customer"]
        django_sub = Subscription.sync_from_stripe_data(stripe_sub)
        django_customer = Customer.sync_from_stripe_data(stripe_customer)
        user: User = django_customer.subscriber
        message = (
            (
                f"Sorry, a payment for {user.username} failed.\n"
                f"{settings.SITE_NAME} team\n"
            ),
        )
        send_mail(
            "Payment failed",
            message=message,
            from_email=None,
            recipient_list=[user.email],
            fail_silently=False,
        )
    except Exception as e:
        capture_exception(e)
        capture_message("invoice.payment_failed didn't have a subscription")
        raise e
