import React, { useState, useMemo } from 'react';
import { 
  Filter, 
  CheckCircle, 
  Trash2, 
  Edit3, 
  Printer, 
  Download, 
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function OrderTable({ 
  ordenes, 
  tecnicos, 
  searchGlobal, 
  onEditOrden, 
  onDeleteOrden, 
  onBatchMarcarPagadas,
  onGoToCierre,
  onOpenNewOrderModal,
  onPrintOrdenReceipt
}) {
  const [statusFilter, setStatusFilter] = useState('all');
  const [facturadoFilter, setFacturadoFilter] = useState('all');
  const [tecnicoFilter, setTecnicoFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState([]);

  // Pagination states matching SilverLogix reference image
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Filter & Search Logic
  const filteredOrdenes = useMemo(() => {
    const filtered = ordenes.filter(item => {
      // Global Search
      if (searchGlobal.trim()) {
        const query = searchGlobal.toLowerCase();
        const matchesNum = item.numero_orden.toString().toLowerCase().includes(query);
        const matchesTech = (item.tecnico_nombre || '').toLowerCase().includes(query);
        if (!matchesNum && !matchesTech) return false;
      }

      // Status Filter
      if (statusFilter !== 'all' && item.status !== statusFilter) {
        return false;
      }

      // Facturado Filter
      if (facturadoFilter === 'yes' && !item.facturado) return false;
      if (facturadoFilter === 'no' && item.facturado) return false;

      // Técnico Filter
      if (tecnicoFilter !== 'all' && item.tecnico !== parseInt(tecnicoFilter)) {
        return false;
      }

      return true;
    });

    return filtered.sort((a, b) => {
      const dateA = a.fecha_creacion ? new Date(a.fecha_creacion).getTime() : 0;
      const dateB = b.fecha_creacion ? new Date(b.fecha_creacion).getTime() : 0;
      if (dateB !== dateA) return dateB - dateA;
      return (parseInt(b.id) || 0) - (parseInt(a.id) || 0);
    });
  }, [ordenes, searchGlobal, statusFilter, facturadoFilter, tecnicoFilter]);

  // Paginated subset
  const totalPages = Math.ceil(filteredOrdenes.length / rowsPerPage) || 1;
  const paginatedOrdenes = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredOrdenes.slice(start, start + rowsPerPage);
  }, [filteredOrdenes, currentPage, rowsPerPage]);

  // Reset to page 1 on filter change
  useMemo(() => {
    setCurrentPage(1);
  }, [searchGlobal, statusFilter, facturadoFilter, tecnicoFilter, rowsPerPage]);

  // Select all checkbox handler for current view page
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(paginatedOrdenes.map(o => o.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const isAllSelected = paginatedOrdenes.length > 0 && paginatedOrdenes.every(o => selectedIds.includes(o.id));

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(val || 0);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  // Export to CSV Function
  const handleExportCSV = () => {
    if (filteredOrdenes.length === 0) {
      alert('No hay datos para exportar');
      return;
    }

    const headers = [
      'Numero Orden',
      'Tecnico',
      'Estatus',
      'Facturado',
      'Metodo Pago',
      'Costo Servicio',
      'IVA',
      'Piezas Total',
      'Comision Tecnico',
      'Ganancia Taller',
      'Total',
      'Fecha Creacion',
      'Fecha Cierre'
    ];

    const rows = filteredOrdenes.map(o => [
      `"${o.numero_orden}"`,
      `"${o.tecnico_nombre || ''}"`,
      `"${o.status === 'paid' ? 'Pagado' : 'Pendiente'}"`,
      `"${o.facturado ? 'Si' : 'No'}"`,
      `"${o.metodo_pago}"`,
      o.costo_servicio || 0,
      o.iva || 0,
      o.total_piezas || 0,
      o.comision || 0,
      o.ganancia_taller || 0,
      o.total || 0,
      `"${o.fecha_creacion || ''}"`,
      `"${o.fecha_cierre || ''}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `reporte_ordenes_servicio_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="table-card">
      {/* Top Filter & Toolbar */}
      <div className="filter-bar-card">
        <div className="filter-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>
            <Filter size={16} />
            <span>Filtrar:</span>
          </div>

          {/* Status Filter */}
          <select 
            className="select-control"
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Por Status (Todos)</option>
            <option value="pending">Pendiente</option>
            <option value="paid">Pagado</option>
          </select>

          {/* Facturado Filter */}
          <select 
            className="select-control"
            value={facturadoFilter} 
            onChange={(e) => setFacturadoFilter(e.target.value)}
          >
            <option value="all">Por Factura (Todos)</option>
            <option value="yes">Facturado (Sí)</option>
            <option value="no">Sin Factura (No)</option>
          </select>

          {/* Técnico Filter */}
          <select 
            className="select-control"
            value={tecnicoFilter} 
            onChange={(e) => setTecnicoFilter(e.target.value)}
          >
            <option value="all">Por Técnico (Todos)</option>
            {tecnicos.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        {/* Action Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {selectedIds.length > 0 && (
            <button 
              className="btn btn-success btn-sm"
              onClick={async () => {
                const idsToProcess = [...selectedIds];
                setSelectedIds([]);
                await onBatchMarcarPagadas(idsToProcess);
              }}
            >
              <CheckCircle size={15} />
              <span>Marcar ({selectedIds.length}) como Pagadas</span>
            </button>
          )}

          <button className="btn btn-secondary btn-sm" onClick={handleExportCSV}>
            <FileSpreadsheet size={15} color="#16a34a" />
            <span>Exportar CSV</span>
          </button>

          <button className="btn btn-secondary btn-sm" onClick={onGoToCierre}>
            <Download size={15} />
            <span>Cierre de Pagos</span>
          </button>
        </div>
      </div>

      {/* Main Table Header */}
      <div className="table-header-bar">
        <h3>
          <span>Reporte de Órdenes de Servicio</span>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 'normal' }}>
            ({filteredOrdenes.length} registradas)
          </span>
        </h3>
      </div>

      {/* Main Data Table */}
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}>
                <input 
                  type="checkbox" 
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                />
              </th>
              <th>Número Orden</th>
              <th>Técnico</th>
              <th>Status</th>
              <th>Facturado</th>
              <th>Método Pago</th>
              <th>Costo Serv.</th>
              <th>IVA</th>
              <th>Piezas</th>
              <th>Total</th>
              <th>Fecha Creación</th>
              <th>Fecha Cierre</th>
              <th style={{ textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {paginatedOrdenes.length === 0 ? (
              <tr>
                <td colSpan="13" style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                  No se encontraron órdenes de servicio con los filtros aplicados.
                </td>
              </tr>
            ) : (
              paginatedOrdenes.map(orden => {
                const isSelected = selectedIds.includes(orden.id);
                return (
                  <tr key={orden.id} style={{ backgroundColor: isSelected ? '#eff6ff' : 'transparent' }}>
                    <td>
                      <input 
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectOne(orden.id)}
                      />
                    </td>
                    <td>
                      <strong style={{ color: '#2563eb', fontFamily: 'var(--font-heading)' }}>
                        #{orden.numero_orden}
                      </strong>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600 }}>{orden.tecnico_nombre || 'Desconocido'}</span>
                    </td>
                    <td>
                      <span className={`badge ${orden.status === 'paid' ? 'badge-paid' : 'badge-pending'}`}>
                        {orden.status === 'paid' ? 'Pagado' : 'Pendiente'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${orden.facturado ? 'badge-facturado-yes' : 'badge-facturado-no'}`}>
                        {orden.facturado ? 'Sí (16%)' : 'No'}
                      </span>
                    </td>
                    <td>
                      <span style={{ textTransform: 'capitalize', fontSize: '0.84rem' }}>
                        {orden.metodo_pago === 'cash' ? 'Efectivo' : orden.metodo_pago === 'transfer' ? 'Transferencia' : 'Tarjeta'}
                      </span>
                    </td>
                    <td>{formatCurrency(orden.costo_servicio)}</td>
                    <td style={{ color: orden.iva > 0 ? '#db2777' : '#94a3b8' }}>
                      {formatCurrency(orden.iva)}
                    </td>
                    <td style={{ color: orden.total_piezas > 0 ? '#9333ea' : '#94a3b8' }}>
                      {formatCurrency(orden.total_piezas)}
                    </td>
                    <td>
                      <strong style={{ fontSize: '0.95rem' }}>{formatCurrency(orden.total)}</strong>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      {formatDate(orden.fecha_creacion)}
                    </td>
                    <td style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      {formatDate(orden.fecha_cierre)}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="table-actions" style={{ justifyContent: 'flex-end' }}>
                        <button 
                          className="icon-btn" 
                          title="Ver / Editar Orden y Piezas"
                          onClick={() => onEditOrden(orden)}
                        >
                          <Edit3 size={15} />
                        </button>
                        <button 
                          className="icon-btn" 
                          title="Eliminar Orden"
                          onClick={() => onDeleteOrden(orden.id)}
                          style={{ color: '#ef4444' }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar (Matching SilverLogix reference image bottom bar) */}
      <div style={{
        padding: '14px 22px',
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        fontSize: '0.85rem',
        color: '#64748b',
        backgroundColor: '#fafafa'
      }}>
        <div>
          Mostrando {filteredOrdenes.length > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0} a {Math.min(currentPage * rowsPerPage, filteredOrdenes.length)} de {filteredOrdenes.length} entradas
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Page numbers */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button 
              className="icon-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            >
              <ChevronLeft size={16} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                style={{
                  minWidth: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  border: '1px solid',
                  borderColor: pageNum === currentPage ? '#2563eb' : '#cbd5e1',
                  backgroundColor: pageNum === currentPage ? '#2563eb' : '#ffffff',
                  color: pageNum === currentPage ? '#ffffff' : '#334155',
                  fontWeight: pageNum === currentPage ? 700 : 500,
                  cursor: 'pointer'
                }}
              >
                {pageNum}
              </button>
            ))}

            <button 
              className="icon-btn"
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Rows per page selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Filas por página:</span>
            <select 
              className="select-control"
              style={{ padding: '4px 8px', fontSize: '0.8rem' }}
              value={rowsPerPage}
              onChange={(e) => setRowsPerPage(Number(e.target.value))}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
