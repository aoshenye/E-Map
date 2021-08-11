import requests
from django.shortcuts import render, redirect
from django.contrib import messages
from rest_framework.decorators import api_view
from rest_framework.response import Response


def home(request, *args, **kwargs):
    if request.user.is_authenticated:
        return render(request, 'emap/home.html', {})
    messages.add_message(request, messages.INFO, 'Please login to access this page')
    return redirect('/login')


def aboutus(request, *args, **kwargs):
    return render(request, 'emap/aboutus.html', {})

@api_view(['GET'])
def get_chargers(request, *args, **kwargs):
    if request.method == 'GET':
        r = requests.get('https://chargepoints.dft.gov.uk/api/retrieve/registry/?format=json', params=request.GET)
    return Response(r.json())


@api_view(['GET'])
def get_connector_types(request, *args, **kwargs):
    if request.method == 'GET':
        r = requests.get('https://chargepoints.dft.gov.uk/api/retrieve/type?format=json', params=request.GET)
    return Response(r.json())