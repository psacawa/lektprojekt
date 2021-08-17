Contributing
============

To contribute just send a pull request to https://github.com/psacawa/lektprojekt/

Commit Guidelines
-----------------

We use the tags listed below when writing commit comments. The commit
header should be 50 letters max. Any more should be in the body of the
commit message. If there is a commit body then end the header with
``...`` to indicate that. This is all for the purpose of enabling easy
browsing with ``git log --pretty=oneline``. See ``git log`` for
examples. This is a loose guideline.

-  Add = Create a capability e.g. feature, test, dependency.
-  Remove = Remove a capability e.g. feature, test, dependency.
-  Fix = Fix an issue e.g. bug, typo, accident, misstatement.
-  Bump Increase the version of something e.g. dependency.
-  Tool = Change the build process, or tooling, or infra.
-  Start = Begin doing something; e.g. create a feature flag.
-  Stop = End doing something; e.g. remove a feature flag.
-  Test = Add functionality relating to testing.
-  Refactor = A code change that MUST be just a refactoring.
-  Format = Change of formatting, e.g. omit whitespace.
-  Opt = Refactor of performance, e.g. speed up code.
-  Doc = Write documentation, e.g. help files.

Tests
-----

For backend, run ``pytest``.
For frontend, run ``yarn run test``.


