from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from .models import User


class UserProfileSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()
    
    class Meta:
        model = User
        fields = [
            'id', 'personal_identifier', 'first_name', 'last_name', 
            'email', 'full_name', 'date_joined'
        ]
        read_only_fields = ['id', 'date_joined']


class UserPreferencesSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['notification_preferences', 'appearance_preferences', 'telegram_chat_id']


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)
    confirm_password = serializers.CharField(required=True)
    
    def validate_current_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Le mot de passe actuel est incorrect.")
        return value
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError("Les nouveaux mots de passe ne correspondent pas.")
        
        try:
            validate_password(attrs['new_password'], self.context['request'].user)
        except ValidationError as e:
            raise serializers.ValidationError({"new_password": e.messages})
        
        return attrs


class NotificationPreferencesSerializer(serializers.Serializer):
    email = serializers.BooleanField(default=True)
    telegram = serializers.BooleanField(default=False)
    task_complete = serializers.BooleanField(default=True)
    project_deadline = serializers.BooleanField(default=True)
    daily_summary = serializers.BooleanField(default=False)
    weekly_report = serializers.BooleanField(default=True)


class AppearancePreferencesSerializer(serializers.Serializer):
    theme = serializers.ChoiceField(choices=['light', 'dark'], default='dark')
    accent_color = serializers.CharField(max_length=7, default='#8b5cf6')
    sidebar_collapsed = serializers.BooleanField(default=False)
    animations_enabled = serializers.BooleanField(default=True)
