from rest_framework import serializers
from .models import Question


class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ['id', 'level', 'text', 'option_a', 'option_b', 'option_c', 'option_d']
