from django.apps import AppConfig

import logging

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)


class LektConfig(AppConfig):
    name = "lekt"

    def ready(self):
        import lekt.signals

        logger.info(f"Application {self.name} ready.")
        #  TODO 03/12/20 psacawa: start should blocked until a set of data migrations has
        #  occurred
