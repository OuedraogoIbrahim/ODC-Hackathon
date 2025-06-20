# 5. views.py (dans artisans/views.py)
from rest_framework import viewsets
from .models import Artisan, Commentaire
from .serializers import ArtisanSerializer, CommentaireSerializer
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .serializers import ArtisanSerializer
from .models import Artisan

class ArtisanViewSet(viewsets.ModelViewSet):
    queryset = Artisan.objects.all()
    serializer_class = ArtisanSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['metier', 'ville', 'quartier']

class CommentaireViewSet(viewsets.ModelViewSet):
    queryset = Commentaire.objects.all()
    serializer_class = CommentaireSerializer

# API export JSON pour offline
@api_view(['GET'])
def export_artisans_json(request):
    artisans = Artisan.objects.all()
    serializer = ArtisanSerializer(artisans, many=True)
    return Response(serializer.data)