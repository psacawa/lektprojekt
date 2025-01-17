from dj_rest_auth.serializers import (
    PasswordResetSerializer as BasePasswordResetSerializer,
)
from djstripe.models import Price, Product
from djstripe.models.checkout import Session
from rest_framework import serializers

from . import forms
from .models import User


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ["id", "description", "name"]


class PriceSerializer(serializers.ModelSerializer):
    product = ProductSerializer()

    class Meta:
        model = Price
        fields = ["id", "product", "currency", "unit_amount", "recurring"]


class CheckoutSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Session
        fields = ["id", "djstripe_id"]


class UserDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["email", "username", "level", "id", "has_profile_image"]


class PasswordResetSerializer(BasePasswordResetSerializer):
    password_reset_form_class = forms.AllAuthPasswordResetForm
