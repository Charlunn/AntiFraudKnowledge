from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404

from .models import Achievement, UserAchievement
from .serializers import AchievementSerializer


class UserAchievementListView(generics.ListAPIView):
    serializer_class = AchievementSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Achievement.objects.filter(userachievement__user=self.request.user)


class GrantAchievementView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        achievement_id = request.data.get('achievement_id')
        achievement = get_object_or_404(Achievement, id=achievement_id)
        UserAchievement.objects.get_or_create(user=request.user, achievement=achievement)
        return Response({'message': 'Achievement granted'})
