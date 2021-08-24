Environments and Testing
=========================

LektProjekt is complex application, and needs a lot of testing strategies for QA. We try to uphold the principle that  everything should be tested once and anyhting on ``master`` should be accpetable to appear in production. 

It's also the case that we want simultaneously want to 

- increase iteration speed by running tests as close as possible to the developer, accepting the resulting tradeoff in accuracy stemming from mocking
- run comprehensive end-to-end tests in staging with nothing mocked, for high assurance of
  quality
- integrate testing with CI

These aims result in a proliferation of configurations/environments under which the application, or
components or test suites thereof may be run. This page documents these
environment/configurations.

What gets Tested
----------------

- backend views
- frontend components
- Emails
- Authentication
- End-to-end user sessions

Test Suites and Where they are Run
----------------------------------

There are three test suites: 
- **pytest** backend unit tests
- **jest** frontend unit tests 
- **cypress** end-to-end
  

- On dev machine in watch/batch mode
  - *pytest* backend test suite
  - *jest* frontend test suite
  - *cypress* end-to-end suite
- In Github CI upon pull request
  - *pytest* backend test suite
  - *jest* frontend test suite
  - *cypress* end-to-end suite
- In staging environment
  - *cypress* end-to-end suite

Depending on where the test occurs, different things will be mocked or configured
differently. The mechanism to  effect that configuration are environmental variables.



Environemntal Variables
------------------------


pytest backend
^^^^^^^^^^^^^^
See :ref:`pytest-backend-test-suite`

==================== ==================== ==================== ==================== 
Environment          Dev Machine          Github CI            Staging 
==================== ==================== ==================== ==================== 
Database             localhost:5432       postgres container   AWS RDS test_lekt_db
Cache                DummyCache(off)      DummyCache(off)      AWS Elasticache /1
Stripe               test_mode(on)        test_mode(on)        test_mode(on)
Emails               FileBackend/         mailhog container    AWS SES
Sentry Env           test                 ci                   staging
==================== ==================== ==================== ==================== 

jest frontend
^^^^^^^^^^^^^^
See :ref:`jest-frontend-test-suite`

==================== ==================== ==================== ==================== 
Environment          Dev Machine          Github CI            Staging 
==================== ==================== ==================== ====================
Application          msw/jsonserver       service container    AWS RDS test_lekt_db
Sentry Env           test                 ci                   staging
==================== ==================== ==================== ==================== 


cypress end-to-end
^^^^^^^^^^^^^^^^^^

**TODO 23/08/20 psacawa: figure out what you can do for database vis-a-vis
transations/state**

==================== ==================== ==================== ==================== 
Environment          Dev Machine          Github CI            Staging 
==================== ==================== ==================== ==================== 
Database             ?                    postgres container   AWS RDS test_lekt_db
Cache                localhost:6379       redis container      AWS Elasticache /1
Stripe               test_mode(on)        test_mode(on)        test_mode(on)
Emails               FileBackend/         mailhog container    AWS SES
Sentry Env           test(cypress)        ci(cypress)          staging(cypress)
==================== ==================== ==================== ==================== 


Runs an actual backend server and frontend server, and potentially other services.
Simulates user sessions. Tends toward realism.

Configuration
-------------

**TODO 23/08/20 psacawa: finish this**
These are the values passed via  environmental variables ``DJANGO_ENV`` or ``NODE_ENV``.

Backend
^^^^^^^
- development
- test
- staging
- production

Frontend
^^^^^^^^
- development
- test
- staging
- production
