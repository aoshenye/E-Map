# Generated by Django 3.2.5 on 2021-07-25 14:26

import django.contrib.auth.models
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('auth', '0012_alter_user_first_name_max_length'),
        ('emap', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='UserSummary',
            fields=[
            ],
            options={
                'verbose_name': 'Sale Summary',
                'verbose_name_plural': 'Sales Summary',
                'proxy': True,
                'indexes': [],
                'constraints': [],
            },
            bases=('auth.user',),
            managers=[
                ('objects', django.contrib.auth.models.UserManager()),
            ],
        ),
    ]
