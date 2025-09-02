from django.contrib.auth.models import AbstractUser
from django.db import models
from django.contrib.auth.models import AbstractUser


class CustomUser(AbstractUser):
    user_type = models.CharField(max_length=20, default='normal')
    fraud_level = models.IntegerField(default=0)
    phone_number = models.CharField(max_length=15, blank=True, null=True, unique=True)
    nickname = models.CharField(max_length=100, blank=True, null=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    language = models.CharField(max_length=10, default='en')
    theme = models.CharField(max_length=10, default='light')

    def __str__(self):
        return self.username
