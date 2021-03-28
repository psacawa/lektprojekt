FROM python:latest
WORKDIR code
# RUN python -m venv virtualenv
# RUN . ./virtualenv/bin/activate
RUN pip install poetry
COPY pyproject.toml poetry.lock ./
RUN poetry export -o requirements.txt
RUN pip install -r requirements.txt

RUN apt update
RUN apt install -y dnsutils
run pip install gunicorn
COPY . .
ENV DJANGO_ENV=test \
    POSTGRES_HOST=db \ 
    REDIS_HOST=cache

# RUN python manage.py migrate
# RUN python manage.py load_languages
EXPOSE 8000
# CMD python manage.py runserver
# CMD uwsgi --http --ini uwsgi.ini
cmd DJANGO_ENV=prod gunicorn main.wsgi --bind 0.0.0.0:8000 --workers 4 --threads 4
