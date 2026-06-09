from rest_framework import viewsets

from .models import (
    Tecnico,
    OrdenServicio,
    Piezas
)

from .serializers import (
    TecnicoSerializer,
    OrdenServicioSerializer,
    PiezasSerializer
)

class TecnicoViewSet(viewsets.ModelViewSet):
    queryset = Tecnico.objects.all()
    serializer_class = TecnicoSerializer

class OrdenServicioViewSet(viewsets.ModelViewSet):
    queryset = (
        OrdenServicio.objects
        .select_related('tecnico')
        .prefetch_related('piezas')
    )

    serializer_class = OrdenServicioSerializer

    filter_backend = [
        
    ]

class PiezasViewSet(viewsets.ModelViewSet):
    queryset = Piezas.objects.all()
    serializer_class = PiezasSerializer