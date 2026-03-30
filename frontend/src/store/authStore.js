// src/store/authStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../api/client';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password });
        const { accessToken, user } = data.data;
        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        set({ user, token: accessToken, isAuthenticated: true });
        return user;
      },

      logout: async () => {
        try { await api.post('/auth/logout'); } catch {}
        delete api.defaults.headers.common['Authorization'];
        set({ user: null, token: null, isAuthenticated: false });
      },

      refreshToken: async () => {
        try {
          const { data } = await api.post('/auth/refresh');
          const { accessToken } = data.data;
          api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
          set({ token: accessToken });
          return accessToken;
        } catch {
          get().logout();
          return null;
        }
      },

      updateUser: (updates) => set(s => ({ user: { ...s.user, ...updates } })),

      setToken: (token) => {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        set({ token });
      },
    }),
    {
      name: 'educore-auth',
      partialize: (s) => ({ user: s.user, token: s.token, isAuthenticated: s.isAuthenticated }),
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          api.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
        }
      },
    }
  )
);

export default useAuthStore;
