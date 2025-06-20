# 6. urls.py de l'app artisans (artisans/urls.py)
from rest_framework.routers import DefaultRouter
from .views import ArtisanViewSet, CommentaireViewSet, export_artisans_json
from django.urls import path, include

router = DefaultRouter()
router.register('artisans', ArtisanViewSet)
router.register('commentaires', CommentaireViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('export-json/', export_artisans_json, name='export-artisans-json'),
]
