from django.urls import path
from . import views
from .views_init import init_admin, init_admin_page

urlpatterns = [
    path('profile/', views.UserProfileView.as_view(), name='user-profile'),
    path('preferences/notifications/', views.notification_preferences, name='notification-preferences'),
    path('preferences/appearance/', views.appearance_preferences, name='appearance-preferences'),
    path('change-password/', views.change_password, name='change-password'),
    path('export-data/', views.export_user_data, name='export-user-data'),
    path('delete-data/', views.delete_user_data, name='delete-user-data'),
    # Route d'initialisation (à utiliser une seule fois)
    path('init-admin/', init_admin, name='init-admin'),
    path('init/', init_admin_page, name='init-admin-page'),
]
