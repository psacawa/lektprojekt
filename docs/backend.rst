Miscellaneous Backend Information
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
