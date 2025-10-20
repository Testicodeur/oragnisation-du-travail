from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.http import HttpResponse
from django.contrib.auth import get_user_model
import json
import csv
from io import StringIO
from .models import User
from .serializers import (
    UserProfileSerializer, 
    UserPreferencesSerializer, 
    ChangePasswordSerializer,
    NotificationPreferencesSerializer,
    AppearancePreferencesSerializer
)

User = get_user_model()


class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user


@api_view(['GET', 'PUT'])
@permission_classes([permissions.IsAuthenticated])
def notification_preferences(request):
    user = request.user
    
    if request.method == 'GET':
        prefs = user.notification_preferences or {}
        # Valeurs par défaut
        default_prefs = {
            'email': True,
            'telegram': False,
            'task_complete': True,
            'project_deadline': True,
            'daily_summary': False,
            'weekly_report': True
        }
        # Fusionner avec les préférences existantes
        for key, default_value in default_prefs.items():
            if key not in prefs:
                prefs[key] = default_value
        
        return Response(prefs)
    
    elif request.method == 'PUT':
        serializer = NotificationPreferencesSerializer(data=request.data)
        if serializer.is_valid():
            user.notification_preferences = serializer.validated_data
            user.save(update_fields=['notification_preferences'])
            return Response(serializer.validated_data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT'])
@permission_classes([permissions.IsAuthenticated])
def appearance_preferences(request):
    user = request.user
    
    if request.method == 'GET':
        prefs = user.appearance_preferences or {}
        # Valeurs par défaut
        default_prefs = {
            'theme': 'dark',
            'accent_color': '#8b5cf6',
            'sidebar_collapsed': False,
            'animations_enabled': True
        }
        # Fusionner avec les préférences existantes
        for key, default_value in default_prefs.items():
            if key not in prefs:
                prefs[key] = default_value
        
        return Response(prefs)
    
    elif request.method == 'PUT':
        serializer = AppearancePreferencesSerializer(data=request.data)
        if serializer.is_valid():
            user.appearance_preferences = serializer.validated_data
            user.save(update_fields=['appearance_preferences'])
            return Response(serializer.validated_data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def change_password(request):
    serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        user = request.user
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        return Response({'message': 'Mot de passe changé avec succès.'})
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def export_user_data(request):
    """Exporte toutes les données de l'utilisateur en JSON"""
    user = request.user
    
    # Récupérer toutes les données liées à l'utilisateur
    from work.models import Project, Task, Event, TimeEntry, Comment, Attachment
    
    data = {
        'user_profile': {
            'personal_identifier': user.personal_identifier,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.email,
            'date_joined': user.date_joined.isoformat(),
            'notification_preferences': user.notification_preferences,
            'appearance_preferences': user.appearance_preferences,
        },
        'projects': list(Project.objects.filter(created_by=user).values(
            'id', 'name', 'description', 'status', 'priority', 'category',
            'start_date', 'due_date', 'created_at'
        )),
        'tasks': list(Task.objects.filter(assigned_to=user).values(
            'id', 'title', 'description', 'status', 'priority', 'project_id',
            'due_date', 'created_at', 'updated_at'
        )),
        'events': list(Event.objects.filter(user=user).values(
            'id', 'title', 'description', 'event_type', 'start_datetime',
            'end_datetime', 'location', 'created_at'
        )),
        'time_entries': list(TimeEntry.objects.filter(user=user).values(
            'id', 'task_id', 'start_time', 'end_time', 'duration', 'description'
        )),
        'comments': list(Comment.objects.filter(user=user).values(
            'id', 'task_id', 'content', 'created_at'
        )),
    }
    
    # Convertir en JSON
    json_data = json.dumps(data, indent=2, default=str)
    
    # Créer la réponse HTTP
    response = HttpResponse(json_data, content_type='application/json')
    response['Content-Disposition'] = f'attachment; filename="workflow_data_{user.personal_identifier}.json"'
    
    return response


@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
def delete_user_data(request):
    """Supprime toutes les données de l'utilisateur (DANGEREUX!)"""
    user = request.user
    
    # Vérifier le mot de passe pour confirmer
    password = request.data.get('password')
    if not password or not user.check_password(password):
        return Response(
            {'error': 'Mot de passe requis pour confirmer la suppression.'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Supprimer toutes les données liées
    from work.models import Project, Task, Event, TimeEntry, Comment, Attachment
    
    # Compter les éléments avant suppression
    counts = {
        'projects': Project.objects.filter(created_by=user).count(),
        'tasks': Task.objects.filter(assigned_to=user).count(),
        'events': Event.objects.filter(user=user).count(),
        'time_entries': TimeEntry.objects.filter(user=user).count(),
        'comments': Comment.objects.filter(user=user).count(),
    }
    
    # Supprimer les données
    Project.objects.filter(created_by=user).delete()
    Task.objects.filter(assigned_to=user).delete()
    Event.objects.filter(user=user).delete()
    TimeEntry.objects.filter(user=user).delete()
    Comment.objects.filter(user=user).delete()
    Attachment.objects.filter(user=user).delete()
    
    # Réinitialiser les préférences utilisateur
    user.notification_preferences = {}
    user.appearance_preferences = {}
    user.save()
    
    return Response({
        'message': 'Toutes les données ont été supprimées avec succès.',
        'deleted_counts': counts
    })
