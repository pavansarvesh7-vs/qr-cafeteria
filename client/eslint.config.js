import axios from 'axios';

// 🛠️ Vite injects configurations at build time via import.meta.env
const API_URL = import.meta.env.VITE_API_URL || 'https://qr-cafeteria.onrender.com';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Automatically append authorization tokens if your endpoints require them later
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;