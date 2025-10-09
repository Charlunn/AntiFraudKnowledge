import { defineStore } from 'pinia';
import { userStorage } from '~/utils/storage';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: null,
    refreshToken: null,
  }),
  actions: {
    initialize() {
      if (process.client) {
        try {
          this.accessToken = userStorage.getToken();
          const userInfo = userStorage.getUserInfo();
          if (userInfo && userInfo.refreshToken) {
            this.refreshToken = userInfo.refreshToken;
          }
        } catch (error) {
          console.warn('Failed to initialize auth store:', error);
        }
      }
    },
    setTokens(access, refresh) {
      this.accessToken = access;
      this.refreshToken = refresh;
      if (process.client) {
        try {
          userStorage.setToken(access);
          // 保存 refresh token 到用户信息中
          const userInfo = userStorage.getUserInfo() || {};
          userInfo.refreshToken = refresh;
          userStorage.setUserInfo(userInfo);
        } catch (error) {
          console.warn('Failed to save tokens:', error);
        }
      }
    },
    clear() {
      this.accessToken = null;
      this.refreshToken = null;
      if (process.client) {
        try {
          userStorage.clearUserData();
        } catch (error) {
          console.warn('Failed to clear auth data:', error);
        }
      }
    },
  },
});