from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from .models import UserProfile

import logging
logger = logging.getLogger(__name__)

@receiver(post_save, sender=User)
def createUserProfile(sender, created: bool, instance: User, **kwargs):
    """Create a UserProfile object immediately about User creations"""
    try:
        if created:
            user_profile = UserProfile.objects.create(user=instance)
    except Exception as e:
        logger.error(e)
        raise e
