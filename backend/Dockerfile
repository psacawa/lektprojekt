# lekt-backend-image
FROM python:3.9
WORKDIR code
# RUN python -m venv virtualenv
# RUN . ./virtualenv/bin/activate
RUN pip install poetry
COPY pyproject.toml poetry.lock ./
RUN poetry export --without-hashes -o requirements.txt
RUN pip install -r requirements.txt
# RUN pip install -r requirements.txt

COPY . .

ENV DJANGO_ENV=production
CMD gunicorn -c gunicorn.conf.py
