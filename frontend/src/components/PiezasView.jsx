import React, { useMemo } from 'react';
import { Wrench, Package, DollarSign, Calendar } from 'lucide-react';

export default function PiezasView({ ordenes }) {
  // Aggregate all piezas from all ordenes
  const allPiezas = useMemo(() => {
    const list = [];
    ordenes.forEach(o => {
      if (o.piezas && Array.isArray(o.piezas)) {
        o.piezas.forEach(p => {
          list.push({
            ...p,
            ordenNumero: o.numero_orden,
            tecnicoNombre: o.tecnico_nombre,
            fechaOrden: o.fecha_creacion
          });
        });
      }
    });
    return list;
  }, [ordenes]);

  const totalPiezasInversión = allPiezas.reduce((sum, p) => sum + (parseFloat(p.costo) || 0), 0);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(val || 0);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="metrics-grid">
        <div className="metric-card accent-parts">
          <div className="metric-header">
            <span className="metric-title">TOTAL REPUESTOS REGISTRADOS</span>
            <div className="metric-icon-box" style={{ backgroundColor: '#f3e8ff', color: '#9333ea' }}>
              <Wrench size={20} />
            </div>
          </div>
          <div className="metric-value">{allPiezas.length}</div>
          <div className="metric-subtext">Piezas instaladas en servicios</div>
        </div>

        <div className="metric-card accent-revenue">
          <div className="metric-header">
            <span className="metric-title">MONTO TOTAL DE PIEZAS</span>
            <div className="metric-icon-box" style={{ backgroundColor: '#e0e7ff', color: '#4f46e5' }}>
              <DollarSign size={20} />
            </div>
          </div>
          <div className="metric-value">{formatCurrency(totalPiezasInversión)}</div>
          <div className="metric-subtext">Suma global de repuestos</div>
        </div>
      </div>

      {/* Parts Table */}
      <div className="table-card">
        <div className="table-header-bar">
          <h3>Registro General de Repuestos y Piezas</h3>
        </div>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Repuesto / Pieza</th>
                <th>Orden N°</th>
                <th>Técnico</th>
                <th>Método Pago</th>
                <th>Comentarios</th>
                <th style={{ textAlign: 'right' }}>Costo</th>
              </tr>
            </thead>
            <tbody>
              {allPiezas.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                    No hay piezas o repuestos asociados a ninguna orden de servicio aún.
                  </td>
                </tr>
              ) : (
                allPiezas.map((pieza, idx) => (
                  <tr key={pieza.id || idx}>
                    <td>
                      <strong style={{ color: '#0f172a' }}>{pieza.nombre}</strong>
                    </td>
                    <td>
                      <span style={{ color: '#2563eb', fontWeight: 600 }}>#{pieza.ordenNumero}</span>
                    </td>
                    <td>{pieza.tecnicoNombre}</td>
                    <td style={{ textTransform: 'capitalize' }}>
                      {pieza.metodo_pago === 'cash' ? 'Efectivo' : pieza.metodo_pago === 'transfer' ? 'Transferencia' : 'Tarjeta'}
                    </td>
                    <td style={{ color: '#64748b', fontSize: '0.84rem' }}>
                      {pieza.comentarios || '-'}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <strong style={{ color: '#9333ea' }}>{formatCurrency(pieza.costo)}</strong>
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
