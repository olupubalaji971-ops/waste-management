import axios from 'axios';

// Resolve backend API URL in production & local environments:
const resolveBaseURL = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/+$/, '');
  }
  if (import.meta.env.VITE_BACKEND_URL) {
    return `${import.meta.env.VITE_BACKEND_URL.replace(/\/+$/, '')}/api`;
  }
  return '/api';
};

const api = axios.create({
  baseURL: resolveBaseURL(),
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('biowaste_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      // If not currently on login page, can redirect
      if (window.location.pathname.startsWith('/app')) {
        console.warn('Session expired. Redirecting to login.');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
