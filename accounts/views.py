from django.shortcuts import render, redirect
from django.contrib.auth.forms import AuthenticationForm, UserCreationForm
from django.contrib.auth import login, logout, authenticate
from django.contrib import messages
from .forms import ResetPasswordForm, SignUpForm
from .models import CustomUser
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



def password_reset(request):
    form=ResetPasswordForm()
    if request.method=='POST':
        form= ResetPasswordForm(request.POST)
        if form.is_valid():
            if CustomUser.objects.filter(first_name=form.cleaned_data['first_name']).filter(last_name=form.cleaned_data['last_name']).filter(email=form.cleaned_data['email']).exists():
                user_email= form.cleaned_data['email']
                if form.cleaned_data['password1']==form.cleaned_data['password2']:
                    user = CustomUser.objects.get(email=form.cleaned_data['email'])
                    user.set_password(form.cleaned_data['password1'])
                    user.save()
                    messages.success(request, f'Password reset successfully. You can login now.')

                    return render(request, 'accounts/password_reset.html', {'form':form})
                else:
                    form=ResetPasswordForm()
                    messages.error(request, f'Your provided passwords do not match. Try again please.')
                    return render(request, 'accounts/password_reset.html', {'form':form})
            else:
                form=ResetPasswordForm()
                messages.error(request, f'There is no registered user with that information. Try again')
                return render(request, 'accounts/password_reset.html', {'form':form})
        else:
            print (form.errors)
            print('invalid form')
            messages.error(request, form.errors)
    else:
        form= ResetPasswordForm()
        context = {
            'form': form,
            'title': 'Password Reset',
            'btn_label': 'Password Reset'
        }
        return render(request, 'accounts/password_reset.html', context)
    return render(request, 'accounts/password_reset.html', {'form':form})

