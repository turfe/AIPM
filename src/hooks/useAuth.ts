import { create } from 'zustand';
import { api } from '../services/api';

interface AuthState {
  isAuthenticated: boolean;
  user: null | { id: string; username: string };
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,

  register: async (email, password, name) => {
    try {
      const data = await api.register({
        username: email,
        password,
        confirm_password: password
      });
      set({ isAuthenticated: true, user: data.user });
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  login: async (email, password) => {
    try {
      const data = await api.login({
        username: email,
        password
      });
      set({ isAuthenticated: true, user: data.user });
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  logout: async () => {
    try {
      await api.logout();
      set({ isAuthenticated: false, user: null });
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },

  checkAuth: async () => {
    try {
      const data = await api.checkAuth();
      set({ isAuthenticated: true, user: data.user });
    } catch (error) {
      set({ isAuthenticated: false, user: null });
    }
  },
}));