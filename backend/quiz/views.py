from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_list_or_404

from .models import Question, QuizAttempt
from .serializers import QuestionSerializer


class QuestionListView(generics.ListAPIView):
    serializer_class = QuestionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        level = self.request.query_params.get('level')
        queryset = Question.objects.all()
        if level:
            queryset = queryset.filter(level=level)
        return queryset


class SubmitQuizView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        answers = request.data.get('answers', {})
        score = 0
        for q_id, choice in answers.items():
            try:
                question = Question.objects.get(id=q_id)
            except Question.DoesNotExist:
                continue
            if question.correct_option.lower() == str(choice).lower():
                score += 1
        level = request.data.get('level', 1)
        QuizAttempt.objects.create(user=request.user, level=level, score=score)
        return Response({'score': score})
