#!/usr/bin/env bash
# Build script pour Render

set -o errexit  # exit on error

echo "🚀 Début du build pour Render..."

# Installer les dépendances Python
echo "📦 Installation des dépendances..."
pip install -r backend/requirements.txt

# Collecter les fichiers statiques
echo "📁 Collecte des fichiers statiques..."
python backend/manage.py collectstatic --no-input

# Exécuter les migrations
echo "🗄️ Exécution des migrations..."
python backend/manage.py migrate

# Initialiser les données de production (seulement si la base est vide)
echo "🎯 Vérification et initialisation des données..."
python backend/manage.py init_production

echo "✅ Build terminé avec succès!"
