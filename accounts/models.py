from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class UserSummary(User):
    class Meta:
        proxy = True
        verbose_name = 'User Summary'
        verbose_name_plural = 'User Summary'