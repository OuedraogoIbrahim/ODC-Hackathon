# 3. models.py (dans artisans/models.py)
from django.db import models

class Artisan(models.Model):
    METIERS = [
        ('plombier', 'Plombier'),
        ('electricien', 'Électricien'),
        ('macon', 'Maçon'),
        ('couturier', 'Couturier'),
        ('menuisier', 'Menuisier'),
        ('photographe', 'Photographe'),
        # Ajoute selon les besoins
    ]

    nom = models.CharField(max_length=100)
    metier = models.CharField(max_length=20, choices=METIERS)
    ville = models.CharField(max_length=100)
    quartier = models.CharField(max_length=100)
    contact = models.CharField(max_length=20)
    whatsapp = models.BooleanField(default=False)
    note = models.FloatField(default=0.0)

    def __str__(self):
        return f"{self.nom} - {self.metier}"

class Commentaire(models.Model):
    artisan = models.ForeignKey(Artisan, related_name="commentaires", on_delete=models.CASCADE)
    contenu = models.TextField()
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Commentaire sur {self.artisan.nom}"