import React, { useState, useEffect } from 'react';
import { UserCheck, UserX, Clock, ShieldAlert, CheckCircle2, RefreshCw } from 'lucide-react';
import { api } from '../api/client';

export default function UsuariosPendientesView({ onUserApproved }) {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const data = await api.getPendingUsers();
      setPendingUsers(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Error fetching pending users:', e);
      setPendingUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleApprove = async (id, username) => {
    try {
      await api.approveUser(id);
      setMessage({ type: 'success', text: `El usuario "${username}" ha sido APROBADO correctamente.` });
      fetchPending();
      if (onUserApproved) onUserApproved();
    } catch (e) {
      setMessage({ type: 'error', text: `No se pudo aprobar al usuario: ${e.message}` });
    }
  };

  const handleReject = async (id, username) => {
    if (!window.confirm(`¿Está seguro de que desea rechazar y eliminar la solicitud del usuario "${username}"?`)) {
      return;
    }
    try {
      await api.rejectUser(id);
      setMessage({ type: 'success', text: `La solicitud del usuario "${username}" fue rechazada.` });
      fetchPending();
      if (onUserApproved) onUserApproved();
    } catch (e) {
      setMessage({ type: 'error', text: `Error al rechazar usuario: ${e.message}` });
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Top Banner Info */}
      <div style={{
        backgroundColor: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            backgroundColor: '#eff6ff',
            color: '#2563eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Clock size={24} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a' }}>
              Solicitudes de Registro Pendientes
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
              Autorice el acceso a los usuarios que se han registrado en el sistema.
            </p>
          </div>
        </div>
        <button 
          className="btn btn-secondary" 
          onClick={fetchPending}
          disabled={loading}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          <span>Actualizar</span>
        </button>
      </div>

      {message && (
        <div style={{
          backgroundColor: message.type === 'success' ? '#f0fdf4' : '#fef2f2',
          border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
          color: message.type === 'success' ? '#166534' : '#991b1b',
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.9rem'
        }}>
          {message.type === 'success' ? <CheckCircle2 size={18} /> : <ShieldAlert size={18} />}
          <span>{message.text}</span>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
          Cargando solicitudes pendientes...
        </div>
      ) : pendingUsers.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '48px 24px',
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px border-dashed #cbd5e1'
        }}>
          <CheckCircle2 size={40} color="#10b981" style={{ marginBottom: '12px' }} />
          <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b' }}>No hay solicitudes pendientes</h4>
          <p style={{ margin: '6px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
            Todos los usuarios registrados han sido autorizados o no hay nuevas solicitudes en cola.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {pendingUsers.map((u) => (
            <div key={u.id} style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              padding: '20px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <h4 style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a' }}>
                    {u.first_name || u.username}
                  </h4>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: '12px',
                    backgroundColor: '#fff7ed',
                    color: '#c2410c',
                    border: '1px solid #ffedd5'
                  }}>
                    Pendiente
                  </span>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <p style={{ margin: 0 }}><strong>Usuario:</strong> @{u.username}</p>
                  {u.email && <p style={{ margin: 0 }}><strong>Email:</strong> {u.email}</p>}
                  {u.date_joined && (
                    <p style={{ margin: 0, fontSize: '0.78rem', color: '#94a3b8', marginTop: '6px' }}>
                      Registrado: {new Date(u.date_joined).toLocaleString('es-MX')}
                    </p>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px', paddingTop: '14px', borderTop: '1px solid #f1f5f9' }}>
                <button
                  onClick={() => handleApprove(u.id, u.username)}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    backgroundColor: '#16a34a',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.82rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <UserCheck size={16} />
                  <span>Aprobar</span>
                </button>
                <button
                  onClick={() => handleReject(u.id, u.username)}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    backgroundColor: '#dc2626',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.82rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <UserX size={16} />
                  <span>Rechazar</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
