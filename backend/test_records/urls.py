from django.urls import path
from . import views

app_name = 'test_records'

urlpatterns = [
    path('create/', views.save_test_record, name='create'),
    path('list/', views.TestRecordListView.as_view(), name='list'),
    path('stats/', views.test_record_stats, name='stats'),
    path('<int:pk>/', views.TestRecordDetailView.as_view(), name='detail'),
]