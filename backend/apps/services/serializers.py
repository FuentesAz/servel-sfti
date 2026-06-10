from rest_framework import serializers

from .models import (
    Tecnico,
    OrdenServicio,
    Piezas,
    PagoTecnico
)


class TecnicoSerializer(serializers.ModelSerializer):

    class Meta:
        model = Tecnico
        fields = '__all__'


class PiezasSerializer(serializers.ModelSerializer):

    class Meta:
        model = Piezas
        fields = '__all__'


class OrdenServicioSerializer(serializers.ModelSerializer):

    piezas = PiezasSerializer(
        many=True,
        read_only=True
    )
    
    tecnico_nombre = serializers.CharField(
        source='tecnico.name',
        read_only=True
    )

    class Meta:
        model = OrdenServicio

        fields = [
            'numero_orden',
            'tecnico',
            'tecnico_nombre',
            'status',
            'costo_servicio',
            'facturado',
            'metodo_pago',
            'subtotal',
            'iva',
            'total',
            'total_piezas',
            'comision',
            'ganancia_taller',
            'fecha_creacion',
            'fecha_cierre',
            'pago_tecnico_id',
            'pago_tecnico',
            'piezas',
        ]
        
class PagoTecnicoSerializer(serializers.ModelSerializer):
    
    ordenes = OrdenServicioSerializer(
        many=True,
        read_only=True
    )
    
    class Meta:
        model = PagoTecnico
        fields = '__all__'