from django.http.response import HttpResponse
from django.views.decorators.csrf import ensure_csrf_cookie


@ensure_csrf_cookie
def csrf_view(request):
    """
    View whose only function is delivering a csrf token as a cookie. The body is empty.
    """
    return HttpResponse()
