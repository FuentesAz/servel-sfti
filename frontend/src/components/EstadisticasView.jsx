import React, { useState, useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend
} from 'recharts';
import { 
  TrendingUp, 
  DollarSign, 
  Percent, 
  Award,
  Wrench, 
  BarChart3, 
  CreditCard,
  Building2,
  CheckCircle2,
  Calendar,
  FileText,
  Filter,
  RotateCcw
} from 'lucide-react';

export default function EstadisticasView({ ordenes = [], tecnicos = [] }) {
  // Date Range Filter States (Default: All Time or Custom Range)
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [presetActive, setPresetActive] = useState('todo');

  // Safe array references
  const safeOrdenes = Array.isArray(ordenes) ? ordenes : [];
  const safeTecnicos = Array.isArray(tecnicos) ? tecnicos : [];

  // Helper preset handlers
  const applyPreset = (presetKey) => {
    setPresetActive(presetKey);
    const today = new Date();
    
    if (presetKey === 'esteMes') {
      const start = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
      const end = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
      setFechaInicio(start);
      setFechaFin(end);
    } else if (presetKey === 'mesAnterior') {
      const start = new Date(today.getFullYear(), today.getMonth() - 1, 1).toISOString().split('T')[0];
      const end = new Date(today.getFullYear(), today.getMonth(), 0).toISOString().split('T')[0];
      setFechaInicio(start);
      setFechaFin(end);
    } else if (presetKey === 'ultimos30') {
      const end = today.toISOString().split('T')[0];
      const startObj = new Date();
      startObj.setDate(today.getDate() - 30);
      const start = startObj.toISOString().split('T')[0];
      setFechaInicio(start);
      setFechaFin(end);
    } else if (presetKey === 'julio2026') {
      setFechaInicio('2026-07-01');
      setFechaFin('2026-07-31');
    } else if (presetKey === 'todo') {
      setFechaInicio('');
      setFechaFin('');
    }
  };

  // Filter ordenes by date range
  const ordenesFiltradas = useMemo(() => {
    return safeOrdenes.filter(o => {
      if (!o || !o.fecha_creacion) return true;
      const f = o.fecha_creacion.split('T')[0];
      if (fechaInicio && f < fechaInicio) return false;
      if (fechaFin && f > fechaFin) return false;
      return true;
    });
  }, [ordenes, fechaInicio, fechaFin]);

  // 1. Calculate Summary Analytics KPIs
  const analyticsSummary = useMemo(() => {
    const totalCount = ordenesFiltradas.length;
    const totalIngresos = ordenesFiltradas.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);
    const totalSubtotal = ordenesFiltradas.reduce((sum, o) => sum + (parseFloat(o.subtotal) || 0), 0);
    const totalComisiones = ordenesFiltradas.reduce((sum, o) => sum + (parseFloat(o.comision) || 0), 0);
    const totalGananciaTaller = ordenesFiltradas.reduce((sum, o) => sum + (parseFloat(o.ganancia_taller) || 0), 0);
    const totalIva = ordenesFiltradas.reduce((sum, o) => sum + (parseFloat(o.iva) || 0), 0);
    const totalPiezas = ordenesFiltradas.reduce((sum, o) => sum + (parseFloat(o.total_piezas) || 0), 0);

    const facturadasCount = ordenesFiltradas.filter(o => o.facturado).length;
    const pagadasCount = ordenesFiltradas.filter(o => o.status === 'paid').length;

    const denominator = totalCount > 0 ? totalCount : 1;
    const ticketPromedio = totalIngresos / denominator;
    const tasaFacturacion = totalCount > 0 ? (facturadasCount / totalCount) * 100 : 0;
    const tasaPago = totalCount > 0 ? (pagadasCount / totalCount) * 100 : 0;
    const gananciaPromedioTaller = totalGananciaTaller / denominator;

    return {
      totalCount,
      totalIngresos,
      totalSubtotal,
      totalComisiones,
      totalGananciaTaller,
      totalIva,
      totalPiezas,
      ticketPromedio,
      tasaFacturacion,
      tasaPago,
      gananciaPromedioTaller,
      facturadasCount,
      pagadasCount
    };
  }, [ordenesFiltradas]);

  // 2. Bar Chart Data: Ingresos & Comisiones por Técnico en el período
  const dataByTecnico = useMemo(() => {
    return safeTecnicos.map(tech => {
      const techOrders = ordenesFiltradas.filter(o => o.tecnico === tech.id);
      const totalGen = techOrders.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);
      const totalCom = techOrders.reduce((sum, o) => sum + (parseFloat(o.comision) || 0), 0);
      const totalGan = techOrders.reduce((sum, o) => sum + (parseFloat(o.ganancia_taller) || 0), 0);

      return {
        name: tech.name,
        ordenesCount: techOrders.length,
        Ingresos: parseFloat(totalGen.toFixed(2)),
        ComisionTecnico: parseFloat(totalCom.toFixed(2)),
        GananciaTaller: parseFloat(totalGan.toFixed(2))
      };
    });
  }, [ordenesFiltradas, tecnicos]);

  // 3. Donut Chart Data: Métodos de Pago
  const dataMetodosPago = useMemo(() => {
    const cashCount = ordenesFiltradas.filter(o => o.metodo_pago === 'cash').length;
    const transferCount = ordenesFiltradas.filter(o => o.metodo_pago === 'transfer').length;
    const cardCount = ordenesFiltradas.filter(o => o.metodo_pago === 'card').length;

    return [
      { name: 'Efectivo', value: cashCount, color: '#10b981' },
      { name: 'Transferencia', value: transferCount, color: '#3b82f6' },
      { name: 'Tarjeta', value: cardCount, color: '#8b5cf6' }
    ].filter(item => item.value > 0);
  }, [ordenesFiltradas]);

  // 4. Donut Chart Data: Facturación (Facturado vs No Facturado)
  const dataFacturacion = useMemo(() => {
    const si = ordenesFiltradas.filter(o => o.facturado).length;
    const no = ordenesFiltradas.filter(o => !o.facturado).length;

    return [
      { name: 'Facturado (Sí)', value: si, color: '#0284c7' },
      { name: 'Sin Factura (No)', value: no, color: '#94a3b8' }
    ];
  }, [ordenesFiltradas]);

  // 5. Piezas Ranking en el período
  const topPiezas = useMemo(() => {
    const list = [];
    ordenesFiltradas.forEach(o => {
      if (o.piezas && Array.isArray(o.piezas)) {
        o.piezas.forEach(p => {
          list.push(p);
        });
      }
    });

    const counts = {};
    list.forEach(p => {
      const name = p.nombre || 'Sin nombre';
      if (!counts[name]) {
        counts[name] = { name, count: 0, totalCosto: 0 };
      }
      counts[name].count += 1;
      counts[name].totalCosto += parseFloat(p.costo) || 0;
    });

    return Object.values(counts).sort((a, b) => b.totalCosto - a.totalCosto).slice(0, 5);
  }, [ordenesFiltradas]);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(val || 0);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Date Filter Bar & Quick Presets */}
      <div className="filter-bar-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>
            <Calendar size={18} color="#2563eb" />
            <span>Rango de Fecha:</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input 
              type="date"
              className="input-control"
              value={fechaInicio}
              onChange={(e) => {
                setFechaInicio(e.target.value);
                setPresetActive('custom');
              }}
            />
            <span style={{ color: '#64748b' }}>a</span>
            <input 
              type="date"
              className="input-control"
              value={fechaFin}
              onChange={(e) => {
                setFechaFin(e.target.value);
                setPresetActive('custom');
              }}
            />
          </div>

          <div style={{ width: '1px', height: '24px', backgroundColor: '#e2e8f0', margin: '0 6px' }}></div>

          {/* Quick Presets */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <button 
              className={`btn btn-sm ${presetActive === 'esteMes' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => applyPreset('esteMes')}
            >
              Este Mes
            </button>
            <button 
              className={`btn btn-sm ${presetActive === 'mesAnterior' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => applyPreset('mesAnterior')}
            >
              Mes Anterior
            </button>
            <button 
              className={`btn btn-sm ${presetActive === 'ultimos30' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => applyPreset('ultimos30')}
            >
              Últimos 30 Días
            </button>
            <button 
              className={`btn btn-sm ${presetActive === 'todo' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => applyPreset('todo')}
            >
              Todo el Historial
            </button>
          </div>
        </div>
      </div>

      <div className="metrics-grid">
        {/* Total Órdenes Card */}
        <div className="metric-card accent-total">
          <div className="metric-header">
            <span className="metric-title">TOTAL ÓRDENES</span>
            <div className="metric-icon-box" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
              <FileText size={20} />
            </div>
          </div>
          <div className="metric-value">{analyticsSummary.totalCount}</div>
          <div className="metric-subtext">
            <span>{analyticsSummary.pagadasCount} pagadas / {analyticsSummary.totalCount - analyticsSummary.pagadasCount} pendientes</span>
          </div>
        </div>

        {/* Total Ingresos Card */}
        <div className="metric-card accent-revenue">
          <div className="metric-header">
            <span className="metric-title">TOTAL SERVICIO</span>
            <div className="metric-icon-box" style={{ backgroundColor: '#e0e7ff', color: '#4f46e5' }}>
              <DollarSign size={20} />
            </div>
          </div>
          <div className="metric-value">{formatCurrency(analyticsSummary.totalIngresos)}</div>
          <div className="metric-subtext">Monto total en el período</div>
        </div>

        {/* IVA Total Card */}
        <div className="metric-card accent-iva">
          <div className="metric-header">
            <span className="metric-title">IVA TOTAL</span>
            <div className="metric-icon-box" style={{ backgroundColor: '#fce7f3', color: '#db2777' }}>
              <Percent size={20} />
            </div>
          </div>
          <div className="metric-value">{formatCurrency(analyticsSummary.totalIva)}</div>
          <div className="metric-subtext">Órdenes facturadas ({analyticsSummary.facturadasCount})</div>
        </div>

        {/* Ingreso Piezas Card */}
        <div className="metric-card accent-parts">
          <div className="metric-header">
            <span className="metric-title">INGRESO PIEZAS</span>
            <div className="metric-icon-box" style={{ backgroundColor: '#f3e8ff', color: '#9333ea' }}>
              <Wrench size={20} />
            </div>
          </div>
          <div className="metric-value">{formatCurrency(analyticsSummary.totalPiezas)}</div>
          <div className="metric-subtext">Total repuestos en el período</div>
        </div>

        {/* Ticket Promedio */}
        <div className="metric-card accent-paid">
          <div className="metric-header">
            <span className="metric-title">TICKET PROMEDIO</span>
            <div className="metric-icon-box" style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}>
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="metric-value">{formatCurrency(analyticsSummary.ticketPromedio)}</div>
          <div className="metric-subtext">Promedio cobrado por orden</div>
        </div>

        {/* Ganancia Taller */}
        <div className="metric-card accent-total">
          <div className="metric-header">
            <span className="metric-title">GANANCIA TALLER (50%)</span>
            <div className="metric-icon-box" style={{ backgroundColor: '#e0f2fe', color: '#0284c7' }}>
              <Award size={20} />
            </div>
          </div>
          <div className="metric-value">{formatCurrency(analyticsSummary.totalGananciaTaller)}</div>
          <div className="metric-subtext">Utilidad neta del taller</div>
        </div>
      </div>

      {/* Main Charts Row 1: Bar Chart per Technician */}
      <div className="table-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart3 size={20} color="#2563eb" />
              <span>Rendimiento e Ingresos Generados por Técnico en el Período</span>
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Comparativa de Total Servicio vs Comisión del Técnico vs Ganancia del Taller
            </p>
          </div>
        </div>

        <div style={{ width: '100%', height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dataByTecnico} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={12} tickFormatter={(v) => `$${v}`} tickLine={false} />
              <Tooltip 
                formatter={(val) => formatCurrency(val)} 
                contentStyle={{ borderRadius: '10px', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
              />
              <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '0.85rem' }} />
              <Bar dataKey="Ingresos" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Total Servicio" />
              <Bar dataKey="ComisionTecnico" fill="#10b981" radius={[4, 4, 0, 0]} name="Comisión Técnico (50%)" />
              <Bar dataKey="GananciaTaller" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Ganancia Taller (50%)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 2: Donut Charts (Métodos de Pago & Facturación) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {/* Métodos de Pago Chart */}
        <div className="table-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <CreditCard size={18} color="#10b981" />
            <span>Distribución por Método de Pago</span>
          </h3>

          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dataMetodosPago}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {dataMetodosPago.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} órdenes`, 'Cantidad']} />
                <Legend wrapperStyle={{ fontSize: '0.85rem' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Facturación Chart */}
        <div className="table-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Building2 size={18} color="#0284c7" />
            <span>Proporción de Facturación</span>
          </h3>

          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dataFacturacion}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {dataFacturacion.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} órdenes`, 'Cantidad']} />
                <Legend wrapperStyle={{ fontSize: '0.85rem' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3: Desglose Financiero Global y Top Repuestos */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {/* Desglose Financiero Card */}
        <div className="table-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.05rem', marginBottom: '16px' }}>Estado Financiero en el Período</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
              <span style={{ color: '#64748b' }}>Total de Órdenes Atendidas:</span>
              <strong style={{ fontSize: '1.05rem' }}>{analyticsSummary.totalCount} órdenes</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
              <span style={{ color: '#64748b' }}>Total Servicio Bruto:</span>
              <strong style={{ fontSize: '1.05rem', color: '#0f172a' }}>{formatCurrency(analyticsSummary.totalIngresos)}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
              <span style={{ color: '#64748b' }}>Subtotal Neto Servicios:</span>
              <span>{formatCurrency(analyticsSummary.totalSubtotal)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
              <span style={{ color: '#16a34a', fontWeight: 600 }}>Comisión Técnicos (50%):</span>
              <strong style={{ color: '#16a34a' }}>{formatCurrency(analyticsSummary.totalComisiones)}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
              <span style={{ color: '#2563eb', fontWeight: 600 }}>Ganancia Taller (50%):</span>
              <strong style={{ color: '#2563eb' }}>{formatCurrency(analyticsSummary.totalGananciaTaller)}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
              <span style={{ color: '#db2777' }}>IVA Recaudado (16%):</span>
              <strong style={{ color: '#db2777' }}>{formatCurrency(analyticsSummary.totalIva)}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#9333ea' }}>Inversión en Piezas / Repuestos:</span>
              <strong style={{ color: '#9333ea' }}>{formatCurrency(analyticsSummary.totalPiezas)}</strong>
            </div>
          </div>
        </div>

        {/* Top Repuestos Used */}
        <div className="table-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.05rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Wrench size={18} color="#9333ea" />
            <span>Top Repuestos / Piezas en el Período</span>
          </h3>

          {topPiezas.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: '0.88rem', textAlign: 'center', padding: '24px' }}>
              No hay repuestos registrados en las órdenes de este período.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {topPiezas.map((pieza, idx) => (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                    <span style={{ fontWeight: 600 }}>{pieza.name}</span>
                    <strong style={{ color: '#9333ea' }}>{formatCurrency(pieza.totalCosto)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b' }}>
                    <span>Usado {pieza.count} vez(ces)</span>
                    <span>Promedio: {formatCurrency(pieza.totalCosto / pieza.count)}</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', backgroundColor: '#f3e8ff', borderRadius: '3px', overflow: 'hidden' }}>
                    <div 
                      style={{ 
                        height: '100%', 
                        backgroundColor: '#9333ea', 
                        width: `${Math.min(100, (pieza.totalCosto / (analyticsSummary.totalPiezas || 1)) * 100)}%` 
                      }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
