import React from 'react';
import { Search, Calendar, Plus, LogOut } from 'lucide-react';
import { sanitizeSafeName } from '../utils/sanitize';

export default function Header({ searchGlobal, setSearchGlobal, onOpenNewOrderModal, onLogout, currentUser }) {
  const todayFormatted = new Date().toLocaleDateString('es-ES', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  const usernameDisplay = currentUser?.username ? sanitizeSafeName(currentUser.username) : 'ADMIN';

  return (
    <header className="top-header">
      {/* Global Search Bar */}
      <div className="header-search">
        <Search size={18} color="#94a3b8" />
        <input
          type="text"
          placeholder="Buscar orden (#), técnico, piezas..."
          value={searchGlobal}
          onChange={(e) => setSearchGlobal(sanitizeSafeName(e.target.value))}
        />
      </div>

      {/* Header Actions & Profile */}
      <div className="header-right">
        <div className="date-pill">
          <Calendar size={16} color="#475569" />
          <span>{todayFormatted}</span>
        </div>

        <button className="btn btn-primary" onClick={onOpenNewOrderModal}>
          <Plus size={18} />
          <span>Agregar Orden Servicio</span>
        </button>

        <div style={{ width: '1px', height: '28px', backgroundColor: '#e2e8f0' }}></div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            padding: '6px 12px',
            borderRadius: '20px',
            backgroundColor: '#eff6ff',
            color: '#2563eb',
            fontWeight: 'bold',
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <span>{usernameDisplay.toUpperCase()}</span>
          </div>

          <button 
            className="icon-btn" 
            title="Cerrar Sesión"
            onClick={onLogout}
            style={{ color: '#ef4444' }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
