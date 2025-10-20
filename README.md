# Organisation du Travail

Application de gestion de projets et tâches avec Django + Next.js et SQLite.

## 🚀 Déploiement

### Frontend (Netlify)
- **Build command**: `cd frontend && npm run build`
- **Publish directory**: `frontend/.next`
- **Node version**: 20

### Backend (Render)
- **Build command**: `cd backend && pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate`
- **Start command**: `cd backend && python manage.py runserver 0.0.0.0:$PORT`
- **Configuration**: Utilise `render.yaml` pour la configuration automatique

## 🔧 Développement Local

```bash
# Backend (SQLite)
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

# Frontend
cd frontend
npm install
npm run dev
```

## 📋 Variables d'Environnement

### Netlify (Frontend)
- `NEXT_PUBLIC_API_URL`: URL de votre backend déployé

### Render (Backend)
- `DJANGO_SECRET_KEY`: Générée automatiquement par Render
- `DJANGO_DEBUG`: `0` (configuré automatiquement)
- `ALLOWED_HOSTS`: `*.onrender.com` (configuré automatiquement)

## 🎯 Fonctionnalités

- ✅ Gestion de projets et tâches
- ✅ Timer de travail
- ✅ Planning et calendrier
- ✅ Interface moderne avec Next.js
- ✅ API REST avec Django
- ✅ Base de données SQLite (simple et gratuite)
