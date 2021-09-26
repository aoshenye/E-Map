from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL

class Note(models.Model):
    user_id = models.ForeignKey(User, on_delete=models.CASCADE)
    data = models.TextField(max_length=10000)
    date = models.DateField(auto_now=True)

