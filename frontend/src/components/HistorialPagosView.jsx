import React, { useState, useMemo } from 'react';
import { 
  History, 
  Search, 
  Calendar, 
  DollarSign, 
  CheckCircle2, 
  Printer, 
  FileText,
  TrendingUp,
  Receipt
} from 'lucide-react';
import { generarReportePDF } from '../utils/pdfGenerator';

export default function HistorialPagosView({ pagosHistorial = [], ordenes = [], tecnicos = [] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  const safePagos = Array.isArray(pagosHistorial) ? pagosHistorial : [];

  // Filtered payments history
  const filteredPagos = useMemo(() => {
    return safePagos.filter(pago => {
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesId = (pago.id || '').toString().toLowerCase().includes(query);
        const matchesFecha = (pago.fecha_pago || '').toLowerCase().includes(query);
        if (!matchesId && !matchesFecha) return false;
      }

      if (pago.fecha_pago) {
        if (fechaInicio && pago.fecha_pago < fechaInicio) return false;
        if (fechaFin && pago.fecha_pago > fechaFin) return false;
      }

      return true;
    });
  }, [safePagos, searchTerm, fechaInicio, fechaFin]);

  // Overall statistics for payments
  const totalComisionesPagadas = useMemo(() => {
    return safePagos.reduce((sum, p) => sum + (parseFloat(p.total_comision) || 0), 0);
  }, [safePagos]);

  const totalIngresosLiquidados = useMemo(() => {
    return safePagos.reduce((sum, p) => sum + (parseFloat(p.ingreso_total) || 0), 0);
  }, [safePagos]);

  const totalOrdenesLiquidadas = useMemo(() => {
    return safePagos.reduce((sum, p) => sum + (parseInt(p.total_ordenes) || 0), 0);
  }, [safePagos]);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(val || 0);
  };

  const handlePrintPagoReport = (pago) => {
    const pagoOrders = (pago.ordenes && pago.ordenes.length > 0) 
      ? pago.ordenes 
      : ordenes.filter(o => String(o.pago_tecnico) === String(pago.id) || String(o.pago_tecnico_id) === String(pago.id));
    
    generarReportePDF({
      fechaInicio: pago.fecha_pago,
      fechaFin: pago.fecha_pago,
      tecnicoNombre: 'Técnico',
      ordenes: pagoOrders.length > 0 ? pagoOrders : [],
      subtotal: pago.ingreso_total - pago.total_iva,
      piezas: pago.total_piezas,
      iva: pago.total_iva,
      total: pago.ingreso_total,
      comision: pago.total_comision
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Metric Cards for Historial de Pagos */}
      <div className="metrics-grid">
        <div className="metric-card accent-total">
          <div className="metric-header">
            <span className="metric-title">TOTAL CIERRES REGISTRADOS</span>
            <div className="metric-icon-box" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
              <History size={20} />
            </div>
          </div>
          <div className="metric-value">{safePagos.length}</div>
          <div className="metric-subtext">Cierres de pago ejecutados</div>
        </div>

        <div className="metric-card accent-paid">
          <div className="metric-header">
            <span className="metric-title">COMISIONES PAGADAS</span>
            <div className="metric-icon-box" style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}>
              <DollarSign size={20} />
            </div>
          </div>
          <div className="metric-value">{formatCurrency(totalComisionesPagadas)}</div>
          <div className="metric-subtext">Acumulado liquidado a técnicos</div>
        </div>

        <div className="metric-card accent-revenue">
          <div className="metric-header">
            <span className="metric-title">INGRESOS LIQUIDADOS</span>
            <div className="metric-icon-box" style={{ backgroundColor: '#e0e7ff', color: '#4f46e5' }}>
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="metric-value">{formatCurrency(totalIngresosLiquidados)}</div>
          <div className="metric-subtext">{totalOrdenesLiquidadas} órdenes saldadas</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', width: '100%' }}>
          <div className="header-search" style={{ width: '280px' }}>
            <Search size={18} color="#94a3b8" />
            <input 
              type="text"
              placeholder="Buscar por ID de pago o fecha..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={16} color="#64748b" />
            <input 
              type="date"
              className="input-control"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
            />
            <span style={{ color: '#64748b' }}>a</span>
            <input 
              type="date"
              className="input-control"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
            />
          </div>

          {(fechaInicio || fechaFin || searchTerm) && (
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setSearchTerm('');
                setFechaInicio('');
                setFechaFin('');
              }}
            >
              Limpiar Filtros
            </button>
          )}
        </div>
      </div>

      {/* Historial Table */}
      <div className="table-card">
        <div className="table-header-bar">
          <h3>
            <span>Historial Completo de Cierres de Pago</span>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 'normal' }}>
              ({filteredPagos.length} de {safePagos.length} cierres)
            </span>
          </h3>
        </div>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID Pago</th>
                <th>Fecha de Pago</th>
                <th>Órdenes Saldadas</th>
                <th>Ingreso Total</th>
                <th>Comisión Pagada</th>
                <th>IVA Total</th>
                <th>Piezas Total</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredPagos.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                    No hay registros de cierre de pago con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filteredPagos.map(pago => (
                  <tr key={pago.id}>
                    <td>
                      <strong style={{ color: '#2563eb', fontFamily: 'var(--font-heading)' }}>
                        Pago #{pago.id}
                      </strong>
                    </td>
                    <td>{pago.fecha_pago}</td>
                    <td>
                      <span className="badge badge-paid">
                        {pago.total_ordenes} órdenes
                      </span>
                    </td>
                    <td>{formatCurrency(pago.ingreso_total)}</td>
                    <td>
                      <strong style={{ color: '#16a34a', fontSize: '0.95rem' }}>
                        {formatCurrency(pago.total_comision)}
                      </strong>
                    </td>
                    <td style={{ color: pago.total_iva > 0 ? '#db2777' : '#94a3b8' }}>
                      {formatCurrency(pago.total_iva)}
                    </td>
                    <td style={{ color: pago.total_piezas > 0 ? '#9333ea' : '#94a3b8' }}>
                      {formatCurrency(pago.total_piezas)}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="table-actions" style={{ justifyContent: 'flex-end' }}>
                        <button 
                          className="btn btn-secondary btn-sm"
                          title="Descargar Reporte PDF del Cierre"
                          onClick={() => handlePrintPagoReport(pago)}
                        >
                          <Printer size={15} />
                          <span>Reporte PDF</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
