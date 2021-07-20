# type: ignore
# settings active only in production environment

#  TODO 28/03/20 psacawa: reactivate once ssl certs in docker container are figured out
#  # zmienne zabezpieczające aplikację
#  # terminacja tls odbywa się po stronie nginx, zatem nie ma sensu
#  # ustawiać cokolwiek dla SSL
#  SESSION_COOKIE_SECURE = True
#  CSRF_COOKIE_SECURE = True

#  TODO 09/03/20 psacawa: profile the effect of this parameter
CONN_MAX_AGE = 60

# AWS ELB sends a health check with Host header equal to its private IP address:
# 192.168.x.x. With host header checking, these checks fail.
#  TODO 20/07/20 psacawa: figure out a better way... perhaps a health check middleware
#  before the the SecurityMiddleware?
ALLOWED_HOSTS = "*"
