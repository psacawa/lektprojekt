==================================
LektProjekt Frontend 
==================================

Views
-----

Notes on frontend views that must be made, along with API endpoints each
must be able to call, and what data must be available on the
corresponding serializers.

LexemeBrowsingView
~~~~~~~~~~~~~~~~~~

-  list languages

   -  base Language

-  filter phrase pair by lexeme

   -  base, target
   -  associated lexeme character span

AnnotationBrowsingView
~~~~~~~~~~~~~~~~~~~~~~

-  list languages
-  filter phrase pair by annotation

   -  base, target
   -  associated annotations’ lexemes character spans

-  filter word by annotation

PhrasePairDetailView
~~~~~~~~~~~~~~~~~~~~

-  phrase pair detail

   -  associated words
   -  associated annotations
   -  associated phrase word data

ProfileView
~~~~~~~~~~~

- crud of tracked lists 
- curd of subscriptions

TrackedListView
~~~~~~~~~~~~~~~

- crud of tracked observables


Technologies Used
----------------------

-  **typescript** - typed JS
-  **react** - client rendering framework
-  **create-react-app** - opinionated build pipeline for react, with
   supports for proxying to backend in development, deployment, etc.
-  **eslint** - linting for ES6, CRA has a default setup
-  **material UI** (``@material-ui/core``) - lot of good high-level
   React components with dynamic functionality and decent appearance.
   Configurable
-  **formik** - form library opinionated about validation, submission,
   error reporting
-  **formik-material-ui** - wraps formik ``Field`` component in Material
   UI components
-  **react-router** - client-side routing
-  **react-query** - client-side caching implementing the
   stale-while-revalidate strategy

-  **lodash** - replaces javascript’s gimped stdlib
-  **axios** - HTTP client for browser/node

-  **redux** - data management library which mutates data immutably via
   atomic “actions”. Hard to integrate with other libraries. Good for
   debugging. Ambivalent.
-  **redux-logger** - logger
-  **redux-saga** - asynchronous effects management. Complex, doesn’t
   play well with typescript.
-  **react-redux** - bindings for react+redux

-  **jest** - JS test framework
-  **(react/DOM/) testing library**
   (``@testing-library/dom``/``@testing-library/react``) - let’s you
   write tests that things more proximate to users e.g. is some text,
   regex visible, rather than characteristics of the DOM which are
   opaque to users. ARIA friendly
