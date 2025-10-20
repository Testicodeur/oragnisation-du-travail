from django.core.management.base import BaseCommand
from users.models import User

class Command(BaseCommand):
    help = 'Créer un utilisateur admin par défaut'

    def handle(self, *args, **options):
        personal_identifier = 'romain'
        password = 'admin123'
        
        # Vérifier si l'utilisateur existe déjà
        if User.objects.filter(personal_identifier=personal_identifier).exists():
            self.stdout.write(
                self.style.WARNING(f'L\'utilisateur "{personal_identifier}" existe déjà.')
            )
            return
        
        # Créer l'utilisateur
        user = User.objects.create_superuser(
            personal_identifier=personal_identifier,
            password=password
        )
        
        self.stdout.write(
            self.style.SUCCESS(f'Utilisateur "{personal_identifier}" créé avec succès!')
        )
