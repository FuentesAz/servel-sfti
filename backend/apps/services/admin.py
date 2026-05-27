from django.contrib import admin
from django.db.models import Sum
from django.utils.html import format_html

from .models import (
    Tecnico,
    OrdenServicio,
    Piezas
)

admin.site.register(Tecnico)

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

        response = super().changelist_view(
            request,
            extra_context=extra_context,
        )

        try:

            queryset = response.context_data['cl'].queryset

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

            response.context_data['reportes'] = {
                'total_ordenes': total_ordenes,
                'pendientes': pendientes,
                'pagadas': pagadas,
                'total_ingresos': total_ingresos,
                'total_iva': total_iva,
                'total_comisiones': total_comisiones,
                'total_ganancia': total_ganancia,
                'total_piezas': total_piezas,
            }

        except Exception as e:
            raise e

        return response


