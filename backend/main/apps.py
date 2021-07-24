import logging

from django.apps import AppConfig

logger = logging.getLogger(__name__)


class MainConfig(AppConfig):
    name = "main"

    def ready(self):
        from . import signals, webhooks

        logger.info(f"Application {self.name} ready.")
