# 4. serializers.py (dans artisans/serializers.py)
from rest_framework import serializers
from .models import Artisan, Commentaire

class CommentaireSerializer(serializers.ModelSerializer):
    class Meta:
        model = Commentaire
        fields = ['id','artisan', 'contenu', 'date']

class ArtisanSerializer(serializers.ModelSerializer):
    commentaires = CommentaireSerializer(many=True, read_only=True)

    class Meta:
        model = Artisan
        fields = ['id', 'nom', 'metier', 'ville', 'quartier', 'contact', 'whatsapp', 'note', 'commentaires']
