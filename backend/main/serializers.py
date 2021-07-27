from dj_rest_auth.serializers import (
    PasswordResetSerializer as BasePasswordResetSerializer,
)
from django.contrib.auth.models import User
from rest_framework import serializers

from . import forms


class UserDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["email", "username", "userprofile", "id"]


class PasswordResetSerializer(BasePasswordResetSerializer):
    password_reset_form_class = forms.AllAuthPasswordResetForm
