from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.utils import timezone
from users.models import User
from work.models import Project, Task, SubTask, Comment, Doc, TimeEntry, Event
import json

@csrf_exempt
@require_http_methods(["POST"])
def initialize_production_data(request):
    """Endpoint pour initialiser les données de production"""
    
    try:
        # Vérifier si des données complètes existent déjà
        force = request.GET.get('force', 'false').lower() == 'true'
        
        if not force and (User.objects.filter(personal_identifier__in=["admin", "romain"]).exists() and 
            Project.objects.count() > 0 and Task.objects.count() > 0):
            return JsonResponse({
                'status': 'info',
                'message': 'Les données existent déjà (utilisez ?force=true pour forcer)',
                'users': User.objects.count(),
                'projects': Project.objects.count(),
                'tasks': Task.objects.count()
            })

        # Créer les utilisateurs de démonstration (ou les récupérer s'ils existent)
        admin_user, created = User.objects.get_or_create(
            personal_identifier="admin",
            defaults={
                "email": "admin@orgwork.com",
                "first_name": "Admin",
                "last_name": "System",
                "is_staff": True,
                "is_superuser": True
            }
        )
        if created:
            admin_user.set_password("admin123")
            admin_user.save()
        
        romain, created = User.objects.get_or_create(
            personal_identifier="romain",
            defaults={
                "email": "romain@orgwork.com",
                "first_name": "Romain",
                "last_name": "Regnier",
                "is_staff": True,
                "is_superuser": True
            }
        )
        if created:
            romain.set_password("password")
            romain.save()
        
        thibaud, created = User.objects.get_or_create(
            personal_identifier="thibaud",
            defaults={
                "email": "thibaud@orgwork.com",
                "first_name": "Thibaud",
                "last_name": "Martin",
                "is_staff": True
            }
        )
        if created:
            thibaud.set_password("password")
            thibaud.save()

        # Créer les projets de démonstration
        project1 = Project.objects.create(
            name="Site client NovaTech",
            description="Développement du portail client pour NovaTech",
            client="NovaTech",
            status="active",
            category="dev"
        )

        project2 = Project.objects.create(
            name="Application mobile TaskFlow",
            description="Application de gestion de tâches mobile",
            client="TaskFlow Inc",
            status="active", 
            category="dev"
        )

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

        task2 = Task.objects.create(
            project=project1,
            title="Design landing page",
            description="Conception de la page d'accueil",
            status="todo",
            priority="medium",
            assignee=thibaud,
            due_date=timezone.now().date() + timezone.timedelta(days=1)
        )

        task3 = Task.objects.create(
            project=project1,
            title="API clients v1",
            description="Développement de l'API pour les clients",
            status="done",
            priority="high",
            assignee=romain,
            due_date=timezone.now().date() - timezone.timedelta(days=1)
        )

        task4 = Task.objects.create(
            project=project2,
            title="Interface utilisateur mobile",
            description="Développement de l'interface mobile",
            status="doing",
            priority="high",
            assignee=thibaud,
            due_date=timezone.now().date() + timezone.timedelta(days=5)
        )

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

        # Créer des commentaires
        Comment.objects.create(
            task=task1,
            author=romain,
            content="Pipeline configuré avec succès ✅"
        )

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

        # Statistiques finales
        stats = {
            'users': User.objects.count(),
            'projects': Project.objects.count(),
            'tasks': Task.objects.count(),
            'events': Event.objects.count(),
            'time_entries': TimeEntry.objects.count()
        }

        return JsonResponse({
            'status': 'success',
            'message': 'Données de démonstration créées avec succès !',
            'stats': stats
        })

    except Exception as e:
        return JsonResponse({
            'status': 'error',
            'message': f'Erreur lors de la création des données : {str(e)}'
        }, status=500)
