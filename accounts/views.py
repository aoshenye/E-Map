from django.shortcuts import render, redirect
from django.contrib.auth.forms import AuthenticationForm, UserCreationForm
from django.contrib.auth import login, logout, authenticate
from .forms import SignUpForm
from django.contrib import messages
from werkzeug.security import generate_password_hash, check_password_hash


def login_view(request, *args, **kwargs):
    form = AuthenticationForm(request, data=request.POST or None)
    if form.is_valid():
        user_ = form.get_user()
        login(request, user_)
        return redirect('/')

    context = {
        'form': form,
        'title': 'Log In',
        'btn_label': 'Log In'
    }
    return render(request, 'accounts/auth.html', context)


def logout_view(request, *args, **kwargs):
    if request.method == 'POST':
        logout(request)
        return redirect('/login')
    context = {
        'form': None,
        'title': 'Log Out?',
        'btn_label': 'Log Out'
    }
    return render(request, 'accounts/auth.html', context)


def sign_up(request, *args, **kwargs):
    form = SignUpForm(request.POST or None)
    if form.is_valid():
        user = form.save(commit=True)
        user.set_password(form.cleaned_data.get('password1'))
        messages.add_message(request, messages.SUCCESS, 'Account created!')
        return redirect('/')

    if form.errors:
        messages.add_message(request, messages.ERROR, form.errors)
        
    context = {
        'form': form,
        'title': 'Sign Up',
        'btn_label': 'Submit'
    }
    return render(request, 'accounts/sign_up.html', context)
