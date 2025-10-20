from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    model = User
    list_display = ("personal_identifier", "first_name", "last_name", "is_staff", "is_active")
    list_filter = ("is_staff", "is_active")
    ordering = ("personal_identifier",)
    search_fields = ("personal_identifier", "first_name", "last_name", "email")

    fieldsets = (
        (None, {"fields": ("personal_identifier", "password")}),
        ("Informations personnelles", {"fields": ("first_name", "last_name", "email")}),
        ("Permissions", {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
        ("Dates", {"fields": ("last_login", "date_joined")}),
    )

    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("personal_identifier", "password1", "password2", "is_staff", "is_active")
        }),
    )
