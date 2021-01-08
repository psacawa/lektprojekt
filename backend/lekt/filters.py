from django_filters import BaseInFilter, CharFilter, FilterSet, NumberFilter


class LanguageFilterSet(FilterSet):
    lid = BaseInFilter(field_name="lid", lookup_expr="in")


class LexemeFilterSet(FilterSet):
    prompt = CharFilter(field_name="lemma", lookup_expr="istartswith")
    lid = CharFilter(field_name="lang__lid")


class AnnotationFilterSet(FilterSet):
    prompt = CharFilter(field_name="value", lookup_expr="istartswith")
    lid = CharFilter(field_name="lang__lid")


class WordFilterSet(FilterSet):
    prompt = CharFilter(field_name="norm", lookup_expr="startswith")
    lid = CharFilter(field_name="lexeme__lang__lid")


class PhraseFilterSet(FilterSet):
    prompt = CharFilter(field_name="text", lookup_expr="contains")
    lid = CharFilter(field_name="lang__lid")


class PhrasePairFilterSet(FilterSet):
    base = NumberFilter(field_name="base__lang", required=True)
    target = NumberFilter(field_name="target__lang", required=True)
    lexeme = NumberFilter(field_name="target__words__lexeme")
    annot = NumberFilter(field_name="target__words__annotations")


class NumberInFilter(BaseInFilter, NumberFilter):
    pass


class PhrasePairSearchFilterSet(FilterSet):
    base = NumberFilter(field_name="lexeme_weights__base_lang", required=True)
    target = NumberFilter(field_name="lexeme_weights__target_lang", required=True)
    lexemes = NumberInFilter(field_name="target__words__lexeme", required=True)
