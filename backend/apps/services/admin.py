from django.contrib import admin
from django.db.models import Sum
from django.utils import timezone

#------ IMPORTACIÓN DE LOS MODELOS ---------------------------
from .models import (
    Tecnico,
    OrdenServicio,
    Piezas,
    PagoTecnico
)
#-------------------------------------------------------------
#
#
#------ REGISTRO DE LOS MODELOS ------------------------------
admin.site.register(Tecnico)
admin.site.register(PagoTecnico)
#-------------------------------------------------------------
#
# 
class PartesInline(admin.TabularInline):
    model = Piezas
    extra = 1

    def has_add_permission(self, request, obj=None):

        if obj and obj.status == 'paid' and not request.user.is_superuser:
            return False

        return super().has_add_permission(request, obj)

    def has_delete_permission(self, request, obj=None):

        if obj and obj.status == 'paid' and not request.user.is_superuser:
            return False

        return super().has_delete_permission(request, obj)

    def get_readonly_fields(self, request, obj=None):

        if obj and obj.status == 'paid' and not request.user.is_superuser:

            return (
                'nombre',
                'costo',
                'metodo_pago',
                'comentarios',
                'fecha_creacion',
            )

        return super().get_readonly_fields(request, obj)


@admin.register(OrdenServicio)
class OrdenServicioAdmin(admin.ModelAdmin):

    inlines = [PartesInline]

    list_display = (
        'numero_orden',
        'tecnico',
        'status',
        'total',
        'facturado',
        'fecha_creacion',
        'fecha_cierre',
    )
    
    list_filter = (
        'status',
        'facturado',
        'tecnico',
        'fecha_creacion',
    )

    search_fields = (
        'numero_orden',
        'tecnico__name',
    )

    ordering = (
        '-fecha_creacion',
    )

    readonly_fields = (
        'subtotal',
        'iva',
        'total',
        'comision',
        'ganancia_taller',
        'fecha_creacion',
        'fecha_cierre',
    )

    actions = ['marcar_como_pagadas']

    @admin.action(description='Marcar órdenes como pagadas')
    def marcar_como_pagadas(
        self,
        request,
        queryset
    ):

        queryset.update(
            status='paid',
            fecha_cierre=timezone.now()
        )
    
    def get_readonly_fields(self, request, obj=None):

        readonly = list(self.readonly_fields)

        if obj and obj.status == 'paid' and not request.user.is_superuser:

            readonly.extend([
                'numero_orden',
                'tecnico',
                'status',
                'costo_servicio',
                'facturado',
                'metodo_pago',
            ])

        return readonly

    def changelist_view(self, request, extra_context=None):

        extra_context = extra_context or {}

        queryset = self.get_queryset(request)

        total_ordenes = queryset.count()

        pendientes = queryset.filter(
            status='pending'
        ).count()

        pagadas = queryset.filter(
            status='paid'
        ).count()

        total_ingresos = queryset.aggregate(
            total=Sum('total')
        )['total'] or 0

        total_iva = queryset.aggregate(
            total=Sum('iva')
        )['total'] or 0

        total_comisiones = queryset.aggregate(
            total=Sum('comision')
        )['total'] or 0

        total_ganancia = queryset.aggregate(
            total=Sum('ganancia_taller')
        )['total'] or 0

        total_piezas = queryset.aggregate(
            total=Sum('total_piezas')
        )['total'] or 0

        extra_context['reportes'] = {
            'total_ordenes': total_ordenes,
            'pendientes': pendientes,
            'pagadas': pagadas,
            'total_ingresos': total_ingresos,
            'total_iva': total_iva,
            'total_comisiones': total_comisiones,
            'total_ganancia': total_ganancia,
            'total_piezas': total_piezas,
        }

        return super().changelist_view(
            request,
            extra_context=extra_context
        )


