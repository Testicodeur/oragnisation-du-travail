from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.utils import timezone
from users.models import User
from work.models import Project, Task, SubTask, Comment, Doc, TimeEntry, Event

@csrf_exempt
def simple_init(request):
    """Endpoint GET simple pour initialiser les données"""
    
    try:
        # Supprimer toutes les données existantes pour repartir à zéro
        Event.objects.all().delete()
        TimeEntry.objects.all().delete()
        Comment.objects.all().delete()
        SubTask.objects.all().delete()
        Task.objects.all().delete()
        Project.objects.all().delete()
        Doc.objects.all().delete()
        User.objects.filter(personal_identifier__in=["admin", "romain", "thibaud"]).delete()
        
        # Créer les utilisateurs
        admin_user = User.objects.create_user(
            personal_identifier="admin",
            email="admin@orgwork.com",
            password="admin123",
            first_name="Admin",
            last_name="System",
            is_staff=True,
            is_superuser=True
        )
        
        romain = User.objects.create_user(
            personal_identifier="romain",
            email="romain@orgwork.com", 
            password="password",
            first_name="Romain",
            last_name="Regnier",
            is_staff=True,
            is_superuser=True
        )
        
        thibaud = User.objects.create_user(
            personal_identifier="thibaud",
            email="thibaud@orgwork.com",
            password="password", 
            first_name="Thibaud",
            last_name="Martin",
            is_staff=True
        )

        # Créer les projets
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

        # Créer les tâches
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

        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>Initialisation des données</title>
            <style>
                body {{ font-family: Arial, sans-serif; margin: 40px; }}
                .success {{ color: green; }}
                .stats {{ background: #f0f0f0; padding: 20px; margin: 20px 0; }}
            </style>
        </head>
        <body>
            <h1>🎉 Initialisation réussie !</h1>
            <p class="success">✅ Toutes les données de démonstration ont été créées avec succès !</p>
            
            <div class="stats">
                <h2>📊 Statistiques :</h2>
                <ul>
                    <li><strong>{stats['users']}</strong> utilisateurs créés</li>
                    <li><strong>{stats['projects']}</strong> projets créés</li>
                    <li><strong>{stats['tasks']}</strong> tâches créées</li>
                    <li><strong>{stats['events']}</strong> événements créés</li>
                    <li><strong>{stats['time_entries']}</strong> entrées de temps créées</li>
                </ul>
            </div>
            
            <h2>🔑 Connexion :</h2>
            <p><strong>Identifiant :</strong> romain</p>
            <p><strong>Mot de passe :</strong> password</p>
            
            <p><a href="https://majestic-cobbler-76f6b5.netlify.app/">🚀 Aller sur le site</a></p>
        </body>
        </html>
        """
        
        return HttpResponse(html)

    except Exception as e:
        error_html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>Erreur d'initialisation</title>
            <style>
                body {{ font-family: Arial, sans-serif; margin: 40px; }}
                .error {{ color: red; }}
            </style>
        </head>
        <body>
            <h1>❌ Erreur d'initialisation</h1>
            <p class="error">Erreur : {str(e)}</p>
        </body>
        </html>
        """
        return HttpResponse(error_html, status=500)
