import logging

from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import Language, LanguageSubscription, TrackedList, UserProfile

logger = logging.getLogger(__name__)


@receiver(post_save, sender=User)
def create_userprofile(sender, created: bool, instance: User, **kwargs):
    """Create a UserProfile object immediately about User creations"""
    if created:
        try:
            user_profile = UserProfile.objects.create(user=instance)
        except Exception as e:
            logger.error(e)
            raise e


@receiver(post_save, sender=LanguageSubscription)
def create_default_trackedlist(
    sender, created: bool, instance: LanguageSubscription, **kwargs
):
    """If a subscription is created, create a default training plan."""
    if created:
        try:
            TrackedList.objects.create(
                name="Default List - Add Some Words or Grammar to Begin!",
                subscription=instance,
            )
        except Exception as e:
            logger.error(e)
            raise e
