from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import (
	TokenRefreshView,
)
from users.auth import CustomTokenObtainPairView

urlpatterns = [
	path('admin/', admin.site.urls),
	path('api/auth/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
	path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
	path('api/users/', include('users.urls')),
	path('api/', include('work.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
