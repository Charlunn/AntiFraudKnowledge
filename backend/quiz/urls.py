from django.urls import path
from .views import QuestionListView, SubmitQuizView

app_name = 'quiz'

urlpatterns = [
    path('questions/', QuestionListView.as_view(), name='questions'),
    path('submit/', SubmitQuizView.as_view(), name='submit'),
]
