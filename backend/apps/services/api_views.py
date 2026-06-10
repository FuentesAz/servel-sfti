from rest_framework import viewsets

from .models import (
    Tecnico,
    OrdenServicio,
    Piezas,
    PagoTecnico
)

from .serializers import (
    TecnicoSerializer,
    OrdenServicioSerializer,
    PiezasSerializer,
    PagoTecnicoSerializer
)

class PagoTecnicoViewSet(viewsets.ModelViewSet):
    queryset = (
        PagoTecnico.objects
        .prefetch_related('ordenes')
        .order_by('-fecha_pago')
    )
    
    serializer_class=PagoTecnicoSerializer
    
    ordering_fields = [
        'fecha_pago',
        'total_ordenes',
        'ingreso_total',
        'total_comision',
        'total_iva',
        'total_piezas',
    ]

    ordering = ['-fecha_pago']

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