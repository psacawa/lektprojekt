#  run in test environment (docker containers in CI)
ALLOWED_HOSTS += ["lex.quest", "127.0.0.1", "localhost", "l"]
INTERNAL_IPS = ALLOWED_HOSTS
