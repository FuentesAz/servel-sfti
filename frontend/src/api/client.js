// API client for Django REST Framework (DRF) backend + Fallback Mock Store

const DEFAULT_API_BASE = '/api/v1';

// Initial Mock Data derived directly from user Django database schema & reference image
const initialMockTecnicos = [
  { id: 1, name: 'Angel' },
  { id: 2, name: 'Jonatan' },
  { id: 3, name: 'Moises' },
];

const initialMockOrdenes = [
  {
    id: 706,
    numero_orden: '706',
    tecnico: 3,
    tecnico_nombre: 'Moises',
    status: 'pending',
    costo_servicio: 950.00,
    facturado: false,
    metodo_pago: 'cash',
    subtotal: 950.00,
    iva: 0.00,
    total: 950.00,
    total_piezas: 0.00,
    comision: 475.00,
    ganancia_taller: 475.00,
    fecha_creacion: '2026-07-25T14:08:00Z',
    fecha_cierre: null,
    pago_tecnico: null,
    piezas: []
  },
  {
    id: 737,
    numero_orden: '737',
    tecnico: 3,
    tecnico_nombre: 'Moises',
    status: 'pending',
    costo_servicio: 250.00,
    facturado: false,
    metodo_pago: 'cash',
    subtotal: 250.00,
    iva: 0.00,
    total: 250.00,
    total_piezas: 0.00,
    comision: 125.00,
    ganancia_taller: 125.00,
    fecha_creacion: '2026-07-25T14:08:00Z',
    fecha_cierre: null,
    pago_tecnico: null,
    piezas: []
  },
  {
    id: 729,
    numero_orden: '729',
    tecnico: 2,
    tecnico_nombre: 'Jonatan',
    status: 'pending',
    costo_servicio: 200.00,
    facturado: false,
    metodo_pago: 'transfer',
    subtotal: 200.00,
    iva: 0.00,
    total: 200.00,
    total_piezas: 0.00,
    comision: 100.00,
    ganancia_taller: 100.00,
    fecha_creacion: '2026-07-25T14:07:00Z',
    fecha_cierre: null,
    pago_tecnico: null,
    piezas: []
  },
  {
    id: 735,
    numero_orden: '735',
    tecnico: 2,
    tecnico_nombre: 'Jonatan',
    status: 'pending',
    costo_servicio: 500.00,
    facturado: false,
    metodo_pago: 'cash',
    subtotal: 500.00,
    iva: 0.00,
    total: 500.00,
    total_piezas: 0.00,
    comision: 250.00,
    ganancia_taller: 250.00,
    fecha_creacion: '2026-07-25T14:07:00Z',
    fecha_cierre: null,
    pago_tecnico: null,
    piezas: []
  },
  {
    id: 732,
    numero_orden: '732',
    tecnico: 1,
    tecnico_nombre: 'Angel',
    status: 'paid',
    costo_servicio: 754.00,
    facturado: true,
    metodo_pago: 'card',
    subtotal: 650.00,
    iva: 104.00,
    total: 754.00,
    total_piezas: 0.00,
    comision: 325.00,
    ganancia_taller: 325.00,
    fecha_creacion: '2026-07-25T14:06:00Z',
    fecha_cierre: '2026-07-27T16:58:00Z',
    pago_tecnico: 1,
    piezas: []
  },
  {
    id: 742,
    numero_orden: '742',
    tecnico: 1,
    tecnico_nombre: 'Angel',
    status: 'paid',
    costo_servicio: 450.00,
    facturado: false,
    metodo_pago: 'cash',
    subtotal: 450.00,
    iva: 0.00,
    total: 450.00,
    total_piezas: 0.00,
    comision: 225.00,
    ganancia_taller: 225.00,
    fecha_creacion: '2026-07-25T14:04:00Z',
    fecha_cierre: '2026-07-27T16:58:00Z',
    pago_tecnico: 1,
    piezas: []
  },
  {
    id: 722,
    numero_orden: '722',
    tecnico: 1,
    tecnico_nombre: 'Angel',
    status: 'paid',
    costo_servicio: 950.00,
    facturado: false,
    metodo_pago: 'cash',
    subtotal: 950.00,
    iva: 0.00,
    total: 950.00,
    total_piezas: 0.00,
    comision: 475.00,
    ganancia_taller: 475.00,
    fecha_creacion: '2026-07-25T14:04:00Z',
    fecha_cierre: '2026-07-27T16:58:00Z',
    pago_tecnico: 1,
    piezas: []
  },
  {
    id: 723,
    numero_orden: '723',
    tecnico: 1,
    tecnico_nombre: 'Angel',
    status: 'paid',
    costo_servicio: 1000.00,
    facturado: false,
    metodo_pago: 'transfer',
    subtotal: 1000.00,
    iva: 0.00,
    total: 1000.00,
    total_piezas: 0.00,
    comision: 500.00,
    ganancia_taller: 500.00,
    fecha_creacion: '2026-07-25T14:03:00Z',
    fecha_cierre: '2026-07-27T16:58:00Z',
    pago_tecnico: 1,
    piezas: []
  },
  {
    id: 702,
    numero_orden: '702',
    tecnico: 1,
    tecnico_nombre: 'Angel',
    status: 'paid',
    costo_servicio: 1400.00,
    facturado: false,
    metodo_pago: 'cash',
    subtotal: 1400.00,
    iva: 0.00,
    total: 1400.00,
    total_piezas: 0.00,
    comision: 700.00,
    ganancia_taller: 700.00,
    fecha_creacion: '2026-07-25T14:03:00Z',
    fecha_cierre: '2026-07-27T16:58:00Z',
    pago_tecnico: 1,
    piezas: []
  },
  {
    id: 739,
    numero_orden: '739',
    tecnico: 1,
    tecnico_nombre: 'Angel',
    status: 'paid',
    costo_servicio: 650.00,
    facturado: false,
    metodo_pago: 'cash',
    subtotal: 650.00,
    iva: 0.00,
    total: 650.00,
    total_piezas: 0.00,
    comision: 325.00,
    ganancia_taller: 325.00,
    fecha_creacion: '2026-07-25T14:02:00Z',
    fecha_cierre: '2026-07-27T16:58:00Z',
    pago_tecnico: 1,
    piezas: []
  },
  {
    id: 725,
    numero_orden: '725',
    tecnico: 1,
    tecnico_nombre: 'Angel',
    status: 'paid',
    costo_servicio: 1500.00,
    facturado: false,
    metodo_pago: 'cash',
    subtotal: 1500.00,
    iva: 0.00,
    total: 1500.00,
    total_piezas: 0.00,
    comision: 750.00,
    ganancia_taller: 750.00,
    fecha_creacion: '2026-07-25T14:01:00Z',
    fecha_cierre: '2026-07-27T16:58:00Z',
    pago_tecnico: 1,
    piezas: []
  },
  {
    id: 712,
    numero_orden: '712',
    tecnico: 1,
    tecnico_nombre: 'Angel',
    status: 'paid',
    costo_servicio: 1264.40,
    facturado: true,
    metodo_pago: 'card',
    subtotal: 1090.00,
    iva: 174.40,
    total: 1264.40,
    total_piezas: 0.00,
    comision: 545.00,
    ganancia_taller: 545.00,
    fecha_creacion: '2026-07-13T17:08:00Z',
    fecha_cierre: '2026-07-27T16:58:00Z',
    pago_tecnico: 1,
    piezas: []
  }
];

const initialMockPagos = [
  {
    id: 1,
    fecha_pago: '2026-07-27',
    total_ordenes: 8,
    ingreso_total: 7968.40,
    total_comision: 3845.00,
    total_iva: 278.40,
    total_piezas: 0.00
  }
];

class ApiService {
  constructor() {
    let savedBase = localStorage.getItem('sfti_api_base');
    if (!savedBase || savedBase === 'http://localhost:8000/api/v1') {
      savedBase = DEFAULT_API_BASE;
      localStorage.setItem('sfti_api_base', DEFAULT_API_BASE);
    }
    this.apiBase = savedBase || DEFAULT_API_BASE;

    // Default to LIVE Django REST Mode (useMock = false) for all devices
    const savedMock = localStorage.getItem('sfti_use_mock');
    if (savedMock === 'true') {
      this.useMock = true;
    } else {
      this.useMock = false;
      localStorage.setItem('sfti_use_mock', 'false');
    }

    this.token = localStorage.getItem('sfti_jwt_token') || null;

    // Load mock storage from localStorage if available
    this.mockTecnicos = JSON.parse(localStorage.getItem('sfti_mock_tecnicos')) || initialMockTecnicos;
    this.mockOrdenes = JSON.parse(localStorage.getItem('sfti_mock_ordenes')) || initialMockOrdenes;
    this.mockPagos = JSON.parse(localStorage.getItem('sfti_mock_pagos')) || initialMockPagos;
  }

  saveMockState() {
    localStorage.setItem('sfti_mock_tecnicos', JSON.stringify(this.mockTecnicos));
    localStorage.setItem('sfti_mock_ordenes', JSON.stringify(this.mockOrdenes));
    localStorage.setItem('sfti_mock_pagos', JSON.stringify(this.mockPagos));
  }

  setUseMock(val) {
    this.useMock = val;
    localStorage.setItem('sfti_use_mock', val ? 'true' : 'false');
  }

  setApiBase(url) {
    this.apiBase = url;
    localStorage.setItem('sfti_api_base', url);
  }

  // --- TECNICOS ---
  async getTecnicos() {
    if (this.useMock) return Array.isArray(this.mockTecnicos) ? [...this.mockTecnicos] : [];
    try {
      const res = await fetch(`${this.apiBase}/tecnicos/`);
      if (!res.ok) throw new Error('API Error');
      const data = await res.json();
      if (Array.isArray(data.results)) return data.results;
      if (Array.isArray(data)) return data;
      return Array.isArray(this.mockTecnicos) ? [...this.mockTecnicos] : [];
    } catch (e) {
      console.warn('Falling back to mock data for Tecnicos:', e);
      return Array.isArray(this.mockTecnicos) ? [...this.mockTecnicos] : [];
    }
  }

  async createTecnico(name) {
    if (this.useMock) {
      const newTech = { id: Date.now(), name };
      this.mockTecnicos.push(newTech);
      this.saveMockState();
      return newTech;
    }
    const res = await fetch(`${this.apiBase}/tecnicos/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });
    return await res.json();
  }

  // --- ORDENES DE SERVICIO ---
  async getOrdenes() {
    if (this.useMock) return Array.isArray(this.mockOrdenes) ? [...this.mockOrdenes] : [];
    try {
      const res = await fetch(`${this.apiBase}/ordenes/?page_size=1000`);
      if (!res.ok) throw new Error('API Error');
      const data = await res.json();
      if (Array.isArray(data.results)) return data.results;
      if (Array.isArray(data)) return data;
      return Array.isArray(this.mockOrdenes) ? [...this.mockOrdenes] : [];
    } catch (e) {
      console.warn('Falling back to mock data for Ordenes:', e);
      return Array.isArray(this.mockOrdenes) ? [...this.mockOrdenes] : [];
    }
  }

  async createOrden(ordenData) {
    // Save logic reflecting Django model save() logic
    const costo = parseFloat(ordenData.costo_servicio) || 0;
    const facturado = !!ordenData.facturado;
    const piezasList = ordenData.piezas || [];
    const totalPiezas = piezasList.reduce((acc, p) => acc + (parseFloat(p.costo) || 0), 0);
    
    let subtotal = costo;
    let iva = 0;
    if (facturado) {
      subtotal = costo / 1.16;
      iva = costo - subtotal;
    }
    const comision = subtotal / 2;
    const ganancia = subtotal / 2;
    const total = costo + totalPiezas;

    const techObj = this.mockTecnicos.find(t => t.id === parseInt(ordenData.tecnico)) || { name: 'Técnico' };

    if (this.useMock) {
      const newOrd = {
        id: Date.now(),
        numero_orden: ordenData.numero_orden || `${Math.floor(100 + Math.random() * 900)}`,
        tecnico: parseInt(ordenData.tecnico),
        tecnico_nombre: techObj.name,
        status: ordenData.status || 'pending',
        costo_servicio: costo,
        facturado: facturado,
        metodo_pago: ordenData.metodo_pago || 'cash',
        subtotal: parseFloat(subtotal.toFixed(2)),
        iva: parseFloat(iva.toFixed(2)),
        total: parseFloat(total.toFixed(2)),
        total_piezas: parseFloat(totalPiezas.toFixed(2)),
        comision: parseFloat(comision.toFixed(2)),
        ganancia_taller: parseFloat(ganancia.toFixed(2)),
        fecha_creacion: new Date().toISOString(),
        fecha_cierre: ordenData.status === 'paid' ? new Date().toISOString() : null,
        pago_tecnico: null,
        piezas: piezasList
      };

      this.mockOrdenes.unshift(newOrd);
      this.saveMockState();
      return newOrd;
    }

    const res = await fetch(`${this.apiBase}/ordenes/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        numero_orden: ordenData.numero_orden,
        tecnico: ordenData.tecnico,
        costo_servicio: ordenData.costo_servicio,
        facturado: ordenData.facturado,
        metodo_pago: ordenData.metodo_pago,
        status: ordenData.status
      })
    });
    const createdOrder = await res.json();

    if (createdOrder.id && piezasList.length > 0) {
      for (const p of piezasList) {
        await fetch(`${this.apiBase}/piezas/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orden_servicio: createdOrder.id,
            nombre: p.nombre,
            costo: parseFloat(p.costo) || 0,
            metodo_pago: p.metodo_pago || 'cash',
            comentarios: p.comentarios || ''
          })
        });
      }
    }

    return createdOrder;
  }

  async updateOrden(id, updates) {
    if (this.useMock) {
      const index = this.mockOrdenes.findIndex(o => o.id === id);
      if (index !== -1) {
        this.mockOrdenes[index] = { ...this.mockOrdenes[index], ...updates };
        this.saveMockState();
        return this.mockOrdenes[index];
      }
    }
    const res = await fetch(`${this.apiBase}/ordenes/${id}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return await res.json();
  }

  async deleteOrden(id) {
    if (this.useMock) {
      this.mockOrdenes = this.mockOrdenes.filter(o => o.id !== id);
      this.saveMockState();
      return true;
    }
    await fetch(`${this.apiBase}/ordenes/${id}/`, { method: 'DELETE' });
    return true;
  }

  // --- BATCH MARCAR COMO PAGADAS & CIERRE DE PAGOS ---
  async procesarCierrePagos(ordenesIds) {
    const idSet = new Set((ordenesIds || []).map(id => String(id)));
    const targetOrders = this.mockOrdenes.filter(o => idSet.has(String(o.id)));
    const totalOrdenes = targetOrders.length;
    const ingresoTotal = targetOrders.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);
    const totalComision = targetOrders.reduce((sum, o) => sum + (parseFloat(o.comision) || 0), 0);
    const totalIva = targetOrders.reduce((sum, o) => sum + (parseFloat(o.iva) || 0), 0);
    const totalPiezas = targetOrders.reduce((sum, o) => sum + (parseFloat(o.total_piezas) || 0), 0);

    const now = new Date().toISOString();

    const nuevoPago = {
      id: Date.now(),
      fecha_pago: now.split('T')[0],
      total_ordenes: totalOrdenes,
      ingreso_total: parseFloat(ingresoTotal.toFixed(2)),
      total_comision: parseFloat(totalComision.toFixed(2)),
      total_iva: parseFloat(totalIva.toFixed(2)),
      total_piezas: parseFloat(totalPiezas.toFixed(2)),
      ordenes: targetOrders.map(o => ({
        ...o,
        status: 'paid',
        fecha_cierre: now,
      }))
    };

    // Synchronize local mock storage
    this.mockPagos.unshift(nuevoPago);
    this.mockOrdenes = this.mockOrdenes.map(o => {
      if (idSet.has(String(o.id))) {
        return {
          ...o,
          status: 'paid',
          fecha_cierre: now,
          pago_tecnico: nuevoPago.id,
          pago_tecnico_id: nuevoPago.id
        };
      }
      return o;
    });
    this.saveMockState();

    if (this.useMock) {
      return { pago: nuevoPago, ordenesActualizadas: targetOrders };
    }

    try {
      const headers = { 'Content-Type': 'application/json' };
      const token = localStorage.getItem('sfti_jwt_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${this.apiBase}/ordenes/procesar_cierre/`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ ordenes_ids: ordenesIds })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.detail || `Error ${res.status} al procesar el cierre de pagos`);
      }

      return await res.json();
    } catch (e) {
      console.warn('Error en API real al procesar cierre, usando resultado local:', e);
      return { pago: nuevoPago, ordenesActualizadas: targetOrders };
    }
  }

  async getPagos() {
    if (this.useMock) return Array.isArray(this.mockPagos) ? [...this.mockPagos] : [];
    try {
      const res = await fetch(`${this.apiBase}/pagos/`);
      if (!res.ok) throw new Error('API Error');
      const data = await res.json();
      if (Array.isArray(data.results)) return data.results;
      if (Array.isArray(data)) return data;
      return Array.isArray(this.mockPagos) ? [...this.mockPagos] : [];
    } catch (e) {
      return Array.isArray(this.mockPagos) ? [...this.mockPagos] : [];
    }
  }

  // --- LOGIN & AUTHENTICATION ---
  async loginUser(username, password) {
    const cleanUser = (username || '').trim();
    const cleanPass = (password || '').trim();

    if (!cleanUser || !cleanPass) {
      throw new Error('Por favor ingrese su usuario y contraseña');
    }

    if (this.useMock) {
      localStorage.setItem('sfti_jwt_token', 'demo_mock_jwt_token_servel_sfti');
      return { username: cleanUser, token: 'demo_token' };
    }

    const tokenUrl = `${this.apiBase.replace(/\/v1\/?$/, '')}/token`;
    const endpointsToTry = Array.from(new Set([tokenUrl, '/api/token']));

    let lastError = 'Usuario o contraseña incorrectos';

    for (const url of endpointsToTry) {
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: cleanUser, password: cleanPass })
        });

        if (res.ok) {
          const data = await res.json();
          localStorage.setItem('sfti_jwt_token', data.access);
          if (data.refresh) localStorage.setItem('sfti_jwt_refresh', data.refresh);
          return { username: cleanUser, token: data.access };
        } else {
          const errData = await res.json().catch(() => ({}));
          if (errData.detail) lastError = errData.detail;
        }
      } catch (e) {
        console.warn(`Error attempting login at ${url}:`, e);
      }
    }

    // Check if user account is pending approval
    try {
      const statusRes = await this.checkUserStatus(cleanUser);
      if (statusRes && statusRes.status === 'pending') {
        throw new Error('Tu cuenta fue registrada pero está pendiente de autorización por el administrador.');
      }
    } catch (e) {
      // Ignore check status error
    }

    throw new Error(lastError);
  }

  // --- REGISTRO Y GESTION DE USUARIOS PENDIENTES ---
  async registerUser(userData) {

    if (this.useMock) {
      const pendingList = JSON.parse(localStorage.getItem('sfti_mock_pending_users')) || [];
      const newUser = {
        id: Date.now(),
        username: userData.username,
        email: userData.email || '',
        first_name: userData.first_name || '',
        date_joined: new Date().toISOString(),
        is_active: false
      };
      pendingList.push(newUser);
      localStorage.setItem('sfti_mock_pending_users', JSON.stringify(pendingList));
      return { detail: 'Solicitud de registro enviada con éxito. Tu cuenta debe ser aprobada por el administrador.' };
    }

    const res = await fetch(`${this.apiBase}/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Error al registrar el usuario');
    return data;
  }

  async getPendingUsers() {
    if (this.useMock) {
      return JSON.parse(localStorage.getItem('sfti_mock_pending_users')) || [];
    }
    try {
      const res = await fetch(`${this.apiBase}/users/pending/`);
      if (!res.ok) return [];
      return await res.json();
    } catch (e) {
      return JSON.parse(localStorage.getItem('sfti_mock_pending_users')) || [];
    }
  }

  async approveUser(userId) {
    if (this.useMock) {
      let pendingList = JSON.parse(localStorage.getItem('sfti_mock_pending_users')) || [];
      pendingList = pendingList.filter(u => u.id !== userId);
      localStorage.setItem('sfti_mock_pending_users', JSON.stringify(pendingList));
      return { detail: 'Usuario aprobado.' };
    }
    const res = await fetch(`${this.apiBase}/users/${userId}/approve/`, { method: 'POST' });
    return await res.json();
  }

  async rejectUser(userId) {
    if (this.useMock) {
      let pendingList = JSON.parse(localStorage.getItem('sfti_mock_pending_users')) || [];
      pendingList = pendingList.filter(u => u.id !== userId);
      localStorage.setItem('sfti_mock_pending_users', JSON.stringify(pendingList));
      return { detail: 'Usuario rechazado.' };
    }
    const res = await fetch(`${this.apiBase}/users/${userId}/reject/`, { method: 'POST' });
    return await res.json();
  }

  async checkUserStatus(username) {
    if (this.useMock) {
      const pendingList = JSON.parse(localStorage.getItem('sfti_mock_pending_users')) || [];
      const isPending = pendingList.some(u => u.username.toLowerCase() === username.toLowerCase());
      if (isPending) return { status: 'pending' };
      return { status: 'unknown' };
    }
    try {
      const res = await fetch(`${this.apiBase}/users/check-status/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      });
      return await res.json();
    } catch (e) {
      return { status: 'unknown' };
    }
  }
}

export const api = new ApiService();

