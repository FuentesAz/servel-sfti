import React, { useState } from 'react';
import { Users, UserPlus, Award, DollarSign, FileText } from 'lucide-react';

export default function TecnicosView({ tecnicos, ordenes, onCreateTecnico }) {
  const [newTechName, setNewTechName] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newTechName.trim()) return;
    onCreateTecnico(newTechName.trim());
    setNewTechName('');
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(val || 0);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Add Tech Form */}
      <div className="filter-bar-card">
        <form onSubmit={handleAdd} style={{ display: 'flex', alignItems: 'center', gap: '14px', width: '100%' }}>
          <Users size={20} color="#2563eb" />
          <input 
            type="text"
            className="input-control"
            placeholder="Nombre completo del nuevo técnico..."
            value={newTechName}
            onChange={(e) => setNewTechName(e.target.value)}
            style={{ flex: 1 }}
            required
          />
          <button type="submit" className="btn btn-primary">
            <UserPlus size={16} />
            <span>Agregar Técnico</span>
          </button>
        </form>
      </div>

      {/* Technicians List Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '20px'
      }}>
        {tecnicos.map(tech => {
          const techOrders = ordenes.filter(o => o.tecnico === tech.id);
          const totalGenerado = techOrders.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);
          const totalComisiones = techOrders.reduce((sum, o) => sum + (parseFloat(o.comision) || 0), 0);

          return (
            <div key={tech.id} className="table-card" style={{ padding: '22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  backgroundColor: '#dbeafe',
                  color: '#1d4ed8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '1.1rem'
                }}>
                  {tech.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem' }}>{tech.name}</h3>
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Técnico de Servicio</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FileText size={15} /> Órdenes atendidas:
                  </span>
                  <strong>{techOrders.length}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <DollarSign size={15} /> Facturación total:
                  </span>
                  <strong>{formatCurrency(totalGenerado)}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#16a34a', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                    <Award size={15} /> Comisiones ganadas:
                  </span>
                  <strong style={{ color: '#16a34a' }}>{formatCurrency(totalComisiones)}</strong>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
