from io import BytesIO
from django.http import HttpResponse
from reportlab.platypus import (
    SimpleDocTemplate,
    Spacer,
    Paragraph,
    Table,
    TableStyle,
)
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.pagesizes import letter
from reportlab.platypus.flowables import HRFlowable
from django.db.models import Sum

def generar_reporte_pdf(ordenes, fecha_inicio, fecha_fin, tecnicos):
    buffer = BytesIO()

    # Configuración del documento (Márgenes de 40 puntos (~1.4 cm) para aprovechar el espacio)
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40,
    )

    styles = getSampleStyleSheet()
    
    # Estilos personalizados basados en los existentes
    style_left = ParagraphStyle(
        'HeaderLeft',
        parent=styles['BodyText'],
        fontSize=9,
        leading=12
    )
    style_right = ParagraphStyle(
        'HeaderRight',
        parent=styles['BodyText'],
        alignment=2, # Alineado a la derecha
        fontSize=9,
        leading=12
    )
    
    elements = []

    # =========================================================================
    # ENCABEZADO ESTRUCTURADO (Dos columnas)
    # =========================================================================
    
    # Columna Izquierda: Datos de la empresa
    datos_empresa = Paragraph(
        """
        <b>SERVEL COMPUTADORAS</b><br/>
        MIGUEL ANGEL SERVIN RAMIREZ<br/>
        RFC: SERM5010025K0<br/>
        AV 30 NORTE, MZA 49 LT 11 LOCAL C<br/>
        Col. PLAYA DEL CARMEN CENTRO, CP 77710<br/>
        Playa del Carmen, Quintana Roo, México
        """,
        style_left
    )

    # Procesar filtros de técnicos
    nombres_tecnicos = ", ".join([t.name for t in tecnicos]) if tecnicos else "Todos"
    total_ordenes = ordenes.count()
    # Contar cuántas de estas órdenes están explícitamente facturadas
    servicios_facturados = ordenes.filter(facturado=True).count()

    # Columna Derecha: Datos del Reporte
    datos_reporte = Paragraph(
        f"""
        <font size=14><b>REPORTE DE SERVICIOS</b></font><br/><br/>
        <b>Fecha de reporte:</b> {fecha_inicio.strftime('%d/%m/%Y')} al {fecha_fin.strftime('%d/%m/%Y')}<br/>
        <b>Técnico:</b> {nombres_tecnicos}<br/>
        <b>Total servicios:</b> {total_ordenes}<br/>
        <b>Servicios facturados:</b> {servicios_facturados}
        """,
        style_right
    )

    # Tabla contenedora del encabezado (Ancho total disponible es de 532 puntos)
    header_table = Table([[datos_empresa, datos_reporte]], colWidths=[280, 252])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
    ]))
    
    elements.append(header_table)
    elements.append(Spacer(1, 10))
    elements.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#CCCCCC"), spaceBefore=5, spaceAfter=15))

    # =========================================================================
    # TABLA DE ÓRDENES
    # =========================================================================
    
    # Encabezados de la tabla de contenido
    data = [[
        'No. Orden',
        'Facturado',
        'Fecha Entrada',
        'Importe Piezas',
        'Importe Servicio',
        'Comisión'
    ]]

    # Llenado de filas de la tabla
    for orden in ordenes:
        data.append([
            str(orden.numero_orden),
            "Sí" if orden.facturado else "No",
            orden.fecha_creacion.strftime('%d/%m/%Y'),
            f"${orden.total_piezas:,.2f}",
            f"${orden.costo_servicio:,.2f}",
            f"${orden.comision:,.2f}",
        ])

    # El ancho total es 532, dividimos proporcionalmente las 6 columnas
    table = Table(data, colWidths=[70, 70, 92, 100, 100, 100], repeatRows=1)
    
    table.setStyle(TableStyle([
        # Encabezado (Azul marino oscuro para un look más moderno y profesional)
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#1A252C")),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
        ('TOPPADDING', (0, 0), (-1, 0), 8),
        
        # Cuerpo de la tabla
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 9),
        ('ALIGN', (0, 1), (2, -1), 'CENTER'),     # Orden, Facturado y Fecha centrados
        ('ALIGN', (3, 1), (-1, -1), 'RIGHT'),     # Precios alineados a la derecha
        ('BOTTOMPADDING', (0, 1), (-1, -1), 6),
        ('TOPPADDING', (0, 1), (-1, -1), 6),
        
        # Filas con colores alternados (Zebra striping) para facilitar lectura
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor("#F9FAFB")]),
        ('LINEBELOW', (0, 1), (-1, -1), 0.5, colors.HexColor("#E5E7EB")),
    ]))

    elements.append(table)
    elements.append(Spacer(1, 20))

    # =========================================================================
    # RESUMEN / TOTALES (Alineado a la derecha)
    # =========================================================================
    
    # Agregaciones de Base de Datos
    subtotal = ordenes.aggregate(total=Sum('subtotal'))['total'] or 0
    piezas = ordenes.aggregate(total=Sum('total_piezas'))['total'] or 0
    iva = ordenes.aggregate(total=Sum('iva'))['total'] or 0
    total = ordenes.aggregate(total=Sum('total'))['total'] or 0
    comision = ordenes.aggregate(total=Sum('comision'))['total'] or 0

    resumen_data = [
        ["Subtotal:", f"${subtotal:,.2f}"],
        ["Piezas:", f"${piezas:,.2f}"],
        ["IVA (16%):", f"${iva:,.2f}"],
        ["Total:", f"${total:,.2f}"],
        ["Comisión:", f"${comision:,.2f}"],
    ]

    # Tabla interna de totales
    resumen_table = Table(resumen_data, colWidths=[120, 120])
    resumen_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('ALIGN', (0, 0), (0, -1), 'LEFT'),
        ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('LINEBELOW', (0, 0), (-1, -1), 0.5, colors.HexColor("#E5E7EB")),
        ('BACKGROUND', (0, -2), (-1, -2), colors.HexColor("#F3F4F6")), # Destacar fila 'Total'
    ]))

    # Para empujar la tabla de totales a la derecha, creamos una tabla contenedora invisible externa
    # Columna izquierda vacía (292 puntos) y columna derecha con los totales (240 puntos)
    totales_contenedor = Table([["", resumen_table]], colWidths=[292, 240])
    totales_contenedor.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
    ]))
    
    elements.append(totales_contenedor)

    doc.build(elements)
    pdf = buffer.getvalue()
    buffer.close()

    # Creamos la respuesta pasando el PDF de inmediato
    response = HttpResponse(pdf, content_type='application/pdf')
    
    # Forzamos el nombre limpiando cualquier espacio residual
    nombre_archivo = "reporte_servicios.pdf"
    response['Content-Disposition'] = f'attachment; filename="{nombre_archivo}"'.strip()
    response['Content-Length'] = str(len(pdf))
    
    # Cabecera de seguridad extra para IE/Edge/Chrome que evita que oculten el nombre
    response['X-Content-Type-Options'] = 'nosniff'

    return response