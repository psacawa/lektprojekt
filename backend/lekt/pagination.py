from collections import OrderedDict

from rest_framework.pagination import (
    PageNumberPagination as RestFrameworkPageNumberPagination,
)
from rest_framework.response import Response


class PageNumberPagination(RestFrameworkPageNumberPagination):
    """
    This `PageNumberPagination` class is identical to that of `rest_framework`, except in
    that it does not report the count of object returned, which is typically not needed.
    This saves a query.
    """

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
