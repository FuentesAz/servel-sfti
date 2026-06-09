from django.urls import path

# Importamos ambas vistas desde tu archivo views.py
from .views import pagos_tecnicos

urlpatterns = [

    # Vista para ver el reporte en el navegador (HTML)
    path('pagos-tecnicos/',pagos_tecnicos,name='pagos_tecnicos'),

]
