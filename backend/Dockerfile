# lektprojekt-backend-image
FROM python:3.9
WORKDIR code
# RUN python -m venv virtualenv
# RUN . ./virtualenv/bin/activate
RUN pip install poetry
COPY pyproject.toml poetry.lock ./
RUN poetry export --without-hashes -o requirements.txt
RUN --mount=type=cache,target=/root/.cache/pip pip install -r requirements.txt
# RUN pip install -r requirements.txt

COPY . .
ENV DJANGO_ENV=test \
    POSTGRES_HOST=db \ 
    REDIS_HOST=cache

EXPOSE 8080
# cmd DJANGO_ENV=prod gunicorn main.wsgi --bind 0.0.0.0:8080 --workers 4 --threads 4
cmd python3 manage.py runserver
