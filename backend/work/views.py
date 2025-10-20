from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q
from .models import Project, Task, SubTask, Comment, Attachment, Doc, TimeEntry, ClientView, Event, Schedule, Timer
from .serializers import (
    ProjectSerializer, TaskSerializer, SubTaskSerializer,
    CommentSerializer, AttachmentSerializer, DocSerializer,
    TimeEntrySerializer, ClientViewSerializer, EventSerializer, ScheduleSerializer, TimerSerializer
)

class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all().order_by('-created_at')
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Task.objects.all().select_related('project', 'assignee').order_by('-updated_at')
        project_id = self.request.query_params.get('project')
        status_param = self.request.query_params.get('status')
        assignee_id = self.request.query_params.get('assignee')
        priority = self.request.query_params.get('priority')
        search = self.request.query_params.get('q')
        if project_id:
            qs = qs.filter(project_id=project_id)
        if status_param:
            qs = qs.filter(status=status_param)
        if assignee_id:
            qs = qs.filter(assignee_id=assignee_id)
        if priority:
            qs = qs.filter(priority=priority)
        if search:
            qs = qs.filter(Q(title__icontains=search) | Q(description__icontains=search))
        return qs

    @action(detail=True, methods=['post'])
    def move(self, request, pk=None):
        task = self.get_object()
        new_status = request.data.get('status')
        if new_status in dict(Task.STATUS_CHOICES):
            task.status = new_status
            task.save(update_fields=['status'])
            return Response(self.get_serializer(task).data)
        return Response({'detail': 'Invalid status'}, status=400)

class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all().select_related('author', 'task').order_by('-created_at')
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

class AttachmentViewSet(viewsets.ModelViewSet):
    queryset = Attachment.objects.all().select_related('task').order_by('-uploaded_at')
    serializer_class = AttachmentSerializer
    permission_classes = [permissions.IsAuthenticated]

class SubTaskViewSet(viewsets.ModelViewSet):
    queryset = SubTask.objects.all().select_related('task')
    serializer_class = SubTaskSerializer
    permission_classes = [permissions.IsAuthenticated]

class DocViewSet(viewsets.ModelViewSet):
    queryset = Doc.objects.all().order_by('-updated_at')
    serializer_class = DocSerializer
    permission_classes = [permissions.IsAuthenticated]

class TimeEntryViewSet(viewsets.ModelViewSet):
    queryset = TimeEntry.objects.all().order_by('-started_at')
    serializer_class = TimeEntrySerializer
    permission_classes = [permissions.IsAuthenticated]

class ClientViewViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ClientView.objects.filter(is_active=True)
    serializer_class = ClientViewSerializer
    permission_classes = [permissions.IsAuthenticated]

class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Event.objects.filter(user=self.request.user).order_by('start_datetime')
        
        # Filtres par date
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        event_type = self.request.query_params.get('event_type')
        project_id = self.request.query_params.get('project')
        
        if start_date:
            qs = qs.filter(start_datetime__date__gte=start_date)
        if end_date:
            qs = qs.filter(end_datetime__date__lte=end_date)
        if event_type:
            qs = qs.filter(event_type=event_type)
        if project_id:
            qs = qs.filter(project_id=project_id)
            
        return qs

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class ScheduleViewSet(viewsets.ModelViewSet):
    queryset = Schedule.objects.all()
    serializer_class = ScheduleSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Schedule.objects.filter(user=self.request.user, is_active=True).order_by('day_of_week', 'start_time')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class TimerViewSet(viewsets.ModelViewSet):
    queryset = Timer.objects.all()
    serializer_class = TimerSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Timer.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        # Arrêter le timer existant s'il y en a un
        existing_timer = Timer.objects.filter(user=self.request.user).first()
        if existing_timer:
            existing_timer.stop_and_save()
        
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def pause(self, request, pk=None):
        timer = self.get_object()
        timer.pause()
        return Response(TimerSerializer(timer).data)
    
    @action(detail=True, methods=['post'])
    def resume(self, request, pk=None):
        timer = self.get_object()
        timer.resume()
        return Response(TimerSerializer(timer).data)
    
    @action(detail=True, methods=['post'])
    def stop(self, request, pk=None):
        timer = self.get_object()
        time_entry = timer.stop_and_save()
        return Response({
            'message': 'Timer arrêté et temps enregistré',
            'time_entry': TimeEntrySerializer(time_entry).data
        })
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """Récupère le timer actif de l'utilisateur"""
        try:
            timer = Timer.objects.get(user=request.user)
            return Response(TimerSerializer(timer).data)
        except Timer.DoesNotExist:
            return Response({'active_timer': None})


class TimeEntryViewSet(viewsets.ModelViewSet):
    queryset = TimeEntry.objects.all()
    serializer_class = TimeEntrySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        qs = TimeEntry.objects.filter(user=self.request.user).select_related('task', 'task__project')
        
        # Filtres
        task_id = self.request.query_params.get('task')
        project_id = self.request.query_params.get('project')
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        
        if task_id:
            qs = qs.filter(task_id=task_id)
        if project_id:
            qs = qs.filter(task__project_id=project_id)
        if start_date:
            qs = qs.filter(started_at__date__gte=start_date)
        if end_date:
            qs = qs.filter(started_at__date__lte=end_date)
            
        return qs.order_by('-started_at')
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def reports(self, request):
        """Génère des rapports de temps"""
        from django.utils import timezone
        from datetime import timedelta
        from django.db.models import Sum, Count
        
        # Période par défaut: 7 derniers jours
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=7)
        
        # Paramètres optionnels
        if request.query_params.get('start_date'):
            start_date = timezone.datetime.strptime(request.query_params.get('start_date'), '%Y-%m-%d').date()
        if request.query_params.get('end_date'):
            end_date = timezone.datetime.strptime(request.query_params.get('end_date'), '%Y-%m-%d').date()
        
        entries = TimeEntry.objects.filter(
            user=request.user,
            started_at__date__range=[start_date, end_date]
        ).select_related('task', 'task__project')
        
        # Statistiques globales
        total_time = entries.aggregate(total=Sum('duration_minutes'))['total'] or 0
        total_entries = entries.count()
        
        # Par projet
        by_project = entries.values(
            'task__project__name', 'task__project__id'
        ).annotate(
            total_minutes=Sum('duration_minutes'),
            entry_count=Count('id')
        ).order_by('-total_minutes')
        
        # Par tâche
        by_task = entries.values(
            'task__title', 'task__id', 'task__project__name'
        ).annotate(
            total_minutes=Sum('duration_minutes'),
            entry_count=Count('id')
        ).order_by('-total_minutes')
        
        # Par jour
        by_day = {}
        for entry in entries:
            day = entry.started_at.date().isoformat()
            if day not in by_day:
                by_day[day] = 0
            by_day[day] += entry.duration_minutes
        
        return Response({
            'period': {
                'start_date': start_date,
                'end_date': end_date
            },
            'summary': {
                'total_minutes': total_time,
                'total_hours': round(total_time / 60, 2),
                'total_entries': total_entries,
                'avg_per_day': round(total_time / max(1, (end_date - start_date).days + 1), 1)
            },
            'by_project': list(by_project),
            'by_task': list(by_task),
            'by_day': by_day
        })
