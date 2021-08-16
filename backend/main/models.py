from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models import Lookup
from django.db.models.fields import CharField, DateField, TimeField

from .managers import LektManager


class User(AbstractUser):
    """User profiles internal to Lekt application.

    Proxy model for User. In accordance with Django best practices,
    django.contrib.auth.models.User is overridden by this model, which we can control
    more  directly

    These models exists in one-to-many relationship with :model:`lekt.LanguageSubscription`.
    These models exists in one-to-many relationship with :model:`djstripe.checkout.Session`.
    """

    id = models.AutoField(primary_key=True, db_column="user_id")

    LEVEL_CHOICES = [("basic", "basic"), ("plus", "plus")]
    level = models.CharField(max_length=20, choices=LEVEL_CHOICES, default="basic")

    # for payment processing
    # needed
    checkout_sessions = models.ManyToManyField(
        "djstripe.Session",
        verbose_name="Open checkout sessions",
        help_text=(
            "Currently open checkout sessions for the user. Necessary for the view "
            "confirning the checkout to be able to affiliate a subscription with the user "
            "attached to the corresponding session."
        ),
    )
    subscription = models.ForeignKey(
        "djstripe.Subscription",
        on_delete=models.SET_NULL,
        null=True,
        verbose_name="Plan",
        help_text="Stripe Plan (really newer API Price) attached to User",
    )
    has_profile_image = models.BooleanField(default=False)

    def __repr__(self):
        return f"<User user={self.username}>"

    def __str__(self):
        return self.username


# custom lookup to implement SQL's LIKE clause
@CharField.register_lookup
class Like(Lookup):
    lookup_name = "like"

    def as_sql(self, compiler, connection):
        lhs, lhs_params = self.process_lhs(compiler, connection)
        rhs, rhs_params = self.process_rhs(compiler, connection)
        params = lhs_params + rhs_params
        return "%s LIKE %s" % (lhs, rhs), params


#  custom lookup to implement date/time lookup like --since=2m
#  use: User.objects.filter(created__since="2m")
# supports s,m,h,d,w,y not as implement by postgres INTERVAL type
@DateField.register_lookup
@TimeField.register_lookup
class Since(Lookup):
    lookup_name = "since"
    prepare_rhs = False

    def as_sql(self, compiler, connection):
        lhs, lhs_params = self.process_lhs(compiler, connection)
        rhs, rhs_params = self.process_rhs(compiler, connection)
        params = lhs_params + rhs_params
        return "NOW() - %s < INTERVAL %s" % (lhs, rhs), params
