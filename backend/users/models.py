from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
from django.contrib.auth.models import PermissionsMixin
from django.db import models
from django.utils import timezone
import json

class UserManager(BaseUserManager):
    def create_user(self, personal_identifier: str, password: str | None = None, **extra_fields):
        if not personal_identifier:
            raise ValueError('Le champ personal_identifier est requis')
        user = self.model(personal_identifier=personal_identifier, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, personal_identifier: str, password: str, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        return self.create_user(personal_identifier, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    personal_identifier = models.CharField(max_length=150, unique=True)
    first_name = models.CharField(max_length=150, blank=True)
    last_name = models.CharField(max_length=150, blank=True)
    email = models.EmailField(blank=True)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)
    
    # Préférences utilisateur
    notification_preferences = models.JSONField(default=dict, blank=True)
    appearance_preferences = models.JSONField(default=dict, blank=True)
    telegram_chat_id = models.CharField(max_length=100, blank=True)

    objects = UserManager()

    USERNAME_FIELD = 'personal_identifier'
    REQUIRED_FIELDS: list[str] = []

    def __str__(self) -> str:
        return self.personal_identifier
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip() or self.personal_identifier
    
    def get_notification_preference(self, key, default=True):
        return self.notification_preferences.get(key, default)
    
    def set_notification_preference(self, key, value):
        if not self.notification_preferences:
            self.notification_preferences = {}
        self.notification_preferences[key] = value
        self.save(update_fields=['notification_preferences'])
    
    def get_appearance_preference(self, key, default=None):
        return self.appearance_preferences.get(key, default)
    
    def set_appearance_preference(self, key, value):
        if not self.appearance_preferences:
            self.appearance_preferences = {}
        self.appearance_preferences[key] = value
        self.save(update_fields=['appearance_preferences'])
