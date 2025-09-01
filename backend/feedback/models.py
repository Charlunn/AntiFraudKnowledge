from django.conf import settings
from django.db import models


class Feedback(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    message = models.TextField()
    image = models.ImageField(upload_to='feedback/', blank=True, null=True)
    contact = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Feedback from {self.user}"
