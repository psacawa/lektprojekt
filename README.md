# LektProjekt

This is the monorepo for _LektProjekt_. See `docs/` for general documentation.

## General Docs

After installing `sphinx`, run:

```
cd docs
sphinx-build . _build
```

This creates the documentation in the `_build` catalogue. You can serve the docs by entering it and running a static file web server, e.g. with

```
cd _build
python3 -m http.server 8001
```

I will try to get django to serve it.

## Backend

To get it running on `localhost` no Ubuntu (adjust according to necessity):

```
# install postgres, redis
sudo apt install postgresql-12 libpq-dev redis

# create database/user
createdb lektprojekt_db
createuser -sP lektprojekt_pg_admin
# enter 'django-pass' at the password prompt
# I am aware this is not isolated from the Internet,
# but it'll suffice for now

# create and enter virtualenv (you can also use pyenv)
pip install virtualenv
virtualenv venv
source venv/bin/activate

# install dependencies
cd backend
pip install poetry
poetry install
spacy download es_core_news_md
spacy download en_core_web_md

# load data
aws s3 cp lektprojekt-assets/corpora/spanishdict.sqlite asssets/
python3 manage.py migrate
python3 manage.py load_corpus assets/spanishdict.sqlite --limit 1000

# run server
python3 manage.py runserver
```

I know this is a pain in the butt. I'm going to try and make a `docker-compose.yml` file so we run all the services that way.

## Frontend

```
cd frontend
npm install
npm start
```
