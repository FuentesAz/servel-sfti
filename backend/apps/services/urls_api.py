from django.urls import include, path

from rest_framework.routers import DefaultRouter

from .api_views import (
    TecnicoViewSet,
    OrdenServicioViewSet,
    PiezasViewSet
)

routers = DefaultRouter()

routers.register(
    'tecnicos',
    TecnicoViewSet
)

routers.register(
    'ordenes',
    OrdenServicioViewSet
)

routers.register(
    'piezas',
    PiezasViewSet
)

urlpatterns = [
    path('', include(routers.urls))
]