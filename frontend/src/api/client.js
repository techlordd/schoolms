// src/api/client.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/v1',
  withCredentials: true,
  timeout: 30000,
});

// Response interceptor — auto-refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const { data } = await api.post('/auth/refresh');
        const token = data.data.accessToken;
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        original.headers['Authorization'] = `Bearer ${token}`;
        // Update store token
        const { useAuthStore } = await import('../store/authStore');
        useAuthStore.getState().setToken(token);
        return api(original);
      } catch {
        const { useAuthStore } = await import('../store/authStore');
        useAuthStore.getState().logout();
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;
