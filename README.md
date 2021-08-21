# LexQuest/LektProjekt

![docker build frontend](https://github.com/psacawa/lektprojekt/actions/workflows/build-frontend.yml/badge.svg)
![docker build backend](https://github.com/psacawa/lektprojekt/actions/workflows/build-backend.yml/badge.svg)

This is the monorepo for _LektProjekt_, which for business/marketing reasons is known publicly as _LexQuest_ and is available to demo at the address [www.lex.quest](https://lex.quest). See `docs/` for general documentation.

## Hooks

Install git-hooks which help preserve project health.

```
scripts/install-hooks.sh
```

## General Docs

After installing `sphinx`, run:

```
cd backend
./manage.py build_docs
```

This creates the documentation in the `docs/build` catalogue.

## Backend

To get it running on `localhost` no Ubuntu (adjust according to necessity):

```
# install postgres, redis
sudo apt install postgresql-12 libpq-dev redis

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

# create database/user
python3 manage.py sqlcreate | psql
# if the above doesn't work, you can manually create the db/user:
createdb lekt_db
createuser -sP lekt_admin
# enter 'django-pass' at the password prompt
# I am aware this is not isolated from the Internet,
# but it'll suffice for now

# load data (from S3 or Google Disc)
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
