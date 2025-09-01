from django.conf import settings
from django.db import models


class Achievement(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name


class UserAchievement(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    achievement = models.ForeignKey(Achievement, on_delete=models.CASCADE)
    achieved_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "achievement")

    def __str__(self):
        return f"{self.user} - {self.achievement}"
