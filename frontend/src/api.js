const API_BASE = '/api';

export const api = {
  // Database & Health
  getDbInfo: async () => {
    const res = await fetch(`${API_BASE}/database/info`);
    return res.json();
  },
  downloadExcelUrl: `${API_BASE}/database/download`,

  // Properties
  getProperties: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.listing_type) params.append('listing_type', filters.listing_type);
    if (filters.bhk) params.append('bhk', filters.bhk);
    if (filters.status) params.append('status', filters.status);
    if (filters.max_price) params.append('max_price', filters.max_price);
    const res = await fetch(`${API_BASE}/properties?${params.toString()}`);
    return res.json();
  },
  getProperty: async (id) => {
    const res = await fetch(`${API_BASE}/properties/${id}`);
    return res.json();
  },
  createProperty: async (data) => {
    const res = await fetch(`${API_BASE}/properties`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  updateProperty: async (id, data) => {
    const res = await fetch(`${API_BASE}/properties/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  deleteProperty: async (id) => {
    const res = await fetch(`${API_BASE}/properties/${id}`, { method: 'DELETE' });
    return res.json();
  },
  getPropertyMatches: async (id) => {
    const res = await fetch(`${API_BASE}/properties/${id}/matches`);
    return res.json();
  },

  // Leads CRM
  getLeads: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.client_type) params.append('client_type', filters.client_type);
    if (filters.status) params.append('status', filters.status);
    const res = await fetch(`${API_BASE}/leads?${params.toString()}`);
    return res.json();
  },
  createLead: async (data) => {
    const res = await fetch(`${API_BASE}/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  updateLead: async (id, data) => {
    const res = await fetch(`${API_BASE}/leads/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  deleteLead: async (id) => {
    const res = await fetch(`${API_BASE}/leads/${id}`, { method: 'DELETE' });
    return res.json();
  },
  getLeadMatches: async (id) => {
    const res = await fetch(`${API_BASE}/leads/${id}/matches`);
    return res.json();
  },

  // WhatsApp Ingestion
  previewWhatsAppText: async (text) => {
    const formData = new FormData();
    formData.append('text', text);
    const res = await fetch(`${API_BASE}/ingest/preview`, {
      method: 'POST',
      body: formData
    });
    return res.json();
  },
  ingestWhatsAppText: async (text) => {
    const formData = new FormData();
    formData.append('text', text);
    const res = await fetch(`${API_BASE}/ingest/text`, {
      method: 'POST',
      body: formData
    });
    return res.json();
  },
  uploadWhatsAppFile: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/ingest/file`, {
      method: 'POST',
      body: formData
    });
    return res.json();
  },
  triggerFolderScan: async () => {
    const res = await fetch(`${API_BASE}/watcher/scan-now`, { method: 'POST' });
    return res.json();
  },
  getWatcherStatus: async () => {
    const res = await fetch(`${API_BASE}/watcher/status`);
    return res.json();
  }
};
