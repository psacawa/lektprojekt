from django.db import models


class LektManager(models.Manager):
    """Enhanced manager with some ergonomic goodies. Works with the LektQuerySet"""

    def get_queryset(self):
        return LektQuerySet(self.model, self._db)


class LektQuerySet(models.QuerySet):
    def describe_plan(self, style="vs"):
        """Print the Postgres query plan."""
        from pygments import highlight
        from pygments.formatters import TerminalTrueColorFormatter
        from pygments.styles import get_all_styles, get_style_by_name

        from utils.pg_explain_lexer import PgExplainLexer

        query_plan = self.explain()
        style = get_style_by_name(style)
        lexer = PgExplainLexer()
        formatter = TerminalTrueColorFormatter(style=style)
        highlighted_plan = highlight(query_plan, lexer, formatter)
        print(highlighted_plan)
