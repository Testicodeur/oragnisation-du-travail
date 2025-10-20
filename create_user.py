#!/usr/bin/env python3
"""
Script pour créer un utilisateur sur le serveur de production
À exécuter une seule fois après le déploiement
"""

import os
import django
from django.conf import settings

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from users.models import User

def create_user():
    personal_identifier = 'romain'
    password = 'admin123'
    
    # Vérifier si l'utilisateur existe déjà
    if User.objects.filter(personal_identifier=personal_identifier).exists():
        print(f"L'utilisateur '{personal_identifier}' existe déjà.")
        return
    
    # Créer l'utilisateur
    user = User.objects.create_superuser(
        personal_identifier=personal_identifier,
        password=password
    )
    
    print(f"Utilisateur créé avec succès !")
    print(f"Identifiant: {personal_identifier}")
    print(f"Mot de passe: {password}")

if __name__ == '__main__':
    create_user()
