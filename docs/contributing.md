# Commit Guidelines

We use the tags listed below when writing commit comments. The commit header should be 50 letters max. Any more should be in the body of the commit message. If there is a commit body then end the header with `...` to indicate that. This is all for the purpose of enabling easy browsing with `git log --pretty=oneline`. See `git log` for examples. This is a loose guideline.

- Add = Create a capability e.g. feature, test, dependency.
- Remove = Remove a capability e.g. feature, test, dependency.
- Fix = Fix an issue e.g. bug, typo, accident, misstatement.
- Bump Increase the version of something e.g. dependency.
- Tool = Change the build process, or tooling, or infra.
- Start = Begin doing something; e.g. create a feature flag.
- Stop = End doing something; e.g. remove a feature flag.
- Test = Add functionality relating to testing.
- Refactor = A code change that MUST be just a refactoring.
- Format = Change of formatting, e.g. omit whitespace.
- Opt = Refactor of performance, e.g. speed up code.
- Doc = Write documentation, e.g. help files.

# Technologies Used

Here we list _most_ technologies/libraries used, with an emphasis on the clarifying the role of the smaller ones, so various `import` statements don't look mysterious

## Backend

- **django** - opinionated web framework
- **django-rest-framework** (`rest_framework`) - adds stuff list ser/deserialization, generic CRUD viewsets, validation, auth, throttling for REST
- **django-filter** (`django_filters`) - modular filtering in REST API endpoints via query parameters
- **django-allauth** (`allauth`) - alternate auth backend to django's, supporting 3rd party auth, JWT, email confirmation flow
- **dj-restauth** (`dj_rest_auth`) - REST endpoints for the above. allauth itself only has html template endpoints
- **django-polymorphic** (`polymorphic`) - adds a better manager for polymorphic django models. "Polymorphic" is understood in the sense of inheritance polymorphism
- **django-rest-polymorphic** (`rest_polymorphic`) - adds serializer for polymorphic django models
- **django-model-utils** (`model_utils`) - grab bag of useful django stuff. Another inheritance manager. Ambivalent.

- **django-extensions** (`django_extensions`) - a set of `manage.py` commands that are crucial for development, e.g. `shell_plus`
- **django-debug-toolbar** (`debug_toolbar`) - adds a widget to HTML response pages that shows you what the application did while serving the request: SQL queries, timing, etc..
- **ipython** - better Python shell

- **pytest** - python test framework more flexible than `unittest`
- **pytest-watch** - watches file-system for changes, running tests in response. Akin to `jest` watch mode
- **pytest-sugar** - more compact appearance for pytest
- **pytest-django** - pytest fixtures specific to django. Ambivalent.

- **postgres** - DB
- **redis** - in-memory key-value DB, used for caching

- **spacy** - natural language processing library
- **poetry** - roughly npm for python, supports separation of prod/dev dependencies, deterministic builds
- **pre-commit** - manage pre-commit hooks: `pre-commit install` to install
- **black** - opinionated code formatter
- **pip** - package management
- **sphinx** - generates fancy documenation with search from restructured text and markdown

## Frontend

- **typescript** - typed JS
- **react** - client rendering framework
- **create-react-app** - opinionated build pipeline for react, with supports for proxying to backend in development, deployment, etc.
- **eslint** - linting for ES6, CRA has a default setup
- **material UI** (`@material-ui/core`) - lot of good high-level React components with dynamic functionality and decent appearance. Configurable
- **formik** - form library opinionated about validation, submission, error reporting
- **formik-material-ui** - wraps formik `Field` component in Material UI components
- **react-router** - client-side routing
- **react-query** - client-side caching implementing the stale-while-revalidate strategy

- **lodash** - replaces javascript's gimped stdlib
- **axios** - HTTP client for browser/node

- **redux** - data management library which mutates data immutably via atomic "actions". Hard to integrate with other libraries. Good for debugging. Ambivalent.
- **redux-logger** - logger
- **redux-saga** - asynchronous effects management. Complex, doesn't play well with typescript.
- **react-redux** - bindings for react+redux

- **jest** - JS test framework
- **(react/DOM/) testing library** (`@testing-library/dom`/`@testing-library/react`) - let's you write tests that things more proximate to users e.g. is some text, regex visible, rather than characteristics of the DOM which are opaque to users. ARIA friendly
