from django.db import models
from django.conf import settings

class Project(models.Model):
    STATUS_CHOICES = [
        ("planned", "Planned"),
        ("active", "Active"),
        ("paused", "Paused"),
        ("done", "Done"),
    ]
    TYPE_CHOICES = [
        ("dev", "Development"),
        ("design", "Design"),
        ("integration", "Integration"),
        ("maintenance", "Maintenance"),
    ]

    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    client = models.CharField(max_length=200, blank=True)
    deadline = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="active")
    category = models.CharField(max_length=20, choices=TYPE_CHOICES, default="dev")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return self.name

class Task(models.Model):
    PRIORITY_CHOICES = [("low", "Low"), ("medium", "Medium"), ("high", "High"), ("urgent", "Urgent")]
    STATUS_CHOICES = [("todo", "To Do"), ("doing", "Doing"), ("done", "Done")]

    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="tasks")
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    assignee = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="todo")
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default="medium")
    due_date = models.DateField(null=True, blank=True)
    tags = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return self.title

class SubTask(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name="subtasks")
    title = models.CharField(max_length=200)
    is_done = models.BooleanField(default=False)

class Comment(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name="comments")
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

class Attachment(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name="attachments")
    file = models.FileField(upload_to="attachments/")
    uploaded_at = models.DateTimeField(auto_now_add=True)

class Doc(models.Model):
    CATEGORY_CHOICES = [("ideas", "Ideas"), ("tech", "Technical"), ("process", "Process"), ("templates", "Templates"), ("snippets", "Snippets")]
    title = models.CharField(max_length=255)
    content = models.TextField()
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default="tech")
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class TimeEntry(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name="time_entries")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    started_at = models.DateTimeField()
    ended_at = models.DateTimeField(null=True, blank=True)
    duration_minutes = models.PositiveIntegerField(default=0)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-started_at']
    
    def __str__(self):
        return f"{self.task.title} - {self.duration_minutes}min"
    
    @property
    def is_running(self):
        return self.ended_at is None
    
    def stop(self):
        if self.ended_at is None:
            from django.utils import timezone
            self.ended_at = timezone.now()
            delta = self.ended_at - self.started_at
            self.duration_minutes = int(delta.total_seconds() / 60)
            self.save()


class Timer(models.Model):
    """Timer actif pour une tâche - un seul par utilisateur"""
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='active_timer')
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='active_timers')
    started_at = models.DateTimeField(auto_now_add=True)
    paused_duration = models.PositiveIntegerField(default=0)  # Minutes en pause
    is_paused = models.BooleanField(default=False)
    paused_at = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"Timer: {self.task.title} ({self.user.personal_identifier})"
    
    @property
    def elapsed_minutes(self):
        from django.utils import timezone
        if self.is_paused:
            active_time = self.paused_at - self.started_at
        else:
            active_time = timezone.now() - self.started_at
        
        total_seconds = active_time.total_seconds() - (self.paused_duration * 60)
        return max(0, int(total_seconds / 60))
    
    def pause(self):
        if not self.is_paused:
            from django.utils import timezone
            self.is_paused = True
            self.paused_at = timezone.now()
            self.save()
    
    def resume(self):
        if self.is_paused:
            from django.utils import timezone
            pause_duration = timezone.now() - self.paused_at
            self.paused_duration += int(pause_duration.total_seconds() / 60)
            self.is_paused = False
            self.paused_at = None
            self.save()
    
    def stop_and_save(self):
        """Arrête le timer et crée une TimeEntry"""
        from django.utils import timezone
        if self.is_paused:
            self.resume()  # Resume pour calculer le temps total
        
        time_entry = TimeEntry.objects.create(
            task=self.task,
            user=self.user,
            started_at=self.started_at,
            ended_at=timezone.now(),
            duration_minutes=self.elapsed_minutes
        )
        self.delete()
        return time_entry

class ClientView(models.Model):
    project = models.OneToOneField(Project, on_delete=models.CASCADE, related_name="client_view")
    token = models.CharField(max_length=64, unique=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

class Event(models.Model):
    EVENT_TYPES = [
        ('work', 'Travail'),
        ('meeting', 'Réunion'),
        ('break', 'Pause'),
        ('personal', 'Personnel'),
        ('focus', 'Focus Time'),
        ('other', 'Autre'),
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    event_type = models.CharField(max_length=20, choices=EVENT_TYPES, default='work')
    start_datetime = models.DateTimeField()
    end_datetime = models.DateTimeField()
    all_day = models.BooleanField(default=False)
    location = models.CharField(max_length=200, blank=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='events')
    project = models.ForeignKey(Project, on_delete=models.SET_NULL, null=True, blank=True, related_name='events')
    task = models.ForeignKey(Task, on_delete=models.SET_NULL, null=True, blank=True, related_name='events')
    color = models.CharField(max_length=7, default='#3B82F6')  # Hex color
    is_recurring = models.BooleanField(default=False)
    recurrence_rule = models.TextField(blank=True)  # RRULE format
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['start_datetime']
    
    def __str__(self):
        return f"{self.title} - {self.start_datetime.strftime('%Y-%m-%d %H:%M')}"
    
    @property
    def duration_minutes(self):
        if self.start_datetime and self.end_datetime:
            delta = self.end_datetime - self.start_datetime
            return int(delta.total_seconds() / 60)
        return 0

class Schedule(models.Model):
    """Template d'emploi du temps hebdomadaire"""
    DAYS_OF_WEEK = [
        (0, 'Lundi'),
        (1, 'Mardi'),
        (2, 'Mercredi'),
        (3, 'Jeudi'),
        (4, 'Vendredi'),
        (5, 'Samedi'),
        (6, 'Dimanche'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='schedules')
    name = models.CharField(max_length=100)
    day_of_week = models.IntegerField(choices=DAYS_OF_WEEK)
    start_time = models.TimeField()
    end_time = models.TimeField()
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    event_type = models.CharField(max_length=20, choices=Event.EVENT_TYPES, default='work')
    color = models.CharField(max_length=7, default='#3B82F6')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['day_of_week', 'start_time']
    
    def __str__(self):
        return f"{self.get_day_of_week_display()} {self.start_time}-{self.end_time}: {self.title}"
