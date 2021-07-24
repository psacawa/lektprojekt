#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys
from typing import Dict, Text

from dotenv import dotenv_values

#  adding this import causes tracebacks to be rendered in colour
if os.environ.get("DJANGO_ENV", None) == "development":
    import colored_traceback.auto


def main():
    """Run administrative tasks."""
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc

    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "main.settings")
    values = {
        **dotenv_values(".env"),
        **dotenv_values(".env.local"),
    }
    os.environ.update(values)  # type: ignore

    execute_from_command_line(sys.argv)


if __name__ == "__main__":
    main()
