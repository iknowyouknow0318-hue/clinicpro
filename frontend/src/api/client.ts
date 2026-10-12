import axios from 'axios';

const api = axios.create({
  baseURL: (import.meta.env.VITE_API_BASE_URL as string) || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('clinicflow_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token on 401 if it's unauthorized
      // Avoid redirect loops on login page itself
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('clinicflow_token');
        localStorage.removeItem('clinicflow_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
