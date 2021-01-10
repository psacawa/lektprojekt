from django.db import models
from django.db.models.functions import Length
from polymorphic.managers import PolymorphicManager


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


class PhrasePairQuerySet(LektManager):
    """
    QuerySet/Manager for a particular base/target language,
    which is specified as a parameter to the constructor.

    base_lid = the manager will return pairs from this langauge's lid
    target_lid = the manager will return pairs to this langauge's lid

    """

    _base_lid: str
    _target_lid: str

    def __init__(self, **kwargs):
        self._base_lid = kwargs.pop("base_lid", lambda: None)
        self._target_lid = kwargs.pop("target_lid", lambda: None)
        super().__init__()

    def get_queryset(self):
        queryset: models.QuerySet = super().get_queryset()
        #  pdb.set_trace ()
        if self._base_lid:
            queryset = queryset.filter(base__lang__lid=self._base_lid)
        if self._target_lid:
            queryset = queryset.filter(target__lang__lid=self._target_lid)
        return queryset


class AnnotationManager(PolymorphicManager, LektManager):
    """ Manager for :model:`lekt.Annotation` """

    def describe_lang(self, lid=None):
        """
        Pretty print a table of annotations for a given language along with their
        explanation.
        """

        from colorama import Fore, init
        from django.db.models import Count
        from tabulate import tabulate

        # this must be here to avoid a circular import
        from .models import Annotation, Phrase

        def get_example(annotation: Annotation):
            """ Return example phrase with annotation in text highlighted."""
            phrase: Phrase = (
                Phrase.objects.filter(words__annotations=annotation)
                .annotate(count=Count("words"))
                .order_by("-count")
                .first()
            )
            if phrase is not None:
                increment = 0
                text = list(phrase.text)
                words_with_annot_pk = [
                    w.pk for w in phrase.words.filter(annotations=annotation)
                ]
                #  automatically ordered by increasing order in sentence
                for pw in phrase.phraseword_set.all():
                    if pw.word_id in words_with_annot_pk:
                        text.insert(pw.start + increment, Fore.RED)
                        increment += 1
                        text.insert(pw.end + increment, Fore.RESET)
                        increment += 1
                return "".join(text)

        results = self.filter(lang__lid=lid).order_by("value")
        data = [[a.value, a.explanation, get_example(a)] for a in results]
        table = tabulate(data, headers=["value", "explanation", "example"])
        print(table)
