# Dockerfile pour Render - pointe vers le backend
FROM python:3.11-slim

WORKDIR /app

# Copier les requirements
COPY backend/requirements.txt .

# Installer les dépendances
RUN pip install --no-cache-dir -r requirements.txt

# Copier le code
COPY backend/ .

# Créer la base de données et exécuter les migrations
RUN python manage.py migrate

# Collecter les fichiers statiques
RUN python manage.py collectstatic --noinput

# Créer l'utilisateur admin par défaut
RUN python manage.py shell -c "from users.models import User; User.objects.create_superuser(personal_identifier='romain', password='admin123') if not User.objects.filter(personal_identifier='romain').exists() else None"

# Exposer le port
EXPOSE 8000

# Commande de démarrage
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
