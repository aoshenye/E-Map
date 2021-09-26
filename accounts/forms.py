from django.contrib.auth.forms import UserCreationForm, UserModel, UsernameField
from django.contrib.auth.password_validation import validate_password
from django import forms
from django.forms.widgets import TextInput
from django.conf import settings

from .models import CustomUser

class SignUpForm(UserCreationForm):
    class Meta:
        model = CustomUser
        fields = ('first_name', 'last_name', "email")

class ResetPasswordForm(forms.Form):
    first_name= forms.CharField()
    first_name.label= "First Name"

    last_name= forms.CharField()
    last_name.label= "Last Name"
    
    email= forms.EmailField()
    email.label= "Email"
    email.help_text= "Please input the email you registered with."

    password1 = forms.CharField(widget=forms.PasswordInput(attrs=
        {'class': 'form-control',
         'placeholder': 'Password',
         'required': 'required'}, ), validators=[validate_password])
    password1.label= 'New Password'

    password2 = forms.CharField(widget=forms.PasswordInput(attrs=
        {'class': 'form-control',
         'placeholder': 'Confirm password',
         'required': 'required'}, ), validators=[validate_password])
    password2.label= 'Confirm New Password'

