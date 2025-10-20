# Guide de Déploiement Gratuit

## Configuration Actuelle

Votre projet utilise maintenant **SQLite** par défaut, ce qui le rend parfait pour un déploiement simple et gratuit.

### Base de Données

- **Développement local avec Docker** : PostgreSQL (avec `USE_POSTGRESQL=1`)
- **Déploiement/Production** : SQLite (par défaut)

## Déploiement Frontend sur Netlify (Gratuit)

### 1. Préparer le Frontend

```bash
cd frontend
npm install
npm run build
```

### 2. Déployer sur Netlify

1. Connectez votre repo GitHub à Netlify
2. Configurez les paramètres de build :
   - **Base directory** : `frontend`
   - **Build command** : `npm run build`
   - **Publish directory** : `frontend/out`

3. Variables d'environnement sur Netlify :
   - `NEXT_PUBLIC_API_URL` : URL de votre backend

## Déploiement Backend (Options Gratuites)

### Option 1: Render (Recommandé)
- Gratuit avec limitations (750h/mois)
- Support SQLite natif
- Deploy automatique depuis GitHub
- Configuration via render.yaml

### Option 2: Railway
- Gratuit jusqu'à 500h/mois
- Support SQLite
- Deploy automatique

### Option 3: Heroku (Tier gratuit limité)
- Nécessite un add-on pour la persistance SQLite

## Migration des Données

Pour migrer depuis PostgreSQL vers SQLite :

```bash
# 1. Exporter les données depuis PostgreSQL
python backend/manage.py dumpdata --natural-foreign --natural-primary -e contenttypes -e auth.Permission > data.json

# 2. Configurer SQLite (USE_POSTGRESQL=0 ou non défini)
# 3. Créer les tables SQLite
python backend/manage.py migrate

# 4. Importer les données
python backend/manage.py loaddata data.json
```

## Commandes Utiles

### Développement Local (PostgreSQL)
```bash
export USE_POSTGRESQL=1
docker-compose -f docker-compose.dev.yaml up
```

### Test Local (SQLite)
```bash
cd backend
python manage.py migrate
python manage.py runserver
```

### Build Frontend
```bash
cd frontend
npm run build
```

## Avantages de SQLite

- ✅ Aucune configuration de base de données externe
- ✅ Fichier unique, facile à sauvegarder
- ✅ Parfait pour les applications de taille moyenne
- ✅ Déploiement simplifié
- ✅ Coût zéro

## Limitations

- ⚠️ Pas de concurrence élevée (mais suffisant pour la plupart des cas)
- ⚠️ Sauvegarde manuelle du fichier db.sqlite3
