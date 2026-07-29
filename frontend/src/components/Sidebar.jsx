import { 
  LayoutDashboard, 
  BarChart3,
  Receipt, 
  History,
  Users, 
  Wrench, 
  Settings, 
  ShieldCheck,
  Building2,
  DollarSign
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, useMock, onOpenApiConfig }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard de Servicios', icon: LayoutDashboard },
    { id: 'estadisticas', label: 'Estadísticas & Analíticas', icon: BarChart3 },
    { id: 'cierre', label: 'Cierre de Pagos', icon: Receipt },
    { id: 'historial', label: 'Historial de Pagos', icon: History },
    { id: 'tecnicos', label: 'Técnicos', icon: Users },
    { id: 'piezas', label: 'Repuestos & Piezas', icon: Wrench },
  ];

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="sidebar-header">
        <div className="brand-logo-badge">
          <Building2 size={24} />
        </div>
        <div className="brand-info">
          <h2>Servel SFTI</h2>
          <span>Control de Servicios & Pagos</span>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="sidebar-menu">
        <div className="menu-category-title">Menú Principal</div>
        
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}

        <div className="menu-category-title" style={{ marginTop: '20px' }}>Sistema & Backend</div>
        
        <button
          className="sidebar-nav-item"
          onClick={onOpenApiConfig}
        >
          <Settings size={20} />
          <span>Configuración API</span>
        </button>
      </div>

      {/* Footer Info */}
      <div className="sidebar-footer">
        <div className="api-mode-card">
          <div className="api-status-badge">
            <span className={`dot-indicator ${useMock ? 'mock' : 'online'}`}></span>
            <span>{useMock ? 'Modo Demo (Mock Data)' : 'Conectado a Django REST'}</span>
          </div>
          <p style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
            Django 6.0 | REST API v1
          </p>
        </div>
      </div>
    </aside>
  );
}
