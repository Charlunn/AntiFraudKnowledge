import { defineStore } from 'pinia';
import axios from 'axios';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: null,
    refreshToken: null,
    user: null,
    isRefreshing: false,
  }),
  getters: {
    isAuthenticated: (state) => !!state.accessToken,
    getAccessToken: (state) => state.accessToken,
    getRefreshToken: (state) => state.refreshToken,
    currentUser: (state) => state.user,
  },
  actions: {
    setTokens(accessToken, refreshToken) {
      this.accessToken = accessToken;
      this.refreshToken = refreshToken;
      localStorage.setItem('accessToken', accessToken);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    },
    setUser(user) {
      console.log('Setting user data:', user);
      this.user = user;
      // 存储用户信息到本地存储，以便页面刷新后恢复
      if (user) {
        localStorage.setItem('userData', JSON.stringify(user));
      }
    },
    logout() {
      this.accessToken = null;
      this.refreshToken = null;
      this.user = null;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userData'); // 清除用户数据
      delete axios.defaults.headers.common['Authorization'];
    },
    initializeAuth() {
        const token = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');
        const userData = localStorage.getItem('userData');
        
        if (token) {
            this.accessToken = token;
            this.refreshToken = refreshToken;
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            
            // 从本地存储恢复用户数据
            if (userData) {
                try {
                    this.user = JSON.parse(userData);
                    console.log('Restored user data from localStorage:', this.user);
                } catch (e) {
                    console.error('Failed to parse user data from localStorage:', e);
                }
            } else {
                // 如果没有用户数据但有token，尝试获取用户信息
                this.fetchUserProfile();
            }
        }
    },
    async login({ identifier, password }) {
      try {
        let payload = { password };
        // Simple logic to determine identifier type
        if (identifier.includes('@')) {
          payload.email = identifier;
        } else if (/^\d+$/.test(identifier)) { // Check if it's all digits for phone number
          payload.phone_number = identifier;
        } else {
          payload.username = identifier;
        }

        console.log('Login request payload:', payload);
        const response = await axios.post('/users/login/', payload);
        console.log('Login response data:', response.data);
        
        const { access, refresh, user } = response.data;
        
        if (!user) {
          console.error('No user data received in login response');
          throw new Error('No user data in response');
        }
        
        console.log('User data from login:', user);
        this.setTokens(access, refresh);
        this.setUser(user);
        return true;
      } catch (error) {
        console.error('Login failed:', error);
        this.logout();
        throw error; // Re-throw to handle in component
      }
    },
    async register(userData) {
      try {
        console.log('Registration data:', userData);
        
        let config = {};
        
        // 检查是否是FormData类型（包含文件上传）
        if (userData instanceof FormData) {
          config = {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          };
          console.log('Using FormData for registration with file upload');
        } else {
          console.log('Using JSON for registration without file upload');
        }
        
        const response = await axios.post('/users/register/', userData, config);
        console.log('Registration response:', response.data);
        return response.data;
      } catch (error) {
        console.error('Registration failed:', error);
        if (error.response && error.response.data) {
          console.error('Server error details:', error.response.data);
        }
        throw error; // Re-throw to handle in component
      }
    },
    async refreshToken() {
        this.isRefreshing = true;
        try {
            const response = await axios.post('/users/token/refresh/', {
                refresh: this.refreshToken,
            });
            const newAccessToken = response.data.access;
            this.setTokens(newAccessToken, this.refreshToken);
            // axios.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
            return newAccessToken;
        } catch (refreshError) {
            this.logout();
            throw refreshError;
        } finally {
            this.isRefreshing = false;
        }
    },
    // 添加获取用户信息的方法
    async fetchUserProfile() {
      try {
        if (this.accessToken) {
          const response = await axios.get('/users/profile/');
          console.log('Fetched user profile:', response.data);
          this.setUser(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
      }
    }
  },
});
