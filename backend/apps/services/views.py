from django.shortcuts import render
from django.db.models import Sum
from django.utils import timezone

from .pdf_service import generar_reporte_pdf

from .models import OrdenServicio, PagoTecnico
from .forms import CierrePagosForm


def pagos_tecnicos(request):

    form = CierrePagosForm(
        request.POST or request.GET or None
    )

    ordenes = OrdenServicio.objects.none()

    reporte = None

    if form.is_valid():

        fecha_inicio = form.cleaned_data[
            'fecha_inicio'
        ]

        fecha_fin = form.cleaned_data[
            'fecha_fin'
        ]

        tecnicos = form.cleaned_data[
            'tecnicos'
        ]

        ordenes = OrdenServicio.objects.filter(
            status='pending',
            fecha_creacion__date__range=[
                fecha_inicio,
                fecha_fin
            ]
        )

        if tecnicos:

            ordenes = ordenes.filter(
                tecnico__in=tecnicos
            )

        reporte = {

            'total_ordenes': ordenes.count(),

            'ingreso_total': ordenes.aggregate(
                total=Sum('total')
            )['total'] or 0,

            'iva_total': ordenes.aggregate(
                total=Sum('iva')
            )['total'] or 0,

            'comision_total': ordenes.aggregate(
                total=Sum('comision')
            )['total'] or 0,

            'total_piezas': ordenes.aggregate(
                total=Sum('total_piezas')
            )['total'] or 0,
        }

        # =========================
        # PROCESAR PAGO + PDF
        # =========================

        if 'procesar' in request.POST:

            ordenes_ids = request.POST.getlist(
                'ordenes_ids'
            )

            ordenes = OrdenServicio.objects.filter(
                id__in=ordenes_ids
            )
            
            pago = PagoTecnico.objects.create(
                
                total_ordenes = ordenes.count(),
                
                ingreso_total = ordenes.aggregate(
                    total=Sum('total')
                )['total'] or 0,
                
                total_comision = ordenes.aggregate(
                    total=Sum('comision')
                )['total'] or 0,
                
                total_iva = ordenes.aggregate(
                    total=Sum('iva')
                )['total'] or 0,
                
                total_piezas = ordenes.aggregate(
                    total=Sum('total_piezas')
                )['total'] or 0
            )

            ordenes.update(
                status='paid',
                fecha_cierre=timezone.now(),
                pago_tecnico = pago
            )

            return generar_reporte_pdf(
                ordenes,
                fecha_inicio,
                fecha_fin,
                tecnicos
            )

    return render(
        request,
        'admin/cierre_pagos.html',
        {
            'form': form,
            'ordenes': ordenes,
            'reporte': reporte,
        }
    )