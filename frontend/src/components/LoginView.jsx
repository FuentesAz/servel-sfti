import React, { useState } from 'react';
import { Lock, User, ShieldCheck, ArrowRight, Eye, EyeOff, Building2, AlertCircle, CheckCircle2, Mail, UserPlus, LogIn } from 'lucide-react';
import { sanitizeSafeName } from '../utils/sanitize';
import { api } from '../api/client';

export default function LoginView({ onLoginSuccess }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  
  // Login State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register State
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    try {
      const userObj = await api.loginUser(username, password);
      onLoginSuccess(userObj);
    } catch (err) {
      setErrorMsg(err.message || 'Usuario o contraseña incorrectos');
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    const cleanUsername = sanitizeSafeName(regUsername);
    const cleanName = sanitizeSafeName(regName);
    const cleanEmail = regEmail.trim();
    const cleanPassword = regPassword.trim();

    if (!cleanUsername || !cleanPassword) {
      setErrorMsg('El usuario y la contraseña son obligatorios.');
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await api.registerUser({
        username: cleanUsername,
        password: cleanPassword,
        email: cleanEmail,
        first_name: cleanName
      });
      setSuccessMsg(res.detail || 'Solicitud de registro enviada. Un administrador debe autorizar tu cuenta antes de ingresar.');
      setRegName('');
      setRegUsername('');
      setRegEmail('');
      setRegPassword('');
      setMode('login');
      setUsername(cleanUsername);
    } catch (err) {
      setErrorMsg(err.message || 'Error al procesar el registro');
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
        maxWidth: '460px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        {/* Top Header Card */}
        <div style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: '#ffffff',
          padding: '30px 24px',
          textAlign: 'center',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '12px',
            boxShadow: '0 10px 20px rgba(37, 99, 235, 0.4)'
          }}>
            <Building2 size={28} color="#ffffff" />
          </div>
          <h1 style={{ fontSize: '1.4rem', margin: 0, color: '#ffffff' }}>Servel SFTI</h1>
          <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '4px' }}>
            Sistema de Control de Servicios & Pagos
          </p>

          {/* Mode Switcher Tabs */}
          <div style={{
            display: 'flex',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            borderRadius: '10px',
            padding: '4px',
            marginTop: '20px'
          }}>
            <button
              type="button"
              onClick={() => { setMode('login'); setErrorMsg(''); setSuccessMsg(''); }}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: mode === 'login' ? '#2563eb' : 'transparent',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <LogIn size={15} />
              <span>Iniciar Sesión</span>
            </button>

            <button
              type="button"
              onClick={() => { setMode('register'); setErrorMsg(''); setSuccessMsg(''); }}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: mode === 'register' ? '#2563eb' : 'transparent',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <UserPlus size={15} />
              <span>Solicitar Registro</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div style={{ padding: '26px' }}>
          {errorMsg && (
            <div style={{
              backgroundColor: '#fee2e2',
              border: '1px solid #fca5a5',
              borderRadius: '8px',
              padding: '10px 14px',
              fontSize: '0.82rem',
              color: '#991b1b',
              marginBottom: '18px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div style={{
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '8px',
              padding: '10px 14px',
              fontSize: '0.82rem',
              color: '#166534',
              marginBottom: '18px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <CheckCircle2 size={16} />
              <span>{successMsg}</span>
            </div>
          )}

          {mode === 'login' ? (
            /* Login Form */
            <form onSubmit={handleLogin}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                      autoCapitalize="none"
                      autoCorrect="off"
                      autoComplete="username"
                      required
                    />
                  </div>
                </div>

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

                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={isSubmitting}
                  style={{ width: '100%', padding: '12px', marginTop: '6px', fontSize: '0.92rem' }}
                >
                  <ShieldCheck size={18} />
                  <span>{isSubmitting ? 'Iniciando Sesión...' : 'Iniciar Sesión'}</span>
                </button>

                <div style={{ textAlign: 'center', margin: '4px 0', fontSize: '0.78rem', color: '#94a3b8' }}>
                  ó para acceso rápido
                </div>

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
          ) : (
            /* Register Form */
            <form onSubmit={handleRegister}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group">
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
                    Nombre Completo
                  </label>
                  <input 
                    type="text"
                    className="input-control"
                    style={{ width: '100%' }}
                    placeholder="Ej. Pedro Pérez"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
                    Usuario deseado *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <User size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input 
                      type="text"
                      className="input-control"
                      style={{ paddingLeft: '42px', width: '100%' }}
                      placeholder="Ej. pedro123"
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value)}
                      autoCapitalize="none"
                      autoCorrect="off"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
                    Correo Electrónico (opcional)
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input 
                      type="email"
                      className="input-control"
                      style={{ paddingLeft: '42px', width: '100%' }}
                      placeholder="correo@ejemplo.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
                    Contraseña deseada *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input 
                      type="password"
                      className="input-control"
                      style={{ paddingLeft: '42px', width: '100%' }}
                      placeholder="Crea tu contraseña"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div style={{
                  fontSize: '0.78rem',
                  color: '#64748b',
                  backgroundColor: '#f8fafc',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0'
                }}>
                  ℹ️ Tu cuenta será registrada en estado <strong>Pendiente</strong> y requerirá autorización del administrador antes de poder ingresar.
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={isSubmitting}
                  style={{ width: '100%', padding: '12px', marginTop: '6px', fontSize: '0.92rem' }}
                >
                  <UserPlus size={18} />
                  <span>{isSubmitting ? 'Enviando...' : 'Enviar Solicitud de Registro'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
