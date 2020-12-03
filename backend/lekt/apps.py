from django.apps import AppConfig

import logging

logger = logging.getLogger(__name__)
logger.setLevel(logging.info)

class LektConfig(AppConfig):
    name = "lekt"

    def ready(self):
        logger.info(f"Application {self.name} ready.")
        # attach signals
