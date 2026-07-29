import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Calculator, Wrench, CheckCircle } from 'lucide-react';
import { sanitizeSafeName, sanitizeNumber, sanitizeText } from '../utils/sanitize';

export default function OrderModal({ isOpen, onClose, onSave, ordenToEdit, tecnicos }) {
  if (!isOpen) return null;

  const [numeroOrden, setNumeroOrden] = useState('');
  const [tecnicoId, setTecnicoId] = useState('');
  const [costoServicio, setCostoServicio] = useState('');
  const [facturado, setFacturado] = useState(false);
  const [metodoPago, setMetodoPago] = useState('cash');
  const [status, setStatus] = useState('pending');
  const [piezas, setPiezas] = useState([]);

  // Populated fields when editing
  useEffect(() => {
    if (ordenToEdit) {
      setNumeroOrden(ordenToEdit.numero_orden || '');
      setTecnicoId(ordenToEdit.tecnico || (tecnicos[0]?.id || ''));
      setCostoServicio(ordenToEdit.costo_servicio || '');
      setFacturado(!!ordenToEdit.facturado);
      setMetodoPago(ordenToEdit.metodo_pago || 'cash');
      setStatus(ordenToEdit.status || 'pending');
      setPiezas(ordenToEdit.piezas || []);
    } else {
      // Default new order values
      setNumeroOrden(`${Math.floor(700 + Math.random() * 200)}`);
      setTecnicoId(tecnicos[0]?.id || '');
      setCostoServicio('');
      setFacturado(false);
      setMetodoPago('cash');
      setStatus('pending');
      setPiezas([]);
    }
  }, [ordenToEdit, tecnicos]);

  // Live calculation based on Django model logic
  const costNum = parseFloat(costoServicio) || 0;
  let subtotal = costNum;
  let iva = 0;

  if (facturado) {
    subtotal = costNum / 1.16;
    iva = costNum - subtotal;
  }

  const comision = subtotal / 2;
  const gananciaTaller = subtotal / 2;
  const totalPiezas = piezas.reduce((sum, p) => sum + (parseFloat(p.costo) || 0), 0);
  const totalFinal = costNum + totalPiezas;

  const handleAddPieza = () => {
    setPiezas([...piezas, { id: Date.now(), nombre: '', costo: '', metodo_pago: 'cash', comentarios: '' }]);
  };

  const handleUpdatePieza = (index, field, value) => {
    const updated = [...piezas];
    updated[index][field] = value;
    setPiezas(updated);
  };

  const handleRemovePieza = (index) => {
    setPiezas(piezas.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!tecnicoId || !costoServicio) {
      alert('Por favor complete el técnico y el costo del servicio');
      return;
    }

    const cleanPiezas = piezas.map(p => ({
      ...p,
      nombre: sanitizeSafeName(p.nombre || ''),
      costo: sanitizeNumber(p.costo || 0),
      comentarios: sanitizeText(p.comentarios || '')
    }));

    const payload = {
      id: ordenToEdit?.id,
      numero_orden: sanitizeSafeName(numeroOrden),
      tecnico: parseInt(tecnicoId),
      costo_servicio: sanitizeNumber(costoServicio),
      facturado,
      metodo_pago: metodoPago,
      status,
      piezas: cleanPiezas
    };

    onSave(payload);
    onClose();
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(val || 0);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{ordenToEdit ? `Editar Orden #${ordenToEdit.numero_orden}` : 'Agregar Nueva Orden de Servicio'}</h2>
          <button className="icon-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid">
              {/* Número de Orden */}
              <div className="form-group">
                <label>Número de Orden</label>
                <input 
                  type="text" 
                  className="input-control"
                  value={numeroOrden}
                  onChange={(e) => setNumeroOrden(e.target.value)}
                  required
                />
              </div>

              {/* Técnico Select */}
              <div className="form-group">
                <label>Técnico Asignado</label>
                <select 
                  className="select-control"
                  value={tecnicoId}
                  onChange={(e) => setTecnicoId(e.target.value)}
                  required
                >
                  <option value="">-- Seleccionar Técnico --</option>
                  {tecnicos.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              {/* Costo Servicio */}
              <div className="form-group">
                <label>Costo del Servicio ($)</label>
                <input 
                  type="number" 
                  step="0.01"
                  className="input-control"
                  placeholder="0.00"
                  value={costoServicio}
                  onChange={(e) => setCostoServicio(e.target.value)}
                  required
                />
              </div>

              {/* Método Pago */}
              <div className="form-group">
                <label>Método de Pago</label>
                <select 
                  className="select-control"
                  value={metodoPago}
                  onChange={(e) => setMetodoPago(e.target.value)}
                >
                  <option value="cash">Efectivo</option>
                  <option value="transfer">Transferencia</option>
                  <option value="card">Tarjeta</option>
                </select>
              </div>

              {/* Status */}
              <div className="form-group">
                <label>Estatus de la Orden</label>
                <select 
                  className="select-control"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="pending">Pendiente</option>
                  <option value="paid">Pagado</option>
                </select>
              </div>

              {/* Facturado Checkbox */}
              <div className="form-group" style={{ justifyContent: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginTop: '16px' }}>
                  <input 
                    type="checkbox"
                    checked={facturado}
                    onChange={(e) => setFacturado(e.target.checked)}
                  />
                  <span>Requiere Factura (16% IVA incluido)</span>
                </label>
              </div>
            </div>

            {/* Calculations Preview (Matching Django save() method) */}
            <div style={{
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '10px',
              padding: '14px',
              fontSize: '0.85rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '10px'
            }}>
              <div>
                <span style={{ color: '#475569', fontSize: '0.75rem', display: 'block' }}>Subtotal:</span>
                <strong>{formatCurrency(subtotal)}</strong>
              </div>
              <div>
                <span style={{ color: '#475569', fontSize: '0.75rem', display: 'block' }}>IVA (16%):</span>
                <strong style={{ color: '#db2777' }}>{formatCurrency(iva)}</strong>
              </div>
              <div>
                <span style={{ color: '#475569', fontSize: '0.75rem', display: 'block' }}>Comisión Técnico (50%):</span>
                <strong style={{ color: '#2563eb' }}>{formatCurrency(comision)}</strong>
              </div>
              <div>
                <span style={{ color: '#475569', fontSize: '0.75rem', display: 'block' }}>Total Final:</span>
                <strong style={{ fontSize: '1rem', color: '#0f172a' }}>{formatCurrency(totalFinal)}</strong>
              </div>
            </div>

            {/* Inline Piezas / Repuestos Manager */}
            <div className="parts-manager">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, fontSize: '0.9rem' }}>
                  <Wrench size={16} color="#9333ea" />
                  <span>Piezas / Repuestos Incluidos ({piezas.length})</span>
                </div>
                <button type="button" className="btn btn-secondary btn-sm" onClick={handleAddPieza}>
                  <Plus size={14} />
                  <span>Agregar Pieza</span>
                </button>
              </div>

              {piezas.map((pieza, idx) => (
                <div key={idx} className="part-item-row">
                  <input 
                    type="text" 
                    placeholder="Nombre del repuesto/pieza"
                    className="input-control"
                    value={pieza.nombre}
                    onChange={(e) => handleUpdatePieza(idx, 'nombre', e.target.value)}
                  />
                  <input 
                    type="number" 
                    step="0.01"
                    placeholder="Costo $"
                    className="input-control"
                    value={pieza.costo}
                    onChange={(e) => handleUpdatePieza(idx, 'costo', e.target.value)}
                  />
                  <select 
                    className="select-control"
                    value={pieza.metodo_pago}
                    onChange={(e) => handleUpdatePieza(idx, 'metodo_pago', e.target.value)}
                  >
                    <option value="cash">Efectivo</option>
                    <option value="transfer">Transferencia</option>
                    <option value="card">Tarjeta</option>
                  </select>
                  <button type="button" className="icon-btn" onClick={() => handleRemovePieza(idx)} style={{ color: '#ef4444' }}>
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              <CheckCircle size={16} />
              <span>Guardar Orden</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
