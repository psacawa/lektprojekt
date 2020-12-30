import logging

from django.apps import AppConfig

logger = logging.getLogger(__name__)


class LektConfig(AppConfig):
    name = "lekt"

    def ready(self):
        import lekt.checks
        import lekt.signals

        logger.info(f"Application {self.name} ready.")
