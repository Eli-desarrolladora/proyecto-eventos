// services/api.js - Cliente HTTP centralizado con Axios
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://proyecto-eventos-production.up.railway.app';

// Instancia de Axios configurada
const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// ─── Interceptor: agregar token JWT a cada petición ──────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Interceptor: manejar errores globalmente ────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ─── Servicios de Autenticación ──────────────────────────────────────────────
export const authService = {
  register: (datos) => api.post('/auth/register', datos),
  login: (datos) => api.post('/auth/login', datos),
  perfil: () => api.get('/auth/perfil'),
};

// ─── Servicios de Eventos ────────────────────────────────────────────────────
export const eventoService = {
  listar: (pagina = 1) => api.get(`/eventos?pagina=${pagina}`),
  obtener: (id) => api.get(`/eventos/${id}`),
  crear: (datos) => api.post('/eventos', datos),
  actualizar: (id, datos) => api.put(`/eventos/${id}`, datos),
  eliminar: (id) => api.delete(`/eventos/${id}`),
};

// ─── Servicios de Tickets ────────────────────────────────────────────────────
export const ticketService = {
  comprar: (evento_id) => api.post('/tickets/comprar', { evento_id }),
  misTickets: () => api.get('/tickets/mis-tickets'),
  cancelar: (id) => api.delete(`/tickets/${id}/cancelar`),
  listarTodos: () => api.get('/tickets'),
};

export default api;
