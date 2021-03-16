
=================================
LektProjekt Backend 
=================================

Custon Admin Commands
---------------------

The admin commands are those run via ``manage.py``, for example

.. code-block:: shell

  python3 manage.py load_corpus assets/spanishdict.sqlite

Some come from ``django`` itself, others from particular modules like `django-extensions`,
and a few have been made custom for this project. Below are listed the most important ones
for day-to-day use. Use the ``-h`` flag for more information

Thirdparty Admin Commands
^^^^^^^^^^^^^^^^^^^^^^^^^

* ``runserver`` - run server only for development  
* ``shell_plus`` - enhanced shell with autoreload of Django models

.. code-block:: bash

  # show generated SQL for all ORM queries
  python3 manage.py --print-sql




* ``dbshell`` - open ``psql`` with the Django user+database
* ``showmigrations`` - show current migration status
* ``migrate`` - run all migrations

LektProjekt Admin Commands
^^^^^^^^^^^^^^^^^^^^^^^^^^

* ``load_corpus`` - load a single sqlite file into database
* ``print_stats`` - show ``lekt`` models statistics

.. * load_views
.. * load_voices

ORM Customisations
------------------

Some models have methods added that allow inspection of instances;

.. code-block:: python

  # Show phrases words with morphological data
  p = Phrase.objects.first()
  p.describe()

.. code-block:: python

  # To describe annotations for a given language, use it's lid attribute as shown
  # This will also show an example of the phrase in use.
  Annotation.objects.describe_lang("en")
  Annotation.objects.describe_lang("fr")

Any ``QuerySet`` additionally allows one to inspect how the postgres query planner would
implement it via ``describe_plan``:

.. code-block:: python

  Phrase.objects.values('lang__lid')
    .annotate(cnt=Count('lang__lid'))
    .order_by("-cnt")
    .describe_plan()

There is a curstom *lookup* implementing the SQL clause  ``LIKE``. This is somehow absent
from vanilla Django.

.. code-block:: python

  PhrasePair.objects.filter(base__text__like='%tip%', target__lang__lid ='fr')




Backend Logging Config
----------------------

The logging configuration is contained in ``main/settings/logging.py``. All app modules 
have ``FileHandler`` s attached to them with level ``DEBUG`` as well as ``StreamHandler`` s 
outputting to ``stderr`` with level ``ERROR``. Logs with a ``FileHandler`` are output 
in ``logs``.

Test Suite
----------

The test suite can run with ``pytest-watch``. This runs it in "watch mode", just like ``jest``. The test database ``test_lektprojekt_db`` will need to be seeded with data first. The database state relative to which the tests are written is the attained by migrating and running

.. code-block:: shell

  DJANGO_DATABASE=test python3 manage.py load_corpus assets/spanishdict.sqlite --limit 100

Of course you have to create the database and migrate first.
You can run this command and then run in ``psql``:

.. code-block:: sql

  ALTER DATABASE lektprojekt_db RENAME TO test_lektprojekt_db;

This will set ``test_lektprojekt_db`` in the required state. You can request django use the test database(for the purpose of examining it to write new tests) by means of an environmental variable:

.. code-block:: shell

  DJANGO_DATABASE=test ./manage.py runserverDJANGO_DATABASE=test ./manage.py runserver
  DJANGO_DATABASE=test ./manage.py runserverDJANGO_DATABASE=test ./manage.py shell_plus



Technologies Used
--------------------

-  **django** - opinionated web framework
-  **django-rest-framework** (``rest_framework``) - adds stuff list
   ser/deserialization, generic CRUD viewsets, validation, auth,
   throttling for REST
-  **django-filter** (``django_filters``) - modular filtering in REST
   API endpoints via query parameters
-  **django-allauth** (``allauth``) - alternate auth backend to
   django’s, supporting 3rd party auth, JWT, email confirmation flow
- **django-ses** (``django_ses``) - AWS SES backend for email services
-  **dj-restauth** (``dj_rest_auth``) - REST endpoints for the above.
   allauth itself only has html template endpoints
-  **django-polymorphic** (``polymorphic``) - adds a better manager for
   polymorphic django models. “Polymorphic” is understood in the sense
   of inheritance polymorphism
-  **django-rest-polymorphic** (``rest_polymorphic``) - adds serializer
   for polymorphic django models
-  **django-extensions** (``django_extensions``) - a set of
   ``manage.py`` commands that are crucial for development,
   e.g. \ ``shell_plus``
-  **django-debug-toolbar** (``debug_toolbar``) - adds a widget to HTML
   response pages that shows you what the application did while serving
   the request: SQL queries, timing, etc..
-  **django-split-settings** - lets you split your configs into multiple files. Need to
  get rid of this
-  **ipython** - better Python shell

-  **pytest** - python test framework more flexible than ``unittest``
-  **pytest-watch** - watches file-system for changes, running tests in
   response. Akin to ``jest`` watch mode
-  **pytest-sugar** - more compact appearance for pytest
-  **pytest-django** - pytest fixtures specific to django. Ambivalent.

-  **postgres** - DB
-  **redis** - in-memory key-value DB, used for caching

-  **spacy** - natural language processing library
-  **poetry** - roughly npm for python, supports separation of prod/dev
   dependencies, deterministic builds
-  **pre-commit** - manage pre-commit hooks: ``pre-commit install`` to
   install
-  **black** - opinionated code formatter
-  **pip** - package management
-  **sphinx** - generates fancy documenation with search from
   restructured text and markdown
