import axios from 'axios';

// Resolve API base URL for all environments
// Priority: VITE_API_URL env var (set in Vercel Dashboard) → hardcoded production → localhost dev
function resolveApiBaseUrl() {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    // Ensure the env var includes /api/v1 suffix — common misconfiguration
    return envUrl.endsWith('/api/v1') ? envUrl : `${envUrl.replace(/\/+$/, '')}/api/v1`;
  }
  if (import.meta.env.PROD) {
    return 'https://vd-logs-backend.onrender.com/api/v1';
  }
  return 'http://localhost:5000/api/v1';
}

const API_BASE_URL = resolveApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT access token to every outgoing request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('vd_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Intercept 401 unauthenticated responses and clear token if invalid
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('vd_token');
      localStorage.removeItem('vd_user');
      // If not already on login page, redirect
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/staff-login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
