from django.conf import settings
from django.db import models


class Question(models.Model):
    level = models.IntegerField()
    text = models.CharField(max_length=255)
    option_a = models.CharField(max_length=255)
    option_b = models.CharField(max_length=255)
    option_c = models.CharField(max_length=255)
    option_d = models.CharField(max_length=255)
    correct_option = models.CharField(max_length=1)

    def __str__(self):
        return self.text


class QuizAttempt(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    level = models.IntegerField()
    score = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user} - Level {self.level}: {self.score}"
