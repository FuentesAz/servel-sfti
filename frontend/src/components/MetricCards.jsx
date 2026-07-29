import React from 'react';
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  Award,
  Building2,
  TrendingUp,
  DollarSign
} from 'lucide-react';

export default function MetricCards({ ordenes = [] }) {
  const safeOrdenes = Array.isArray(ordenes) ? ordenes : [];

  const totalOrdenes = safeOrdenes.length;
  const pendientesCount = safeOrdenes.filter(o => o.status === 'pending').length;
  const pagadasCount = safeOrdenes.filter(o => o.status === 'paid').length;
  const facturadasCount = safeOrdenes.filter(o => o.facturado).length;

  const totalComisiones = safeOrdenes.reduce((acc, o) => acc + (parseFloat(o.comision) || 0), 0);
  const totalGananciaTaller = safeOrdenes.reduce((acc, o) => acc + (parseFloat(o.ganancia_taller) || 0), 0);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2
    }).format(val || 0);
  };

  const cardsData = [
    {
      title: 'Total Órdenes',
      value: totalOrdenes,
      subtext: `${pendientesCount} pendientes de pago`,
      icon: FileText,
      accentClass: 'accent-total',
      iconBg: '#eff6ff',
      iconColor: '#2563eb'
    },
    {
      title: 'Pendientes',
      value: pendientesCount,
      subtext: 'Requieren cierre de pago',
      icon: Clock,
      accentClass: 'accent-pending',
      iconBg: '#fef3c7',
      iconColor: '#d97706'
    },
    {
      title: 'Pagadas',
      value: pagadasCount,
      subtext: 'Completadas y saldadas',
      icon: CheckCircle2,
      accentClass: 'accent-paid',
      iconBg: '#dcfce7',
      iconColor: '#16a34a'
    },
    {
      title: 'Órdenes Facturadas',
      value: facturadasCount,
      subtext: 'Requieren comprobante fiscal',
      icon: Building2,
      accentClass: 'accent-iva',
      iconBg: '#e0f2fe',
      iconColor: '#0284c7'
    },
    {
      title: 'Ganancia Taller',
      value: formatCurrency(totalGananciaTaller),
      subtext: '50% Utilidad neta del taller',
      icon: Award,
      accentClass: 'accent-revenue',
      iconBg: '#e0e7ff',
      iconColor: '#4f46e5'
    },
    {
      title: 'Comisiones Técnicos',
      value: formatCurrency(totalComisiones),
      subtext: '50% Pago acumulado a técnicos',
      icon: DollarSign,
      accentClass: 'accent-parts',
      iconBg: '#f3e8ff',
      iconColor: '#9333ea'
    }
  ];

  return (
    <div className="metrics-grid">
      {cardsData.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div key={idx} className={`metric-card ${card.accentClass}`}>
            <div className="metric-header">
              <span className="metric-title">{card.title}</span>
              <div 
                className="metric-icon-box"
                style={{ backgroundColor: card.iconBg, color: card.iconColor }}
              >
                <Icon size={20} />
              </div>
            </div>
            <div className="metric-value">{card.value}</div>
            <div className="metric-subtext">
              <TrendingUp size={14} color="#10b981" />
              <span>{card.subtext}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
