# LektProjekt

This is the monorepo for *LektProjekt*. See `docs/` for general documentation.

## Backend 

To get it running on `localhost` no Ubuntu (adjust according to necessity):

``` 
# install postgres, redis
sudo apt install postgresql-12 libpq-dev redis 

# create database/user
createdb lektprojekt-db
createuser -sP lektprojekt_pg_admin
# enter 'django-pass' at the password prompt
# I am aware this is not isolated from the Internet, 
# but it'll suffice for now

# create and enter virtualenv (you can also use pyenv)
pip install virtualenv
virtualenv venv
source venv/bin/activate

# load data
aws s3 cp lektprojekt-assets/corpora/sd_phrases.csv asssets/
cd backend
python3 manage.py migrate
python3 manage.py load_corpus assets/sd_phrases.csv --limit 1000

# run server
python3 manage.py runserver
```

I know this is a pain in the butt. I'm going to try and make a `docker-compose.yml` file so we run all the services that way.
