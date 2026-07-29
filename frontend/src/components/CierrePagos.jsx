import React, { useState, useMemo } from 'react';
import { 
  Receipt, 
  Calendar, 
  Users, 
  CheckCircle2, 
  Printer, 
  Download,
  FileText
} from 'lucide-react';
import { generarReportePDF } from '../utils/pdfGenerator';

export default function CierrePagos({ ordenes, tecnicos, pagosHistorial, onProcesarCierre }) {
  const [fechaInicio, setFechaInicio] = useState('2026-06-26');
  const [fechaFin, setFechaFin] = useState('2026-07-25');
  const [tecnicoId, setTecnicoId] = useState('all');
  const [reporteGenerado, setReporteGenerado] = useState(null);

  // Filter pending orders matching criteria
  const ordenesElegibles = useMemo(() => {
    return ordenes.filter(o => {
      if (o.status !== 'pending') return false;

      if (tecnicoId !== 'all' && o.tecnico !== parseInt(tecnicoId)) {
        return false;
      }

      if (o.fecha_creacion) {
        const f = o.fecha_creacion.split('T')[0];
        if (f < fechaInicio || f > fechaFin) return false;
      }

      return true;
    });
  }, [ordenes, fechaInicio, fechaFin, tecnicoId]);

  // Compute calculated metrics for selected pending orders matching Django calculations
  const summaryReporte = useMemo(() => {
    const totalOrdenes = ordenesElegibles.length;
    const subtotal = ordenesElegibles.reduce((sum, o) => sum + (parseFloat(o.subtotal) || 0), 0);
    const piezas = ordenesElegibles.reduce((sum, o) => sum + (parseFloat(o.total_piezas) || 0), 0);
    const iva = ordenesElegibles.reduce((sum, o) => sum + (parseFloat(o.iva) || 0), 0);
    const total = ordenesElegibles.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);
    const comision = ordenesElegibles.reduce((sum, o) => sum + (parseFloat(o.comision) || 0), 0);
    const serviciosFacturados = ordenesElegibles.filter(o => o.facturado).length;

    return {
      totalOrdenes,
      subtotal,
      piezas,
      iva,
      total,
      comision,
      serviciosFacturados
    };
  }, [ordenesElegibles]);

  const handleProcesarYDescargarPDF = () => {
    if (ordenesElegibles.length === 0) {
      alert('No hay órdenes pendientes en el rango de fechas seleccionado.');
      return;
    }

    const techName = tecnicoId === 'all' ? 'Todos' : tecnicos.find(t => t.id === parseInt(tecnicoId))?.name;

    const reporteObj = {
      fechaInicio,
      fechaFin,
      tecnicoNombre: techName,
      ordenes: ordenesElegibles,
      ...summaryReporte
    };

    const ids = ordenesElegibles.map(o => o.id);
    onProcesarCierre(ids);
    setReporteGenerado(reporteObj);

    // Generate exact PDF file
    generarReportePDF(reporteObj);
  };

  const handleDescargarSoloPDF = () => {
    if (!reporteGenerado) return;
    generarReportePDF(reporteGenerado);
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(val || 0);
  };

  const formatDateStr = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Cierre Form Card */}
      <div className="filter-bar-card" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
          <Receipt size={22} color="#2563eb" />
          <h2 style={{ fontSize: '1.2rem' }}>Generar Cierre de Pagos de Técnicos</h2>
        </div>

        <div className="form-grid" style={{ marginTop: '14px' }}>
          <div className="form-group">
            <label>Fecha Inicio</label>
            <input 
              type="date" 
              className="input-control"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Fecha Fin</label>
            <input 
              type="date" 
              className="input-control"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
            />
          </div>

          <div className="form-group full-width">
            <label>Filtrar por Técnico</label>
            <select 
              className="select-control"
              value={tecnicoId}
              onChange={(e) => setTecnicoId(e.target.value)}
            >
              <option value="all">Todos los técnicos</option>
              {tecnicos.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Dynamic Calculation Summary Box */}
        <div style={{
          marginTop: '16px',
          backgroundColor: '#f8fafc',
          border: '1px solid #cbd5e1',
          borderRadius: '12px',
          padding: '20px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '16px'
        }}>
          <div>
            <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>ÓRDENES A CERRAR</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#2563eb' }}>
              {summaryReporte.totalOrdenes}
            </div>
          </div>
          <div>
            <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>SUBTOTAL</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>
              {formatCurrency(summaryReporte.subtotal)}
            </div>
          </div>
          <div>
            <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>TOTAL IVA (16%)</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#db2777' }}>
              {formatCurrency(summaryReporte.iva)}
            </div>
          </div>
          <div>
            <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>TOTAL COMISIÓN</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#16a34a' }}>
              {formatCurrency(summaryReporte.comision)}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
          <button 
            className="btn btn-success"
            onClick={handleProcesarYDescargarPDF}
            disabled={ordenesElegibles.length === 0}
          >
            <CheckCircle2 size={18} />
            <span>Procesar Cierre y Descargar Reporte PDF</span>
          </button>
        </div>
      </div>

      {/* Generated Report Preview (Exact 1-to-1 visual layout matching Django pdf_service.py) */}
      {reporteGenerado && (
        <div className="table-card printable-area" style={{ padding: '36px', backgroundColor: '#ffffff', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            {/* Header Left - Datos de la Empresa */}
            <div style={{ fontSize: '0.85rem', lineHeight: '1.4' }}>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '2px', color: '#0f172a' }}>SERVEL COMPUTADORAS</h2>
              <p style={{ margin: 0 }}>MIGUEL ANGEL SERVIN RAMIREZ</p>
              <p style={{ margin: 0 }}>RFC: SERM5010025K0</p>
              <p style={{ margin: 0 }}>AV 30 NORTE, MZA 49 LT 11 LOCAL C</p>
              <p style={{ margin: 0 }}>Col. PLAYA DEL CARMEN CENTRO, CP 77710</p>
              <p style={{ margin: 0 }}>Playa del Carmen, Quintana Roo, México</p>
            </div>

            {/* Header Right - Report Info */}
            <div style={{ textAlign: 'right', fontSize: '0.85rem', lineHeight: '1.4' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>REPORTE DE SERVICIOS</h2>
              <p style={{ margin: 0 }}><strong>Fecha de reporte:</strong> {formatDateStr(reporteGenerado.fechaInicio)} al {formatDateStr(reporteGenerado.fechaFin)}</p>
              <p style={{ margin: 0 }}><strong>Técnico:</strong> {reporteGenerado.tecnicoNombre}</p>
              <p style={{ margin: 0 }}><strong>Total servicios:</strong> {reporteGenerado.totalOrdenes}</p>
              <p style={{ margin: 0 }}><strong>Servicios facturados:</strong> {reporteGenerado.serviciosFacturados}</p>
            </div>
          </div>

          {/* Action Buttons Bar */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginBottom: '16px' }}>
            <button className="btn btn-primary btn-sm" onClick={handleDescargarSoloPDF}>
              <Download size={15} />
              <span>Descargar PDF Vectorial</span>
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => window.print()}>
              <Printer size={15} />
              <span>Imprimir</span>
            </button>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '12px 0 20px 0' }} />

          {/* Report Data Table with Exact Styling (#1A252C Header) */}
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', marginBottom: '24px' }}>
            <thead>
              <tr style={{ backgroundColor: '#1A252C', color: '#ffffff' }}>
                <th style={{ padding: '10px', textAlign: 'center', fontWeight: 'bold' }}>No. Orden</th>
                <th style={{ padding: '10px', textAlign: 'center', fontWeight: 'bold' }}>Facturado</th>
                <th style={{ padding: '10px', textAlign: 'center', fontWeight: 'bold' }}>Fecha Entrada</th>
                <th style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold' }}>Importe Piezas</th>
                <th style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold' }}>Importe Servicio</th>
                <th style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold' }}>Comisión</th>
              </tr>
            </thead>
            <tbody>
              {reporteGenerado.ordenes.map((o, idx) => (
                <tr 
                  key={o.id || idx} 
                  style={{ 
                    backgroundColor: idx % 2 === 1 ? '#F9FAFB' : '#ffffff',
                    borderBottom: '1px solid #E5E7EB'
                  }}
                >
                  <td style={{ padding: '8px 10px', textAlign: 'center' }}>{o.numero_orden}</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center' }}>{o.facturado ? 'Sí' : 'No'}</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center' }}>{formatDateStr(o.fecha_creacion)}</td>
                  <td style={{ padding: '8px 10px', textAlign: 'right' }}>{formatCurrency(o.total_piezas)}</td>
                  <td style={{ padding: '8px 10px', textAlign: 'right' }}>{formatCurrency(o.costo_servicio)}</td>
                  <td style={{ padding: '8px 10px', textAlign: 'right' }}>{formatCurrency(o.comision)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Bottom Right Totals Summary Block */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ width: '280px', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #E5E7EB' }}>
                <span style={{ fontWeight: 'bold' }}>Subtotal:</span>
                <span style={{ fontWeight: 'bold' }}>{formatCurrency(reporteGenerado.subtotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #E5E7EB' }}>
                <span style={{ fontWeight: 'bold' }}>Piezas:</span>
                <span style={{ fontWeight: 'bold' }}>{formatCurrency(reporteGenerado.piezas)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #E5E7EB' }}>
                <span style={{ fontWeight: 'bold' }}>IVA (16%):</span>
                <span style={{ fontWeight: 'bold' }}>{formatCurrency(reporteGenerado.iva)}</span>
              </div>
              <div style={{ 
                display: 'flex', 
                justify: 'space-between', 
                padding: '8px 10px', 
                backgroundColor: '#F3F4F6',
                borderBottom: '1px solid #E5E7EB',
                margin: '4px -10px'
              }}>
                <span style={{ fontWeight: 'bold' }}>Total:</span>
                <span style={{ fontWeight: 'bold' }}>{formatCurrency(reporteGenerado.total)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                <span style={{ fontWeight: 'bold' }}>Comisión:</span>
                <span style={{ fontWeight: 'bold' }}>{formatCurrency(reporteGenerado.comision)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
