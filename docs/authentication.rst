Notes on Authentication
=======================

The scope of these notes is authentication in django+react SPA using including using social Oauth2 for identity

Django
-------

``django.contrib.auth`` recognizes an authed user from session cookie. `AuthenticationMiddleware` must come after  `SessionMiddleware`. The current auth backend is stored in the session cookie, along with the user_id. the auth middleware extract the user itself from the ``$backend.get_user($user_id)`` and attaches this information to the HttpRequest object. Otherwise it yeilds AnonymousUser.

.. TODO 23/07/20 psacawa: actual auth process

``django.contrib.auth.authenticate`` takes arbitrary kwarg, tries to pass it to each
configured auth backend in turn. The first  to not raise exception
 
.. TODO 23/07/20 psacawa: allauth

Django Rest Framework
---------------------

Has separate and in principal orthogonal authentication for its Request objects (which
have the underlying HttpRequest under `_request` attribute). A view
has `authentication_classes` (backend/class/authenticator) and the config has `DEFAULT_AUTHENTICATION_CLASSES`.
`rest_framwork.request.Request._authenticate` loops these tries 
`$auth_class.initialize($request: Request)`. If success, the user, auth and backend to  
succeed are saved under `user`, `auth` `_authenticator`. They  do not affect cookies,
django auth directly..

SessionAuthentication
^^^^^^^^^^^^^^^^^^^^^
This `rest_framwork` auth class just transfers the authed user identified in session to
the rest_framwork `Request`. It therefore bridges django  and django-rest-framework auth
worlds.


Browser Cliegnt
----------------

.. TODO 23/07/20 psacawa: finish this

Oauth2 Protocol
---------------


