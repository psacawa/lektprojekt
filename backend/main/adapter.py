from allauth.account.adapter import DefaultAccountAdapter


class AccountAdapter(DefaultAccountAdapter):
    """ Customized allauth adapter to turn off messaging"""

    def add_message(self, *args, **kwargs):
        pass
