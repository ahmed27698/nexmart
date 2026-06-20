import { writable, derived } from 'svelte/store';
import { api } from '$lib/api';

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
}

function createAuthStore() {
  const { subscribe, set, update } = writable<{ user: User | null; token: string | null; loading: boolean }>({
    user: null,
    token: null,
    loading: true
  });

  return {
    subscribe,
    init() {
      if (typeof localStorage === 'undefined') { update(s => ({ ...s, loading: false })); return; }
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      if (token && userStr) {
        try { set({ user: JSON.parse(userStr), token, loading: false }); }
        catch { set({ user: null, token: null, loading: false }); }
      } else {
        set({ user: null, token: null, loading: false });
      }
    },
    async login(email: string, password: string) {
      const data = await api.post<{ token: string; user: User }>('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      set({ user: data.user, token: data.token, loading: false });
      return data.user;
    },
    async adminLogin(email: string, password: string) {
      const data = await api.post<{ token: string; user: User }>('/auth/admin/login', { email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      set({ user: data.user, token: data.token, loading: false });
      return data.user;
    },
    async register(email: string, password: string, name: string) {
      const data = await api.post<{ token: string; user: User }>('/auth/register', { email, password, name });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      set({ user: data.user, token: data.token, loading: false });
      return data.user;
    },
    updateUser(fields: Partial<User>) {
      update(s => {
        if (!s.user) return s;
        const updated = { ...s.user, ...fields };
        localStorage.setItem('user', JSON.stringify(updated));
        return { ...s, user: updated };
      });
    },
    logout() {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      set({ user: null, token: null, loading: false });
    }
  };
}

export const auth = createAuthStore();
export const isAdmin = derived(auth, $auth => $auth.user?.role === 'admin');
export const isLoggedIn = derived(auth, $auth => !!$auth.user);
