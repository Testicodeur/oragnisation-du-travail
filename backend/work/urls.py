from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProjectViewSet, TaskViewSet, DocViewSet, TimeEntryViewSet, ClientViewViewSet, CommentViewSet, AttachmentViewSet, SubTaskViewSet, EventViewSet, ScheduleViewSet, TimerViewSet
from .views_init import initialize_production_data

router = DefaultRouter()
router.register(r'projects', ProjectViewSet)
router.register(r'tasks', TaskViewSet)
router.register(r'docs', DocViewSet)
router.register(r'time-entries', TimeEntryViewSet)
router.register(r'timers', TimerViewSet)
router.register(r'client-views', ClientViewViewSet)
router.register(r'comments', CommentViewSet)
router.register(r'attachments', AttachmentViewSet)
router.register(r'subtasks', SubTaskViewSet)
router.register(r'events', EventViewSet)
router.register(r'schedules', ScheduleViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('init-production/', initialize_production_data, name='init_production'),
]
