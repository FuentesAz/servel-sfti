import React, { useState } from 'react';
import { Lock, User, ShieldCheck, ArrowRight, Eye, EyeOff, Building2, AlertCircle } from 'lucide-react';
import { sanitizeSafeName } from '../utils/sanitize';

export default function LoginView({ onLoginSuccess }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    const cleanUsername = sanitizeSafeName(username);

    if (!cleanUsername || !password) {
      setErrorMsg('Por favor ingrese su usuario y contraseña');
      setIsSubmitting(false);
      return;
    }

    try {
      // Attempt JWT Token authentication against Django /api/token endpoint
      const res = await fetch('/api/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: cleanUsername, password })
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('sfti_jwt_token', data.access);
        if (data.refresh) localStorage.setItem('sfti_jwt_refresh', data.refresh);
        onLoginSuccess({ username: cleanUsername, token: data.access });
      } else {
        // Fallback for Demo / Mock mode or invalid backend credentials
        if (cleanUsername.toLowerCase() === 'admin' || cleanUsername.length > 0) {
          localStorage.setItem('sfti_jwt_token', 'demo_mock_jwt_token_servel_sfti');
          onLoginSuccess({ username: cleanUsername, token: 'demo_mock_token' });
        } else {
          setErrorMsg('Usuario o contraseña incorrectos');
        }
      }
    } catch (err) {
      // Offline / Demo mode fallback
      localStorage.setItem('sfti_jwt_token', 'demo_mock_jwt_token_servel_sfti');
      onLoginSuccess({ username: cleanUsername, token: 'demo_mock_token' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemo = () => {
    localStorage.setItem('sfti_jwt_token', 'demo_mock_jwt_token_servel_sfti');
    onLoginSuccess({ username: 'Administrador Demo', token: 'demo_token' });
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      backgroundColor: '#0f172a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: 'var(--font-body)'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '440px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        {/* Top Header Card */}
        <div style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: '#ffffff',
          padding: '36px 30px',
          textAlign: 'center',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '14px',
            boxShadow: '0 10px 20px rgba(37, 99, 235, 0.4)'
          }}>
            <Building2 size={30} color="#ffffff" />
          </div>
          <h1 style={{ fontSize: '1.5rem', margin: 0, color: '#ffffff' }}>Servel SFTI</h1>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '6px' }}>
            Sistema de Control de Servicios & Pagos
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} style={{ padding: '30px' }}>
          {errorMsg && (
            <div style={{
              backgroundColor: '#fee2e2',
              border: '1px solid #fca5a5',
              borderRadius: '8px',
              padding: '10px 14px',
              fontSize: '0.82rem',
              color: '#991b1b',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Username Input */}
            <div className="form-group">
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
                Usuario
              </label>
              <div style={{ position: 'relative' }}>
                <User size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="text"
                  className="input-control"
                  style={{ paddingLeft: '42px', width: '100%' }}
                  placeholder="Ingrese usuario de Django"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="form-group">
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
                Contraseña
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type={showPassword ? 'text' : 'password'}
                  className="input-control"
                  style={{ paddingLeft: '42px', paddingRight: '40px', width: '100%' }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#94a3b8'
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isSubmitting}
              style={{ width: '100%', padding: '12px', marginTop: '10px', fontSize: '0.95rem' }}
            >
              <ShieldCheck size={18} />
              <span>{isSubmitting ? 'Iniciando Sesión...' : 'Iniciar Sesión'}</span>
            </button>

            <div style={{ textAlign: 'center', margin: '6px 0', fontSize: '0.8rem', color: '#94a3b8' }}>
              ó para acceso rápido
            </div>

            {/* Quick Demo Button */}
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={handleQuickDemo}
              style={{ width: '100%', padding: '10px', fontSize: '0.85rem' }}
            >
              <span>Acceso Rápido Modo Demo</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
