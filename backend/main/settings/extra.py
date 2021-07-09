# Django Extensions settings
#  needed in prod for adhoc DB admin tasks
SHELL_PLUS = "ipython"
SHELL_PLUS_IMPORTS = [
    "from django.db.models import Window",
    "from django.db.models.functions import Length, Rank",
    "from django.db.models.expressions import RawSQL",
]
IPYTHON_ARGUMENTS = [
    "--TerminalInteractiveShell.prompts_class=IPython.terminal.prompts.ClassicPrompts",
    "--TerminalInteractiveShell.editing_mode=vi",
]
# for ORM nastiness
#  SHELL_PLUS_PRINT_SQL_TRUNCATE = None
