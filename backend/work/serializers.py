from rest_framework import serializers
from users.models import User
from .models import Project, Task, SubTask, Comment, Attachment, Doc, TimeEntry, ClientView, Event, Schedule, Timer

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "personal_identifier", "first_name", "last_name", "email"]

class SubTaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubTask
        fields = ["id", "title", "is_done", "task"]
        extra_kwargs = {
            "task": {"write_only": True}
        }

class AttachmentSerializer(serializers.ModelSerializer):
    task = serializers.PrimaryKeyRelatedField(queryset=Task.objects.all(), write_only=True)
    class Meta:
        model = Attachment
        fields = ["id", "file", "uploaded_at", "task"]

class CommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    task = serializers.PrimaryKeyRelatedField(queryset=Task.objects.all(), write_only=True)

    class Meta:
        model = Comment
        fields = ["id", "content", "created_at", "author", "task"]

class TaskSerializer(serializers.ModelSerializer):
    assignee = UserSerializer(read_only=True)
    subtasks = SubTaskSerializer(many=True, read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    attachments = AttachmentSerializer(many=True, read_only=True)

    class Meta:
        model = Task
        fields = [
            "id", "project", "title", "description", "assignee", "status", "priority",
            "due_date", "tags", "created_at", "updated_at", "subtasks", "comments", "attachments"
        ]

class ProjectSerializer(serializers.ModelSerializer):
    tasks = TaskSerializer(many=True, read_only=True)

    class Meta:
        model = Project
        fields = ["id", "name", "description", "client", "deadline", "status", "category", "created_at", "updated_at", "tasks"]

class DocSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)

    class Meta:
        model = Doc
        fields = ["id", "title", "content", "category", "author", "created_at", "updated_at"]

class TimeEntrySerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = TimeEntry
        fields = ["id", "task", "user", "started_at", "ended_at", "duration_minutes"]

class ClientViewSerializer(serializers.ModelSerializer):
    project = ProjectSerializer(read_only=True)

    class Meta:
        model = ClientView
        fields = ["id", "project", "token", "is_active", "created_at"]

class EventSerializer(serializers.ModelSerializer):
    duration_minutes = serializers.ReadOnlyField()
    project_name = serializers.CharField(source='project.name', read_only=True)
    task_title = serializers.CharField(source='task.title', read_only=True)
    
    class Meta:
        model = Event
        fields = [
            'id', 'title', 'description', 'event_type', 'start_datetime', 
            'end_datetime', 'all_day', 'location', 'user', 'project', 'task',
            'color', 'is_recurring', 'recurrence_rule', 'created_at', 'updated_at',
            'duration_minutes', 'project_name', 'task_title'
        ]
        read_only_fields = ['user', 'created_at', 'updated_at']

class ScheduleSerializer(serializers.ModelSerializer):
    day_of_week_display = serializers.CharField(source='get_day_of_week_display', read_only=True)
    
    class Meta:
        model = Schedule
        fields = [
            'id', 'user', 'name', 'day_of_week', 'day_of_week_display',
            'start_time', 'end_time', 'title', 'description', 'event_type',
            'color', 'is_active', 'created_at'
        ]
        read_only_fields = ['user', 'created_at']


class TimeEntrySerializer(serializers.ModelSerializer):
    task_title = serializers.CharField(source='task.title', read_only=True)
    project_name = serializers.CharField(source='task.project.name', read_only=True)
    user_name = serializers.CharField(source='user.personal_identifier', read_only=True)
    
    class Meta:
        model = TimeEntry
        fields = [
            'id', 'task', 'task_title', 'project_name', 'user', 'user_name',
            'started_at', 'ended_at', 'duration_minutes', 'description', 
            'created_at', 'is_running'
        ]
        read_only_fields = ['user', 'created_at', 'is_running']


class TimerSerializer(serializers.ModelSerializer):
    task_title = serializers.CharField(source='task.title', read_only=True)
    project_name = serializers.CharField(source='task.project.name', read_only=True)
    elapsed_minutes = serializers.ReadOnlyField()
    
    class Meta:
        model = Timer
        fields = [
            'id', 'task', 'task_title', 'project_name', 'started_at',
            'paused_duration', 'is_paused', 'paused_at', 'elapsed_minutes'
        ]
        read_only_fields = ['user', 'started_at', 'elapsed_minutes']
