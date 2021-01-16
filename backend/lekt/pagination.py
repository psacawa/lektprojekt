from collections import OrderedDict

from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response


class NoCountPageNumberPagination(PageNumberPagination):
    """
    This `PageNumberPagination` class is identical to that of `rest_framework`, except in
    that it does not report the count of object returned, which is typically not needed.
    This saves a query.
    """

    #  TODO 12/01/20 psacawa: doesn't work. fix

    def get_paginated_response(self, data):
        return Response(
            OrderedDict(
                [
                    #  count excluded
                    ("next", self.get_next_link()),
                    ("previous", self.get_previous_link()),
                    ("results", data),
                ]
            )
        )


class NormalPageNumberPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 50


class LargePageNumberPagination(PageNumberPagination):
    page_size = 50
