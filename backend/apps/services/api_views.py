from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum
from django.utils import timezone

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
    serializer_class = PagoTecnicoSerializer
    pagination_class = None
    
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
    pagination_class = None

class OrdenServicioViewSet(viewsets.ModelViewSet):
    queryset = (
        OrdenServicio.objects
        .select_related('tecnico')
        .prefetch_related('piezas')
        .order_by('-fecha_creacion', '-id')
    )

    serializer_class = OrdenServicioSerializer
    pagination_class = None

    @action(detail=False, methods=['post'], url_path='procesar_cierre')
    def procesar_cierre(self, request):
        ordenes_ids = request.data.get('ordenes_ids', [])
        if not ordenes_ids:
            return Response({'error': 'No se proporcionaron IDs de órdenes'}, status=status.HTTP_400_BAD_REQUEST)

        queryset = OrdenServicio.objects.filter(id__in=ordenes_ids)
        if not queryset.exists():
            return Response({'error': 'No se encontraron órdenes válidas'}, status=status.HTTP_404_NOT_FOUND)

        pago = PagoTecnico.objects.create(
            total_ordenes=queryset.count(),
            ingreso_total=queryset.aggregate(total=Sum('total'))['total'] or 0,
            total_comision=queryset.aggregate(total=Sum('comision'))['total'] or 0,
            total_iva=queryset.aggregate(total=Sum('iva'))['total'] or 0,
            total_piezas=queryset.aggregate(total=Sum('total_piezas'))['total'] or 0,
        )

        queryset.update(
            status='paid',
            fecha_cierre=timezone.now(),
            pago_tecnico=pago
        )

        serializer = PagoTecnicoSerializer(pago)
        return Response(serializer.data, status=status.HTTP_200_OK)

class PiezasViewSet(viewsets.ModelViewSet):
    queryset = Piezas.objects.all()
    serializer_class = PiezasSerializer
    pagination_class = None