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

PracticeView
~~~~~~~~~~~~~~~

- aka Focus Mode



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

Styling
-------------

The style is based off of the pro version of the Material UI Dashboard template from
Creative Time, significantly modified so that it would work well with Typescript. Styles
and images are contained in `assets`. Jest do bani!

In ``App.tsx`` and ``adminStyle.ts`` we have the important classes for the overall layout:

- **wrapper** fixed position at origin
- **mainPanel** - the whole right side of the layout, including header, footer
- **content** - the part with the content, has ``maxWidth`` set
- **container** - ``div``  inseide conent, does something weird with margins


.. _jest-frontend-test-suite:

Frontend Test Suite
--------------------

``jest`` test of most compenents, views, and client-side routing.

Prefer when possible to use ``@testing-library/react`` queries. 
Some elements with ``span`` tags inside will prevent ``getByText`` from working.  The work-around is to supply are regex or a callback.

**TODO 23/08/20 psacawa: finish this**

ReactQuery Typescript
---------------------

**WIP**

- `useQuery`

  - ...

- `UseQueryOptions`

  - `TQueryFnData`

  - `TError`

  - `TData = TQueryFnData`: you'll 

  - `TQueryKey`: I don't know what it is really

- `useMutation<reponse, ?, **type of parameters**>`

  - type of response: typically `AxiosReponse<T>`

  - type of Error response??

  - type of fetch function params; what you `POST`

- `UseMutationOptions`

  - `TData`

  - `TError`

  - `TVariables`

  - `TContent`

**TODO** 03/08/20 psacawa: What depends on what, though?


Miscellaneous Notes
-------------------

- Material UI CSS Typescript object does not want to accept ``zIndex`` as an attribute

- A customization  to webpack  build pipeline injects the ``__filebasename`` variable,
  which resolves at buildtime to the name of the file, and is also the name attached to the ``debug`` loggers in the application, providing a logging experience like that of the backend
