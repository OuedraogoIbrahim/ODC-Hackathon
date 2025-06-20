# Generated by Django 5.1.1 on 2025-06-18 22:17

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="Artisan",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("nom", models.CharField(max_length=100)),
                (
                    "metier",
                    models.CharField(
                        choices=[
                            ("plombier", "Plombier"),
                            ("electricien", "Électricien"),
                            ("macon", "Maçon"),
                            ("couturier", "Couturier"),
                            ("menuisier", "Menuisier"),
                        ],
                        max_length=20,
                    ),
                ),
                ("ville", models.CharField(max_length=100)),
                ("quartier", models.CharField(max_length=100)),
                ("contact", models.CharField(max_length=20)),
                ("whatsapp", models.BooleanField(default=False)),
                ("note", models.FloatField(default=0.0)),
            ],
        ),
        migrations.CreateModel(
            name="Commentaire",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("contenu", models.TextField()),
                ("date", models.DateTimeField(auto_now_add=True)),
                (
                    "artisan",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="commentaires",
                        to="artisans.artisan",
                    ),
                ),
            ],
        ),
    ]
