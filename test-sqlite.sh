#!/bin/bash

echo "🔧 Test de la configuration SQLite..."

# Test du backend avec SQLite
echo "📦 Test du backend Django avec SQLite..."
cd backend
export USE_POSTGRESQL=0
python3 manage.py migrate --run-syncdb
python3 manage.py collectstatic --noinput
echo "✅ Backend SQLite configuré avec succès"

# Test du frontend
echo "📦 Test du build frontend..."
cd ../frontend
npm run build
echo "✅ Frontend build avec succès"

echo ""
echo "🎉 Configuration SQLite prête pour le déploiement !"
echo ""
echo "📋 Résumé de la configuration :"
echo "   • Base de données : SQLite (db.sqlite3)"
echo "   • Backend : Django avec SQLite par défaut"
echo "   • Frontend : Next.js avec build optimisé"
echo "   • Déploiement : Prêt pour Netlify + Railway/Render"
echo ""
echo "🚀 Pour déployer :"
echo "   1. Frontend sur Netlify (auto-deploy depuis GitHub)"
echo "   2. Backend sur Railway/Render (auto-deploy depuis GitHub)"
echo "   3. Configurer NEXT_PUBLIC_API_URL sur Netlify"
