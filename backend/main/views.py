from django.http import HttpRequest, HttpResponse


def healthz(request: HttpRequest):
    """Health check."""
    return HttpResponse("ok", status=200)
