from django.shortcuts import render, redirect
from django.contrib import messages


def home(request, *args, **kwargs):
    if request.user.is_authenticated:
        return render(request, 'emap/home.html', {})
    messages.add_message(request, messages.INFO, 'Please login to access this page')
    return redirect('/login')


def aboutus(request, *args, **kwargs):
    return render(request, 'emap/aboutus.html', {})
