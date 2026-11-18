import axios from 'axios';

// In production (Vercel), VITE_API_URL must be set in Vercel Dashboard → Settings → Environment Variables
// In development, it falls back to localhost
const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD
    ? 'https://vd-logs-backend.onrender.com/api/v1'
    : 'http://localhost:5000/api/v1');

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
