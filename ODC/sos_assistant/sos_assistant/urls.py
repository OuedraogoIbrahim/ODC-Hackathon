# 7. urls.py du projet (sos_assistant/urls.py)
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('artisans.urls')),
]