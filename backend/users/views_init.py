from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from users.models import User
import json

@csrf_exempt
@require_http_methods(["POST"])
def init_admin(request):
    """
    Route pour créer l'utilisateur admin initial
    À utiliser une seule fois après le déploiement
    """
    try:
        data = json.loads(request.body)
        secret_key = data.get('secret_key')
        
        # Clé secrète pour sécuriser cette route
        if secret_key != 'init-admin-2024':
            return JsonResponse({'error': 'Clé secrète incorrecte'}, status=403)
        
        personal_identifier = 'romain'
        password = 'admin123'
        
        # Vérifier si l'utilisateur existe déjà
        if User.objects.filter(personal_identifier=personal_identifier).exists():
            return JsonResponse({
                'message': f'L\'utilisateur "{personal_identifier}" existe déjà.',
                'status': 'exists'
            })
        
        # Créer l'utilisateur
        user = User.objects.create_superuser(
            personal_identifier=personal_identifier,
            password=password
        )
        
        return JsonResponse({
            'message': f'Utilisateur "{personal_identifier}" créé avec succès!',
            'status': 'created',
            'user_id': user.id
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

def init_admin_page(request):
    """Page web pour initialiser l'admin"""
    return render(request, 'init_admin.html')
