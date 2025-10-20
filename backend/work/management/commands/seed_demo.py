from django.core.management.base import BaseCommand
from django.utils import timezone
from users.models import User
from work.models import Project, Task, SubTask, Comment, Doc, TimeEntry

class Command(BaseCommand):
	help = "Seed demo data for dashboard"

	def handle(self, *args, **options):
		romain, _ = User.objects.get_or_create(personal_identifier="romain", defaults={"first_name":"Romain","is_staff":True,"is_superuser":True})
		thibaud, _ = User.objects.get_or_create(personal_identifier="thibaud", defaults={"first_name":"Thibaud","is_staff":True,"is_superuser":True})

		p, _ = Project.objects.get_or_create(name="Site client NovaTech", defaults={
			"description": "Développement du portail client",
			"client": "NovaTech",
			"status": "active",
			"category": "dev",
		})

		t1, _ = Task.objects.get_or_create(project=p, title="Setup CI/CD", defaults={"status":"doing","priority":"high","assignee":romain})
		t2, _ = Task.objects.get_or_create(project=p, title="Design landing page", defaults={"status":"todo","priority":"medium","assignee":thibaud})
		t3, _ = Task.objects.get_or_create(project=p, title="API clients v1", defaults={"status":"done","priority":"high","assignee":romain})

		SubTask.objects.get_or_create(task=t1, title="Pipeline tests")
		SubTask.objects.get_or_create(task=t1, title="Build docker")
		Comment.objects.get_or_create(task=t1, author=romain, content="Pipeline vert ✅")

		Doc.objects.get_or_create(title="Convention de code", defaults={"category":"process","content":"Règles de nommage, revues, CI", "author":romain})

		TimeEntry.objects.get_or_create(task=t3, user=romain, started_at=timezone.now() - timezone.timedelta(hours=3), ended_at=timezone.now() - timezone.timedelta(hours=1), defaults={"duration_minutes":120})
		self.stdout.write(self.style.SUCCESS("Données de démo créées/à jour"))
