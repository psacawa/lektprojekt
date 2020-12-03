# settings active only in production environment

# zmienne zabezpieczające aplikację
# terminacja tls odbywa się po stronie nginx, zatem nie ma sensu
# ustawiać cokolwiek dla SSL
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
