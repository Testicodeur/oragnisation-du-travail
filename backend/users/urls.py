from django.urls import path
from . import views

urlpatterns = [
    path('profile/', views.UserProfileView.as_view(), name='user-profile'),
    path('preferences/notifications/', views.notification_preferences, name='notification-preferences'),
    path('preferences/appearance/', views.appearance_preferences, name='appearance-preferences'),
    path('change-password/', views.change_password, name='change-password'),
    path('export-data/', views.export_user_data, name='export-user-data'),
    path('delete-data/', views.delete_user_data, name='delete-user-data'),
]
