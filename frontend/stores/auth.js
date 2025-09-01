import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: null,
    refreshToken: null,
  }),
  actions: {
    initialize() {
      if (process.client) {
        const saved = localStorage.getItem('auth');
        if (saved) {
          const data = JSON.parse(saved);
          this.accessToken = data.accessToken;
          this.refreshToken = data.refreshToken;
        }
      }
    },
    setTokens(access, refresh) {
      this.accessToken = access;
      this.refreshToken = refresh;
      if (process.client) {
        localStorage.setItem('auth', JSON.stringify({ accessToken: access, refreshToken: refresh }));
      }
    },
    clear() {
      this.accessToken = null;
      this.refreshToken = null;
      if (process.client) {
        localStorage.removeItem('auth');
      }
    },
  },
});
