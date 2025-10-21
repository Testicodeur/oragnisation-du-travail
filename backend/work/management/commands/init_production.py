from django.core.management.base import BaseCommand
from django.utils import timezone
from users.models import User
from work.models import Project, Task, SubTask, Comment, Doc, TimeEntry, Event
import os

class Command(BaseCommand):
    help = "Initialize production data with demo content"

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('🚀 Initialisation des données de production...'))
        
        # Créer les utilisateurs de démonstration
        admin_user, created = User.objects.get_or_create(
            personal_identifier="admin",
            defaults={
                "first_name": "Admin",
                "last_name": "System",
                "email": "admin@orgwork.com",
                "is_staff": True,
                "is_superuser": True
            }
        )
        if created:
            admin_user.set_password("admin123")
            admin_user.save()
            self.stdout.write(f'✅ Utilisateur admin créé')
        
        romain, created = User.objects.get_or_create(
            personal_identifier="romain",
            defaults={
                "first_name": "Romain",
                "last_name": "Regnier", 
                "email": "romain@orgwork.com",
                "is_staff": True,
                "is_superuser": True
            }
        )
        if created:
            romain.set_password("password")
            romain.save()
            self.stdout.write(f'✅ Utilisateur romain créé')
        
        thibaud, created = User.objects.get_or_create(
            personal_identifier="thibaud",
            defaults={
                "first_name": "Thibaud",
                "last_name": "Martin",
                "email": "thibaud@orgwork.com",
                "is_staff": True
            }
        )
        if created:
            thibaud.set_password("password")
            thibaud.save()
            self.stdout.write(f'✅ Utilisateur thibaud créé')

        # Créer les projets de démonstration
        project1, created = Project.objects.get_or_create(
            name="Site client NovaTech",
            defaults={
                "description": "Développement du portail client pour NovaTech",
                "client": "NovaTech",
                "status": "active",
                "category": "dev",
            }
        )
        if created:
            self.stdout.write(f'✅ Projet "{project1.name}" créé')

        project2, created = Project.objects.get_or_create(
            name="Application mobile TaskFlow",
            defaults={
                "description": "Application de gestion de tâches mobile",
                "client": "TaskFlow Inc",
                "status": "active", 
                "category": "dev",
            }
        )
        if created:
            self.stdout.write(f'✅ Projet "{project2.name}" créé')

        # Créer les tâches de démonstration
        task1, created = Task.objects.get_or_create(
            project=project1,
            title="Setup CI/CD Pipeline",
            defaults={
                "description": "Mise en place du pipeline d'intégration continue",
                "status": "doing",
                "priority": "high",
                "assignee": romain,
                "due_date": timezone.now().date() + timezone.timedelta(days=2)
            }
        )
        if created:
            self.stdout.write(f'✅ Tâche "{task1.title}" créée')

        task2, created = Task.objects.get_or_create(
            project=project1,
            title="Design landing page",
            defaults={
                "description": "Conception de la page d'accueil",
                "status": "todo",
                "priority": "medium",
                "assignee": thibaud,
                "due_date": timezone.now().date() + timezone.timedelta(days=1)
            }
        )
        if created:
            self.stdout.write(f'✅ Tâche "{task2.title}" créée')

        task3, created = Task.objects.get_or_create(
            project=project1,
            title="API clients v1",
            defaults={
                "description": "Développement de l'API pour les clients",
                "status": "done",
                "priority": "high",
                "assignee": romain,
                "due_date": timezone.now().date() - timezone.timedelta(days=1)
            }
        )
        if created:
            self.stdout.write(f'✅ Tâche "{task3.title}" créée')

        task4, created = Task.objects.get_or_create(
            project=project2,
            title="Interface utilisateur mobile",
            defaults={
                "description": "Développement de l'interface mobile",
                "status": "doing",
                "priority": "high",
                "assignee": thibaud,
                "due_date": timezone.now().date() + timezone.timedelta(days=5)
            }
        )
        if created:
            self.stdout.write(f'✅ Tâche "{task4.title}" créée')

        # Créer des sous-tâches
        SubTask.objects.get_or_create(
            task=task1,
            title="Configuration Docker",
            defaults={"is_done": True}
        )
        SubTask.objects.get_or_create(
            task=task1,
            title="Tests automatisés",
            defaults={"is_done": False}
        )

        # Créer des commentaires
        Comment.objects.get_or_create(
            task=task1,
            author=romain,
            content="Pipeline configuré avec succès ✅",
            defaults={"created_at": timezone.now()}
        )

        # Créer des documents
        Doc.objects.get_or_create(
            title="Convention de code",
            defaults={
                "content": "Règles de nommage, revues de code, et standards CI/CD pour l'équipe",
                "category": "process",
                "author": romain
            }
        )

        Doc.objects.get_or_create(
            title="Guide d'installation",
            defaults={
                "content": "Instructions pour configurer l'environnement de développement local",
                "category": "tech",
                "author": romain
            }
        )

        # Créer des entrées de temps
        TimeEntry.objects.get_or_create(
            task=task3,
            user=romain,
            started_at=timezone.now() - timezone.timedelta(hours=3),
            ended_at=timezone.now() - timezone.timedelta(hours=1),
            defaults={
                "duration_minutes": 120,
                "description": "Développement API clients"
            }
        )

        TimeEntry.objects.get_or_create(
            task=task1,
            user=romain,
            started_at=timezone.now() - timezone.timedelta(hours=5),
            ended_at=timezone.now() - timezone.timedelta(hours=3),
            defaults={
                "duration_minutes": 120,
                "description": "Configuration CI/CD"
            }
        )

        # Créer des événements
        Event.objects.get_or_create(
            title="Réunion équipe hebdomadaire",
            defaults={
                "description": "Point hebdomadaire sur l'avancement des projets",
                "event_type": "meeting",
                "start_datetime": timezone.now() + timezone.timedelta(days=1, hours=9),
                "end_datetime": timezone.now() + timezone.timedelta(days=1, hours=10),
                "all_day": False,
                "location": "Salle de réunion",
                "user": romain,
                "project": project1,
                "color": "#8B5CF6"
            }
        )

        Event.objects.get_or_create(
            title="Focus Time - Développement",
            defaults={
                "description": "Session de développement concentré",
                "event_type": "focus",
                "start_datetime": timezone.now() + timezone.timedelta(days=2, hours=14),
                "end_datetime": timezone.now() + timezone.timedelta(days=2, hours=16),
                "all_day": False,
                "location": "",
                "user": romain,
                "task": task1,
                "color": "#EF4444"
            }
        )

        Event.objects.get_or_create(
            title="Deadline - Landing Page",
            defaults={
                "description": "Échéance pour la livraison de la landing page",
                "event_type": "deadline",
                "start_datetime": timezone.now() + timezone.timedelta(days=1),
                "end_datetime": timezone.now() + timezone.timedelta(days=1),
                "all_day": True,
                "location": "",
                "user": thibaud,
                "task": task2,
                "color": "#DC2626"
            }
        )

        # Statistiques finales
        projects_count = Project.objects.count()
        tasks_count = Task.objects.count()
        users_count = User.objects.count()
        events_count = Event.objects.count()
        time_entries_count = TimeEntry.objects.count()

        self.stdout.write(self.style.SUCCESS('🎉 Initialisation terminée !'))
        self.stdout.write(f'📊 Statistiques :')
        self.stdout.write(f'   - {users_count} utilisateurs')
        self.stdout.write(f'   - {projects_count} projets')
        self.stdout.write(f'   - {tasks_count} tâches')
        self.stdout.write(f'   - {events_count} événements')
        self.stdout.write(f'   - {time_entries_count} entrées de temps')
        self.stdout.write(self.style.SUCCESS('✅ Le site est maintenant prêt à être utilisé !'))
