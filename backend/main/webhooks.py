import logging

from djstripe import webhooks
from stripe import Event

logger = logging.getLogger(__name__)


@webhooks.handler("customer.subscription.trial_will_end")
def trial_will_end_handler(event: Event, **kwargs):
    print("We should probably notify the user at this point")
    data = event["data"]
    logger.info(f"{event=}")
    logger.info(f"{data=}")


@webhooks.handler("checkout.session.completed", "invoice.paid")
def provision_access(event: Event, **kwargs):
    """
    Payment is successful and the subscription is created or invoice was paid.
    You should provision the subscription and save the customer ID to your database.
    Continue to provision the subscription as payments continue to be made.
    Store the status in your database and check when a user accesses your service.
    This approach helps you avoid hitting rate limits.
    """
    data = event["data"]
    logger.info(f"{event=}")
    logger.info(f"{data=}")


@webhooks.handler("invoice.payment_failed")
def payment_failed_handler(event: Event, **kwargs):
    """
    The payment failed or the customer does not have a valid payment method.
    The subscription becomes past_due. Notify your customer and send them to the
    customer portal to update their payment information.
    """
    print("We should probably notify the user at this point")
    data = event["data"]
    logger.info(f"{event=}")
    logger.info(f"{data=}")
