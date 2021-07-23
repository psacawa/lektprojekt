from django.http.request import HttpRequest
from django.http.response import HttpResponse


#  # AWS ELB sends a health check with Host header equal to its private IP address:
#  # 192.168.x.x. With host header checking, these checks fail.
#  #  TODO 20/07/20 psacawa: figure out a better way... perhaps a health check middleware
#  #  before the the SecurityMiddleware?
def HealtCheckMiddleware(get_response):
    """If it's a healthcheck, immediatly return 200 OK.
    Because the ALB uses Host: 192.168.x.x, this has to be before SecurityMiddleware"""

    def middleware(request: HttpRequest):
        if request.path == "/healthz":
            return HttpResponse("ok", status=200)
        response = get_response(request)
        return response

    return middleware
