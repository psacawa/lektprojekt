from django.http import HttpRequest, HttpResponse


def healthz(request: HttpRequest):
    """Health check. Empty response."""
    return HttpResponse()
