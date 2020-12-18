from django_filters import rest_framework as filters


class LanguageFilterSet(filters.FilterSet):
    lid = filters.BaseInFilter(field_name="lid", lookup_expr="in")


class LexemeFilterSet(filters.FilterSet):
    prompt = filters.CharFilter(
        field_name="lemma", lookup_expr="istartswith", required=True
    )
    lid = filters.CharFilter(field_name="lang__lid", required=True)


class AnnotationFilterSet(filters.FilterSet):
    prompt = filters.CharFilter(
        field_name="value", lookup_expr="istartswith", required=True
    )
    lid = filters.CharFilter(field_name="lang__lid", required=True)


class WordFilterSet(filters.FilterSet):
    prompt = filters.CharFilter(
        field_name="norm", lookup_expr="startswith", required=True
    )
    lid = filters.CharFilter(field_name="lexeme__lang__lid", required=True)


class PhraseFilterSet(filters.FilterSet):
    prompt = filters.CharFilter(
        field_name="text", lookup_expr="contains", required=True
    )
    lid = filters.CharFilter(field_name="lang__lid", required=True)


class GimpedFilterSet(filters.FilterSet):
    base = filters.CharFilter(field_name="base__lang__lid", required=True)
    target = filters.CharFilter(field_name="target__lang__lid", required=True)
    lexeme = filters.NumberFilter(field_name="target__words__lexeme")
    annot = filters.NumberFilter(field_name="target__words__annotations")
