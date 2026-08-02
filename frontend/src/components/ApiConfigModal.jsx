import React, { useState } from 'react';
import { X, Settings, Server, RefreshCw, Check } from 'lucide-react';
import { api } from '../api/client';

export default function ApiConfigModal({ isOpen, onClose, onSaveConfig }) {
  if (!isOpen) return null;

  const [apiBase, setApiBase] = useState(api.apiBase);
  const [useMock, setUseMock] = useState(api.useMock);

  const handleSave = (e) => {
    e.preventDefault();
    api.setApiBase(apiBase);
    api.setUseMock(useMock);
    onSaveConfig(apiBase, useMock);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '520px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Settings size={20} color="#2563eb" />
            <h2>Configuración de Conexión Django REST</h2>
          </div>
          <button className="icon-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave}>
          <div className="modal-body">
            <div className="form-group">
              <label>Modo de Funcionamiento</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '6px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: useMock ? '#eff6ff' : '#ffffff' }}>
                  <input 
                    type="radio" 
                    name="apiMode"
                    checked={useMock}
                    onChange={() => setUseMock(true)}
                  />
                  <div>
                    <strong>Modo Demo / Datos Mock (Recomendado para pruebas rápidas)</strong>
                    <p style={{ fontSize: '0.78rem', color: '#64748b' }}>
                      Carga y guarda información en el almacenamiento local del navegador sin requerir servidor Django ejecutándose.
                    </p>
                  </div>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: !useMock ? '#eff6ff' : '#ffffff' }}>
                  <input 
                    type="radio" 
                    name="apiMode"
                    checked={!useMock}
                    onChange={() => setUseMock(false)}
                  />
                  <div>
                    <strong>Conexión a Servidor Django REST en Vivo</strong>
                    <p style={{ fontSize: '0.78rem', color: '#64748b' }}>
                      Realiza peticiones HTTP directamente a la API de Django DRF (`/api/v1/ordenes/`, `/api/v1/tecnicos/`, etc.)
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {!useMock && (
              <div className="form-group">
                <label>URL Base de la API Django</label>
                <input 
                  type="text" 
                  className="input-control"
                  value={apiBase}
                  onChange={(e) => setApiBase(e.target.value)}
                  placeholder="/api/v1"
                  required
                />
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              <Check size={16} />
              <span>Guardar Cambios</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
