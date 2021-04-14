import multiprocessing

wsgi_app = "main.wsgi"
bind = "127.0.0.1:8000"
workers = multiprocessing.cpu_count() * 2 + 1
threads = multiprocessing.cpu_count() * 2 + 1
daemon = True

errorlog = "error.log"
accesslog = "access.log"

reload = True

raw_env = [s for s in open(".env.secret").read().split("\n") if "=" in s]
raw_env += ["DJANGO_ENV=prod"]