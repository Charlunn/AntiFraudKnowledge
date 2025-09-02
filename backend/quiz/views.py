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
        queryset = Question.objects.all()
        level_str = self.request.query_params.get('level')

        if level_str:
            # Map string levels to integer values used in the database
            level_map = {'easy': 1, 'medium': 2, 'hard': 3}
            level_int = level_map.get(level_str.lower())

            # If the level string is valid, filter the queryset
            if level_int is not None:
                queryset = queryset.filter(level=level_int)

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
