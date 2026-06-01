from django import forms

from .models import Tecnico

class CierrePagosForm(forms.Form):

    fecha_inicio = forms.DateField(
        widget=forms.DateInput(attrs={
            'type': 'date'
        })
    )

    fecha_fin = forms.DateField(
        widget=forms.DateInput(attrs={
            'type': 'date'
        })
    )

    tecnicos = forms.ModelMultipleChoiceField(
        queryset=Tecnico.objects.all(),
        required=False,
        widget=forms.SelectMultiple(attrs={
            'size': 10
        })
    )