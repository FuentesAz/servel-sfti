import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import MetricCards from './components/MetricCards';
import OrderTable from './components/OrderTable';
import OrderModal from './components/OrderModal';
import CierrePagos from './components/CierrePagos';
import TecnicosView from './components/TecnicosView';
import PiezasView from './components/PiezasView';
import EstadisticasView from './components/EstadisticasView';
import HistorialPagosView from './components/HistorialPagosView';
import ApiConfigModal from './components/ApiConfigModal';
import LoginView from './components/LoginView';
import { api } from './api/client';
import { Printer, X, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'sans-serif' }}>
          <h2>Se produjo un error inesperado al cargar esta sección</h2>
          <p style={{ color: '#64748b', marginBottom: '20px' }}>{this.state.error?.toString()}</p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 20px',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Recargar Aplicación
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  // Authentication state
  const [currentUser, setCurrentUser] = useState(() => {
    const token = localStorage.getItem('sfti_jwt_token');
    return token ? { username: 'Administrador', token } : null;
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [useMock, setUseMock] = useState(api.useMock);
  const [searchGlobal, setSearchGlobal] = useState('');

  // Data states
  const [ordenes, setOrdenes] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [ordenToEdit, setOrdenToEdit] = useState(null);
  const [isApiConfigOpen, setIsApiConfigOpen] = useState(false);
  const [receiptOrden, setReceiptOrden] = useState(null);

  // Load data on mount & whenever API config updates
  const loadData = async () => {
    setLoading(true);
    try {
      const [techList, ordList, pagoList] = await Promise.all([
        api.getTecnicos(),
        api.getOrdenes(),
        api.getPagos()
      ]);
      setTecnicos(Array.isArray(techList) ? techList : []);
      setOrdenes(Array.isArray(ordList) ? ordList : []);
      setPagos(Array.isArray(pagoList) ? pagoList : []);
    } catch (e) {
      console.error('Error loading data:', e);
      setTecnicos([]);
      setOrdenes([]);
      setPagos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [useMock]);

  // Order Operations
  const handleSaveOrden = async (ordenData) => {
    if (ordenData.id) {
      await api.updateOrden(ordenData.id, ordenData);
    } else {
      await api.createOrden(ordenData);
    }
    await loadData();
  };

  const handleDeleteOrden = async (id) => {
    if (window.confirm('¿Está seguro de que desea eliminar esta orden de servicio?')) {
      await api.deleteOrden(id);
      await loadData();
    }
  };

  const handleBatchMarcarPagadas = async (ids) => {
    await api.procesarCierrePagos(ids);
    await loadData();
  };

  const handleProcesarCierre = async (ids) => {
    await api.procesarCierrePagos(ids);
    await loadData();
  };

  const handleCreateTecnico = async (name) => {
    await api.createTecnico(name);
    await loadData();
  };

  const handleSaveConfig = (newApiBase, newUseMock) => {
    setUseMock(newUseMock);
    loadData();
  };

  const handleLogout = () => {
    localStorage.removeItem('sfti_jwt_token');
    localStorage.removeItem('sfti_jwt_refresh');
    setCurrentUser(null);
  };

  if (!currentUser) {
    return <LoginView onLoginSuccess={(user) => {
      setCurrentUser(user);
      loadData();
    }} />;
  }

  return (
    <div className="app-container">
      {/* Navigation Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        useMock={useMock}
        onOpenApiConfig={() => setIsApiConfigOpen(true)}
      />

      {/* Main View Wrapper */}
      <div className="main-wrapper">
        {/* Top Header */}
        <Header 
          searchGlobal={searchGlobal}
          setSearchGlobal={setSearchGlobal}
          onOpenNewOrderModal={() => {
            setOrdenToEdit(null);
            setIsOrderModalOpen(true);
          }}
          onLogout={handleLogout}
          currentUser={currentUser}
        />

        {/* Content Body */}
        <main className="content-body">
          <ErrorBoundary key={activeTab}>
            {/* Section Heading */}
            <div className="page-title-section">
              <div>
                <h1>
                  {activeTab === 'dashboard' && 'Dashboard de Servicios'}
                  {activeTab === 'estadisticas' && 'Estadísticas & Analíticas'}
                  {activeTab === 'cierre' && 'Cierre de Pagos a Técnicos'}
                  {activeTab === 'historial' && 'Historial de Pagos a Técnicos'}
                  {activeTab === 'tecnicos' && 'Gestión de Técnicos'}
                  {activeTab === 'piezas' && 'Historial de Repuestos & Piezas'}
                </h1>
                <p>
                  {activeTab === 'dashboard' && 'Visión general de las órdenes de servicio, ingresos y métricas globales'}
                  {activeTab === 'estadisticas' && 'Análisis detallado de rendimiento por técnico, ingresos y métodos de pago'}
                  {activeTab === 'cierre' && 'Filtre órdenes pendientes y genere el reporte de liquidación para técnicos'}
                  {activeTab === 'historial' && 'Registro histórico de cierres de pago procesados, auditoría y descarga de reportes PDF'}
                  {activeTab === 'tecnicos' && 'Administre el personal técnico y consulte su rendimiento financiero'}
                  {activeTab === 'piezas' && 'Consolidado de piezas de repuesto utilizadas en servicios'}
                </p>
              </div>
            </div>

            {/* Render Active View Tab */}
            {activeTab === 'dashboard' && (
              <>
                {/* Summary Metric Cards */}
                <MetricCards ordenes={ordenes} />

                {/* Main Service Orders Table */}
                <OrderTable 
                  ordenes={ordenes}
                  tecnicos={tecnicos}
                  searchGlobal={searchGlobal}
                  onEditOrden={(ord) => {
                    setOrdenToEdit(ord);
                    setIsOrderModalOpen(true);
                  }}
                  onDeleteOrden={handleDeleteOrden}
                  onBatchMarcarPagadas={handleBatchMarcarPagadas}
                  onGoToCierre={() => setActiveTab('cierre')}
                  onOpenNewOrderModal={() => {
                    setOrdenToEdit(null);
                    setIsOrderModalOpen(true);
                  }}
                  onPrintOrdenReceipt={(ord) => setReceiptOrden(ord)}
                />
              </>
            )}

            {activeTab === 'estadisticas' && (
              <EstadisticasView ordenes={ordenes} tecnicos={tecnicos} />
            )}

            {activeTab === 'cierre' && (
              <CierrePagos 
                ordenes={ordenes}
                tecnicos={tecnicos}
                pagosHistorial={pagos}
                onProcesarCierre={handleProcesarCierre}
              />
            )}

            {activeTab === 'historial' && (
              <HistorialPagosView 
                pagosHistorial={pagos}
                ordenes={ordenes}
                tecnicos={tecnicos}
              />
            )}

            {activeTab === 'tecnicos' && (
              <TecnicosView 
                tecnicos={tecnicos}
                ordenes={ordenes}
                onCreateTecnico={handleCreateTecnico}
              />
            )}

            {activeTab === 'piezas' && (
              <PiezasView ordenes={ordenes} />
            )}
          </ErrorBoundary>
        </main>
      </div>

      {/* Order Create / Edit Modal */}
      <OrderModal 
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        onSave={handleSaveOrden}
        ordenToEdit={ordenToEdit}
        tecnicos={tecnicos}
      />

      {/* API Configuration Modal */}
      <ApiConfigModal 
        isOpen={isApiConfigOpen}
        onClose={() => setIsApiConfigOpen(false)}
        onSaveConfig={handleSaveConfig}
      />

      {/* Single Order Receipt Print Modal */}
      {receiptOrden && (
        <div className="modal-overlay">
          <div className="modal-content printable-area" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h2>COMPROBANTE DE ORDEN #{receiptOrden.numero_orden}</h2>
              <button className="icon-btn" onClick={() => setReceiptOrden(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <div className="receipt-box">
                <div style={{ textAlign: 'center', marginBottom: '16px', borderBottom: '1px dashed #cbd5e1', paddingBottom: '12px' }}>
                  <h3 style={{ fontSize: '1.2rem' }}>SERVEL SFTI</h3>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Comprobante de Servicio Técnico</span>
                </div>
                <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <p><strong>N° Orden:</strong> #{receiptOrden.numero_orden}</p>
                  <p><strong>Técnico:</strong> {receiptOrden.tecnico_nombre}</p>
                  <p><strong>Estatus:</strong> {receiptOrden.status === 'paid' ? 'PAGADO' : 'PENDIENTE'}</p>
                  <p><strong>Facturado:</strong> {receiptOrden.facturado ? 'Sí (16% IVA)' : 'No'}</p>
                  <p><strong>Método Pago:</strong> {receiptOrden.metodo_pago}</p>
                  <p><strong>Fecha:</strong> {new Date(receiptOrden.fecha_creacion).toLocaleString('es-ES')}</p>
                  <div style={{ borderTop: '1px dashed #cbd5e1', margin: '10px 0' }}></div>
                  <p>Subtotal: {formatCurrency(receiptOrden.subtotal)}</p>
                  <p>IVA: {formatCurrency(receiptOrden.iva)}</p>
                  <p>Piezas: {formatCurrency(receiptOrden.total_piezas)}</p>
                  <p style={{ fontSize: '1.1rem', fontWeight: 'bold', marginTop: '6px' }}>
                    TOTAL: {formatCurrency(receiptOrden.total)}
                  </p>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setReceiptOrden(null)}>
                Cerrar
              </button>
              <button className="btn btn-primary" onClick={() => window.print()}>
                <Printer size={16} />
                <span>Imprimir</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
