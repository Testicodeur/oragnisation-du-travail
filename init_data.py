#!/usr/bin/env python3
"""
Script pour initialiser les données de production
À exécuter avec : python init_data.py
"""

import os
import sys
import django

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
sys.path.append('/opt/render/project/src/backend')

django.setup()

from django.utils import timezone
from users.models import User
from work.models import Project, Task, SubTask, Comment, Doc, TimeEntry, Event

def main():
    print("🚀 Initialisation des données de production...")
    
    # Vérifier si des données existent déjà
    if User.objects.filter(personal_identifier__in=["admin", "romain"]).exists():
        print("ℹ️ Les données existent déjà")
        print(f"   - {User.objects.count()} utilisateurs")
        print(f"   - {Project.objects.count()} projets")
        print(f"   - {Task.objects.count()} tâches")
        return

    try:
        # Créer les utilisateurs de démonstration
        admin_user = User.objects.create_user(
            personal_identifier="admin",
            email="admin@orgwork.com",
            password="admin123",
            first_name="Admin",
            last_name="System",
            is_staff=True,
            is_superuser=True
        )
        print("✅ Utilisateur admin créé")
        
        romain = User.objects.create_user(
            personal_identifier="romain",
            email="romain@orgwork.com", 
            password="password",
            first_name="Romain",
            last_name="Regnier",
            is_staff=True,
            is_superuser=True
        )
        print("✅ Utilisateur romain créé")
        
        thibaud = User.objects.create_user(
            personal_identifier="thibaud",
            email="thibaud@orgwork.com",
            password="password", 
            first_name="Thibaud",
            last_name="Martin",
            is_staff=True
        )
        print("✅ Utilisateur thibaud créé")

        # Créer les projets de démonstration
        project1 = Project.objects.create(
            name="Site client NovaTech",
            description="Développement du portail client pour NovaTech",
            client="NovaTech",
            status="active",
            category="dev"
        )
        print(f"✅ Projet '{project1.name}' créé")

        project2 = Project.objects.create(
            name="Application mobile TaskFlow",
            description="Application de gestion de tâches mobile",
            client="TaskFlow Inc",
            status="active", 
            category="dev"
        )
        print(f"✅ Projet '{project2.name}' créé")

        # Créer les tâches de démonstration
        task1 = Task.objects.create(
            project=project1,
            title="Setup CI/CD Pipeline",
            description="Mise en place du pipeline d'intégration continue",
            status="doing",
            priority="high",
            assignee=romain,
            due_date=timezone.now().date() + timezone.timedelta(days=2)
        )
        print(f"✅ Tâche '{task1.title}' créée")

        task2 = Task.objects.create(
            project=project1,
            title="Design landing page",
            description="Conception de la page d'accueil",
            status="todo",
            priority="medium",
            assignee=thibaud,
            due_date=timezone.now().date() + timezone.timedelta(days=1)
        )
        print(f"✅ Tâche '{task2.title}' créée")

        task3 = Task.objects.create(
            project=project1,
            title="API clients v1",
            description="Développement de l'API pour les clients",
            status="done",
            priority="high",
            assignee=romain,
            due_date=timezone.now().date() - timezone.timedelta(days=1)
        )
        print(f"✅ Tâche '{task3.title}' créée")

        task4 = Task.objects.create(
            project=project2,
            title="Interface utilisateur mobile",
            description="Développement de l'interface mobile",
            status="doing",
            priority="high",
            assignee=thibaud,
            due_date=timezone.now().date() + timezone.timedelta(days=5)
        )
        print(f"✅ Tâche '{task4.title}' créée")

        # Créer des sous-tâches
        SubTask.objects.create(
            task=task1,
            title="Configuration Docker",
            is_done=True
        )
        SubTask.objects.create(
            task=task1,
            title="Tests automatisés",
            is_done=False
        )
        print("✅ Sous-tâches créées")

        # Créer des commentaires
        Comment.objects.create(
            task=task1,
            author=romain,
            content="Pipeline configuré avec succès ✅"
        )
        print("✅ Commentaires créés")

        # Créer des documents
        Doc.objects.create(
            title="Convention de code",
            content="Règles de nommage, revues de code, et standards CI/CD pour l'équipe",
            category="process",
            author=romain
        )

        Doc.objects.create(
            title="Guide d'installation",
            content="Instructions pour configurer l'environnement de développement local",
            category="tech",
            author=romain
        )
        print("✅ Documents créés")

        # Créer des entrées de temps
        TimeEntry.objects.create(
            task=task3,
            user=romain,
            started_at=timezone.now() - timezone.timedelta(hours=3),
            ended_at=timezone.now() - timezone.timedelta(hours=1),
            duration_minutes=120,
            description="Développement API clients"
        )

        TimeEntry.objects.create(
            task=task1,
            user=romain,
            started_at=timezone.now() - timezone.timedelta(hours=5),
            ended_at=timezone.now() - timezone.timedelta(hours=3),
            duration_minutes=120,
            description="Configuration CI/CD"
        )
        print("✅ Entrées de temps créées")

        # Créer des événements
        Event.objects.create(
            title="Réunion équipe hebdomadaire",
            description="Point hebdomadaire sur l'avancement des projets",
            event_type="meeting",
            start_datetime=timezone.now() + timezone.timedelta(days=1, hours=9),
            end_datetime=timezone.now() + timezone.timedelta(days=1, hours=10),
            all_day=False,
            location="Salle de réunion",
            user=romain,
            project=project1,
            color="#8B5CF6"
        )

        Event.objects.create(
            title="Focus Time - Développement",
            description="Session de développement concentré",
            event_type="focus",
            start_datetime=timezone.now() + timezone.timedelta(days=2, hours=14),
            end_datetime=timezone.now() + timezone.timedelta(days=2, hours=16),
            all_day=False,
            location="",
            user=romain,
            task=task1,
            color="#EF4444"
        )

        Event.objects.create(
            title="Deadline - Landing Page",
            description="Échéance pour la livraison de la landing page",
            event_type="deadline",
            start_datetime=timezone.now() + timezone.timedelta(days=1),
            end_datetime=timezone.now() + timezone.timedelta(days=1),
            all_day=True,
            location="",
            user=thibaud,
            task=task2,
            color="#DC2626"
        )
        print("✅ Événements créés")

        # Statistiques finales
        stats = {
            'users': User.objects.count(),
            'projects': Project.objects.count(),
            'tasks': Task.objects.count(),
            'events': Event.objects.count(),
            'time_entries': TimeEntry.objects.count()
        }

        print("🎉 Initialisation terminée !")
        print(f"📊 Statistiques :")
        print(f"   - {stats['users']} utilisateurs")
        print(f"   - {stats['projects']} projets")
        print(f"   - {stats['tasks']} tâches")
        print(f"   - {stats['events']} événements")
        print(f"   - {stats['time_entries']} entrées de temps")
        print("✅ Le site est maintenant prêt à être utilisé !")

    except Exception as e:
        print(f"❌ Erreur lors de la création des données : {str(e)}")
        return False

if __name__ == "__main__":
    main()
