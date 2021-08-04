from django.db import models
from django.db.models.functions import Length
from polymorphic.managers import PolymorphicManager

from main.managers import LektManager


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


class FeatureManager(PolymorphicManager, LektManager):
    """ Manager for :model:`lekt.Feature` """

    def describe_lang(self, lid=None):
        """
        Pretty print a table of features for a given language along with their
        explanation.
        """

        from colorama import Fore, init
        from django.db.models import Count
        from tabulate import tabulate

        # this must be here to avoid a circular import
        from .models import Feature, Phrase

        def get_example(feature: Feature):
            """ Return example phrase with feature in text highlighted."""
            phrase: Phrase = (
                Phrase.objects.filter(words__features=feature)
                .annotate(count=Count("words"))
                .order_by("-count")
                .first()
            )
            if phrase is not None:
                increment = 0
                text = list(phrase.text)
                words_with_feat_pk = [
                    w.pk for w in phrase.words.filter(features=feature)
                ]
                #  automatically ordered by increasing order in sentence
                for pw in phrase.phraseword_set.all():
                    if pw.word_id in words_with_feat_pk:
                        text.insert(pw.start + increment, Fore.RED)
                        increment += 1
                        text.insert(pw.end + increment, Fore.RESET)
                        increment += 1
                return "".join(text)

        results = self.filter(lang__lid=lid).order_by("value")
        data = [[a.name, a.value, a.description, get_example(a)] for a in results]
        table = tabulate(data, headers=["value", "description", "example"])
        print(table)
