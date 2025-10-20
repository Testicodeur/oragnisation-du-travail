from django.http import JsonResponse, HttpResponse
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
            'user_id': user.id,
            'credentials': {
                'identifiant': personal_identifier,
                'mot_de_passe': password
            }
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

def init_admin_page(request):
    """Page simple pour initialiser l'admin"""
    html = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Init Admin</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 500px; margin: 50px auto; padding: 20px; }
            input, button { padding: 10px; margin: 5px; }
            button { background: #007cba; color: white; border: none; cursor: pointer; }
        </style>
    </head>
    <body>
        <h1>Initialisation Admin</h1>
        <p>Clé secrète: <code>init-admin-2024</code></p>
        <form method="post" action="/api/users/init-admin/">
            <input type="hidden" name="secret_key" value="init-admin-2024">
            <button type="submit">Créer Admin</button>
        </form>
        <p>Ou utilisez curl:</p>
        <code>curl -X POST {}/api/users/init-admin/ -H "Content-Type: application/json" -d '{{"secret_key": "init-admin-2024"}}'</code>
    </body>
    </html>
    """.format(request.build_absolute_uri('/').rstrip('/'))
    
    return HttpResponse(html)
