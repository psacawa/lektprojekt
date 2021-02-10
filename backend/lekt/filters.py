import copy

from django_filters import BaseInFilter, CharFilter, FilterSet, NumberFilter
from django_filters.rest_framework import DjangoFilterBackend
from django_filters.utils import translate_validation


class LanguageFilterSet(FilterSet):
    lid = BaseInFilter(field_name="lid", lookup_expr="in")


class LexemeFilterBackend(DjangoFilterBackend):
    def get_filterset_class(self, view, queryset=None):
        return LexemeFilterSet if view.action == "list" else None


class LexemeFilterSet(FilterSet):
    prompt = CharFilter(field_name="lemma", lookup_expr="istartswith")
    lang = NumberFilter(field_name="lang", required=True)


class FeatureFilterBackend(DjangoFilterBackend):
    def get_filterset_class(self, view, queryset=None):
        return FeatureFilterSet if view.action == "list" else None


class FeatureFilterSet(FilterSet):
    lang = NumberFilter(field_name="lang", required=True)


class WordFilterSet(FilterSet):
    prompt = CharFilter(field_name="norm", lookup_expr="startswith")
    lang = NumberFilter(field_name="lexeme__lang")


class PhraseFilterSet(FilterSet):
    prompt = CharFilter(field_name="text", lookup_expr="contains")
    lang = NumberFilter(field_name="lang")


class PhrasePairFilterSet(FilterSet):
    base = NumberFilter(field_name="base__lang", required=True)
    target = NumberFilter(field_name="target__lang", required=True)
    lexeme = NumberFilter(field_name="target__words__lexeme")
    annot = NumberFilter(field_name="target__words__features")


class NumberInFilter(BaseInFilter, NumberFilter):
    pass


class ValidateFilterSetMixin:
    """
    A filterset that only validates. For use with ValidateOnlyFilterSetMixin. Right now,
    the subclasses with this mixin do only validation of query params, so only their
    attribute names and types are import, the ``field_name`` etc. is not...
    """

    def __init__(self, data=None, *, request=None, prefix=None):
        self.is_bound = data is not None
        self.data = data or {}
        self.request = request
        self.form_prefix = prefix

        self.filters = copy.deepcopy(self.base_filters)

        # propagate the model and filterset to the filters
        for filter_ in self.filters.values():
            filter_.parent = self

    def get_query_params(self):
        if not self.is_valid():
            raise translate_validation(self.errors)
        return self.form.cleaned_data


class PhrasePairLexemeSearchFilterSet(ValidateFilterSetMixin, FilterSet):
    base = NumberFilter(field_name="lexeme_weights__base_lang", required=True)
    target = NumberFilter(field_name="lexeme_weights__target_lang", required=True)
    lexemes = NumberInFilter(
        field_name="target__words__lexeme", lookup_expr="in", required=True
    )


class PhrasePairFeatureSearchFilterSet(ValidateFilterSetMixin, FilterSet):
    base = NumberFilter(field_name="feature_weights__base_lang", required=True)
    target = NumberFilter(field_name="feature_weights__target_lang", required=True)
    features = NumberInFilter(
        field_name="target__words__features", lookup_expr="in", required=True
    )


class PhrasePairObservableSearchFilterSet(ValidateFilterSetMixin, FilterSet):
    base = NumberFilter(field_name="observable_weights__base_lang", required=True)
    target = NumberFilter(field_name="observable_weights__target_lang", required=True)
    lexemes = NumberInFilter(field_name="sadf", lookup_expr="in", required=True)
    features = NumberInFilter(field_name="sdf", lookup_expr="in", required=True)
