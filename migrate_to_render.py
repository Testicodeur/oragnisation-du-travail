#!/usr/bin/env python3
"""
Script pour migrer les données locales vers Render
"""
import json
import requests
import sys
from datetime import datetime

RENDER_API_URL = "https://oragnisation-du-travail.onrender.com"

def create_user_on_render(user_data):
    """Créer un utilisateur sur Render"""
    url = f"{RENDER_API_URL}/api/auth/register/"
    
    payload = {
        "personal_identifier": user_data["fields"]["personal_identifier"],
        "email": user_data["fields"]["email"],
        "password": "admin123",  # Mot de passe par défaut
        "first_name": user_data["fields"].get("first_name", ""),
        "last_name": user_data["fields"].get("last_name", ""),
    }
    
    try:
        response = requests.post(url, json=payload)
        if response.status_code in [200, 201]:
            print(f"✅ Utilisateur créé: {payload['personal_identifier']}")
            return True
        else:
            print(f"❌ Erreur création utilisateur {payload['personal_identifier']}: {response.status_code}")
            print(f"   Réponse: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Exception lors de la création de l'utilisateur: {e}")
        return False

def get_auth_token(personal_identifier="romain", password="admin123"):
    """Obtenir un token d'authentification"""
    url = f"{RENDER_API_URL}/api/auth/token/"
    
    payload = {
        "personal_identifier": personal_identifier,
        "password": password
    }
    
    try:
        response = requests.post(url, json=payload)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Token obtenu pour {personal_identifier}")
            return data["access"]
        else:
            print(f"❌ Erreur d'authentification: {response.status_code}")
            print(f"   Réponse: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Exception lors de l'authentification: {e}")
        return None

def create_project_on_render(project_data, token):
    """Créer un projet sur Render"""
    url = f"{RENDER_API_URL}/api/projects/"
    headers = {"Authorization": f"Bearer {token}"}
    
    payload = {
        "name": project_data["fields"]["name"],
        "description": project_data["fields"].get("description", ""),
        "status": project_data["fields"].get("status", "active"),
    }
    
    try:
        response = requests.post(url, json=payload, headers=headers)
        if response.status_code in [200, 201]:
            data = response.json()
            print(f"✅ Projet créé: {payload['name']} (ID: {data['id']})")
            return data["id"]
        else:
            print(f"❌ Erreur création projet {payload['name']}: {response.status_code}")
            print(f"   Réponse: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Exception lors de la création du projet: {e}")
        return None

def create_task_on_render(task_data, token, project_mapping):
    """Créer une tâche sur Render"""
    url = f"{RENDER_API_URL}/api/tasks/"
    headers = {"Authorization": f"Bearer {token}"}
    
    # Mapper l'ancien ID de projet vers le nouveau
    old_project_id = task_data["fields"]["project"]
    new_project_id = project_mapping.get(old_project_id)
    
    if not new_project_id:
        print(f"❌ Projet non trouvé pour la tâche {task_data['fields']['title']}")
        return None
    
    payload = {
        "project": new_project_id,
        "title": task_data["fields"]["title"],
        "description": task_data["fields"].get("description", ""),
        "status": task_data["fields"].get("status", "todo"),
        "priority": task_data["fields"].get("priority", "medium"),
        "due_date": task_data["fields"].get("due_date"),
    }
    
    try:
        response = requests.post(url, json=payload, headers=headers)
        if response.status_code in [200, 201]:
            data = response.json()
            print(f"✅ Tâche créée: {payload['title']} (ID: {data['id']})")
            return data["id"]
        else:
            print(f"❌ Erreur création tâche {payload['title']}: {response.status_code}")
            print(f"   Réponse: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Exception lors de la création de la tâche: {e}")
        return None

def create_event_on_render(event_data, token):
    """Créer un événement sur Render"""
    url = f"{RENDER_API_URL}/api/events/"
    headers = {"Authorization": f"Bearer {token}"}
    
    payload = {
        "title": event_data["fields"]["title"],
        "description": event_data["fields"].get("description", ""),
        "event_type": event_data["fields"].get("event_type", "other"),
        "start_datetime": event_data["fields"]["start_datetime"],
        "end_datetime": event_data["fields"]["end_datetime"],
        "all_day": event_data["fields"].get("all_day", False),
        "location": event_data["fields"].get("location", ""),
        "color": event_data["fields"].get("color", "#3B82F6"),
    }
    
    try:
        response = requests.post(url, json=payload, headers=headers)
        if response.status_code in [200, 201]:
            data = response.json()
            print(f"✅ Événement créé: {payload['title']}")
            return data["id"]
        else:
            print(f"❌ Erreur création événement {payload['title']}: {response.status_code}")
            print(f"   Réponse: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Exception lors de la création de l'événement: {e}")
        return None

def main():
    print("🚀 Migration des données vers Render...")
    
    # Charger les données de sauvegarde
    try:
        with open("data_backup.json", "r") as f:
            data = json.load(f)
        print(f"📁 Données chargées: {len(data)} objets")
    except Exception as e:
        print(f"❌ Erreur lors du chargement des données: {e}")
        return
    
    # Séparer les données par type
    users = [item for item in data if item["model"] == "users.user"]
    projects = [item for item in data if item["model"] == "work.project"]
    tasks = [item for item in data if item["model"] == "work.task"]
    events = [item for item in data if item["model"] == "work.event"]
    
    print(f"📊 Trouvé: {len(users)} utilisateurs, {len(projects)} projets, {len(tasks)} tâches, {len(events)} événements")
    
    # 1. Créer les utilisateurs
    print("\n👥 Création des utilisateurs...")
    for user in users:
        create_user_on_render(user)
    
    # 2. Obtenir un token d'authentification
    print("\n🔑 Authentification...")
    token = get_auth_token()
    if not token:
        print("❌ Impossible de s'authentifier. Arrêt de la migration.")
        return
    
    # 3. Créer les projets
    print("\n📁 Création des projets...")
    project_mapping = {}  # old_id -> new_id
    for project in projects:
        old_id = project["pk"]
        new_id = create_project_on_render(project, token)
        if new_id:
            project_mapping[old_id] = new_id
    
    # 4. Créer les tâches
    print("\n📋 Création des tâches...")
    for task in tasks:
        create_task_on_render(task, token, project_mapping)
    
    # 5. Créer les événements
    print("\n📅 Création des événements...")
    for event in events:
        create_event_on_render(event, token)
    
    print("\n✅ Migration terminée!")
    print("🌐 Vous pouvez maintenant utiliser votre application sur Netlify avec vos données!")

if __name__ == "__main__":
    main()

