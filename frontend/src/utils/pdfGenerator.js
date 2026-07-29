import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function generarReportePDF(reporteData) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'letter'
  });

  const {
    fechaInicio,
    fechaFin,
    tecnicoNombre,
    ordenes,
    subtotal,
    piezas,
    iva,
    total,
    comision
  } = reporteData;

  const formatDateStr = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatCurrency = (num) => {
    return `$${(num || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Header Left - Datos de la empresa
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('SERVEL COMPUTADORAS', 40, 45);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text('MIGUEL ANGEL SERVIN RAMIREZ', 40, 57);
  doc.text('RFC: SERM5010025K0', 40, 68);
  doc.text('AV 30 NORTE, MZA 49 LT 11 LOCAL C', 40, 79);
  doc.text('Col. PLAYA DEL CARMEN CENTRO, CP 77710', 40, 90);
  doc.text('Playa del Carmen, Quintana Roo, México', 40, 101);

  // Header Right - Datos del reporte
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('REPORTE DE SERVICIOS', 570, 45, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);

  const totalServicios = ordenes.length;
  const serviciosFacturados = ordenes.filter(o => o.facturado).length;

  doc.text(`Fecha de reporte: ${formatDateStr(fechaInicio)} al ${formatDateStr(fechaFin)}`, 570, 62, { align: 'right' });
  doc.text(`Técnico: ${tecnicoNombre || 'Todos'}`, 570, 74, { align: 'right' });
  doc.text(`Total servicios: ${totalServicios}`, 570, 86, { align: 'right' });
  doc.text(`Servicios facturados: ${serviciosFacturados}`, 570, 98, { align: 'right' });

  // Separator Line
  doc.setDrawColor(204, 204, 204);
  doc.setLineWidth(0.75);
  doc.line(40, 115, 570, 115);

  // Table Setup
  const tableHead = [[
    'No. Orden',
    'Facturado',
    'Fecha Entrada',
    'Importe Piezas',
    'Importe Servicio',
    'Comisión'
  ]];

  const tableBody = ordenes.map(o => [
    String(o.numero_orden),
    o.facturado ? 'Sí' : 'No',
    formatDateStr(o.fecha_creacion),
    formatCurrency(o.total_piezas),
    formatCurrency(o.costo_servicio),
    formatCurrency(o.comision)
  ]);

  autoTable(doc, {
    startY: 125,
    margin: { left: 40, right: 40 },
    head: tableHead,
    body: tableBody,
    theme: 'grid',
    headStyles: {
      fillColor: [26, 37, 44], // #1A252C
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
      halign: 'center',
      valign: 'middle'
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: [30, 41, 59]
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 70 },
      1: { halign: 'center', cellWidth: 70 },
      2: { halign: 'center', cellWidth: 92 },
      3: { halign: 'right', cellWidth: 100 },
      4: { halign: 'right', cellWidth: 100 },
      5: { halign: 'right', cellWidth: 98 }
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251] // #F9FAFB
    },
    tableLineWidth: 0,
    styles: {
      cellPadding: 6,
      lineColor: [229, 231, 235],
      lineWidth: 0.5
    }
  });

  // Totals Summary Box (Aligned Right)
  const finalY = doc.lastAutoTable.finalY + 15;
  const summaryX = 350;
  const valX = 570;

  doc.setFontSize(9.5);

  const drawSummaryLine = (label, valStr, yPos, isBold = false, isHighlighted = false) => {
    if (isHighlighted) {
      doc.setFillColor(243, 244, 246); // #F3F4F6
      doc.rect(summaryX - 10, yPos - 11, 230, 16, 'F');
    }

    doc.setFont('helvetica', isBold ? 'bold' : 'bold');
    doc.text(label, summaryX, yPos);
    doc.text(valStr, valX, yPos, { align: 'right' });

    // Underline
    doc.setDrawColor(229, 231, 235);
    doc.line(summaryX - 10, yPos + 4, 570, yPos + 4);
  };

  let currentY = finalY;
  drawSummaryLine('Subtotal:', formatCurrency(subtotal), currentY);
  currentY += 18;
  drawSummaryLine('Piezas:', formatCurrency(piezas), currentY);
  currentY += 18;
  drawSummaryLine('IVA (16%):', formatCurrency(iva), currentY);
  currentY += 18;
  drawSummaryLine('Total:', formatCurrency(total), currentY, true, true);
  currentY += 18;
  drawSummaryLine('Comisión:', formatCurrency(comision), currentY, true);

  // Save / Download PDF
  doc.save(`reporte_servicios_${new Date().toISOString().split('T')[0]}.pdf`);
}
