from dj_rest_auth.serializers import (
    PasswordResetSerializer as BasePasswordResetSerializer,
)
from django.contrib.auth.models import User
from djstripe.models import Price, Product
from djstripe.models.checkout import Session
from rest_framework import serializers

from . import forms


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ["id", "description", "name"]


class PriceSerializer(serializers.ModelSerializer):
    product = ProductSerializer()

    class Meta:
        model = Price
        fields = ["id", "product", "currency", "unit_amount"]


class CreateCheckoutSessionSerializer(serializers.Serializer):
    pass


class UserDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["email", "username", "userprofile", "id"]


class PasswordResetSerializer(BasePasswordResetSerializer):
    password_reset_form_class = forms.AllAuthPasswordResetForm
