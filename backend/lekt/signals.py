import logging

from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import LanguageCourse, TrackedList

logger = logging.getLogger(__name__)


@receiver(post_save, sender=LanguageCourse)
def create_default_trackedlist(
    sender, created: bool, instance: LanguageCourse, **kwargs
):
    """If a course is created, create a default training plan."""
    if created:
        try:
            TrackedList.objects.create(
                name="Default List - Add Some Words or Grammar to Begin!",
                course=instance,
            )
        except Exception as e:
            logger.error(e)
            raise e
