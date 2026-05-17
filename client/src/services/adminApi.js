import axios from 'axios';

const adminApi = axios.create({
  baseURL: import.meta.env.VITE_ADMIN_API_URL || import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/admin` : 'http://localhost:5000/api/admin',
});

adminApi.interceptors.request.use((config) => {
  const adminToken = localStorage.getItem('adminToken');
  if (adminToken) {
    config.headers.Authorization = `Bearer ${adminToken}`;
  }
  return config;
});

export default adminApi;
