import multiprocessing
import os

wsgi_app = "main.wsgi"
bind = "0.0.0.0:8000"
workers = multiprocessing.cpu_count() * 2 + 1
threads = multiprocessing.cpu_count() * 2 + 1

accesslog = "-"
# default:  errorlog = "-"

#  # pass DJANGO_* env. vars onto the workers, formated as "k=v" strings
#  raw_env = []
#  for k, v in os.environ.items():
#      if k.startswith("DJANGO_"):
#          raw_env.append(f"{k}={v}")

raw_env = [f"{k}={v}" for k, v in os.environ.items() if k.startswith("DJANGO_")]
#  print(f"{raw_env=}")


reload = True
