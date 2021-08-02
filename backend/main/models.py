from django.db.models import Lookup
from django.db.models.fields import CharField, DateField, TimeField


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
