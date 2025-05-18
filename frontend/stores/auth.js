import { defineStore } from 'pinia';
import axios from 'axios';
import { useRuntimeConfig } from '#app';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isAuthenticated: false,
    accessToken: null,
    refreshToken: null,
    user: null, // To store basic user info like username, avatar etc.
    isRefreshing: false, // Add this: To track if token is currently being refreshed
  }),
  getters: {
    isLoggedIn: (state) => state.isAuthenticated,
    getAccessToken: (state) => state.accessToken,
    getRefreshToken: (state) => state.refreshToken,
    getUser: (state) => state.user,
  },
  actions: {
    async login(identifier, password) { // Modify login action to take identifier and password
      const runtimeConfig = useRuntimeConfig(); // Access runtime config
      const API_BASE_URL = runtimeConfig.public.apiBase; // Get the API base URL

      let loginData = {};
      if (identifier.includes('@')) {
          loginData = { email: identifier, password: password };
      } else if (/^\d+$/.test(identifier)) {
           loginData = { phone_number: identifier, password: password };
      } else {
          loginData = { username: identifier, password: password };
      }

      try {
        const response = await axios.post(`${API_BASE_URL}/users/login/`, loginData);
        const result = response.data;

        this.accessToken = result.access;
        this.refreshToken = result.refresh;

        localStorage.setItem('accessToken', result.access);
        localStorage.setItem('refreshToken', result.refresh);

        // After getting tokens, fetch user info
        await this.fetchUserInfo();

        this.isAuthenticated = true; // Set authenticated to true after fetching user info


        return result; // Return result for potential use in component
      } catch (error) {
        // Re-throw error for component to handle
        throw error;
      }
    },
    async register(formData) { // Add register action to the store
         const runtimeConfig = useRuntimeConfig(); // Access runtime config
         const API_BASE_URL = runtimeConfig.public.apiBase; // Get the API base URL

         try {
            const response = await axios.post(`${API_BASE_URL}/users/register/`, formData);
            const result = response.data;
            return result;
         } catch (error) {
            throw error; // Re-throw error
         }
    },
    async fetchUserInfo() {
      const runtimeConfig = useRuntimeConfig();
      const API_BASE_URL = runtimeConfig.public.apiBase;
      const accessToken = this.accessToken || localStorage.getItem('accessToken');

      if (!accessToken) {
          this.logout();
          return;
      }

      try {
          // Use the correct backend endpoint for fetching user profile
          const response = await axios.get(`${API_BASE_URL}/users/profile/`, {
              headers: {
                  Authorization: `Bearer ${accessToken}`
              }
          });
          const userData = response.data;
          this.user = userData; // Store the fetched user data
          localStorage.setItem('user', JSON.stringify(userData)); // Also update local storage
      } catch (error) {
          console.error('Error fetching user info:', error);
          this.logout();
          throw error;
      }
  },
    async refreshToken() { // Add this action for token refreshing
        const runtimeConfig = useRuntimeConfig();
        const API_BASE_URL = runtimeConfig.public.apiBase;
        const refreshToken = this.refreshToken || localStorage.getItem('refreshToken');

        if (!refreshToken) {
            // If no refresh token, logout the user
            this.logout();
            return null;
        }

        try {
            this.isRefreshing = true; // Set refreshing state
            const response = await axios.post(`${API_BASE_URL}/users/token/refresh/`, {
                refresh: refreshToken
            });
            const newAccessToken = response.data.access;

            this.accessToken = newAccessToken;
            localStorage.setItem('accessToken', newAccessToken);

            this.isRefreshing = false; // Reset refreshing state
            console.log('Token refreshed successfully.');
            return newAccessToken; // Return the new access token
        } catch (error) {
            console.error('Error refreshing token:', error);
            // If refresh fails, logout the user
            this.logout();
            this.isRefreshing = false; // Reset refreshing state
            throw error; // Re-throw error
        }
    },
    logout() {
      this.isAuthenticated = false;
      this.accessToken = null;
      this.refreshToken = null;
      this.user = null;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      console.log('User logged out.');
    },
    async initializeAuth() {
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');

      if (accessToken && refreshToken) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        // Try to fetch user info to confirm valid session
        try {
             await this.fetchUserInfo();
             this.isAuthenticated = true; // Set authenticated to true after fetching user info
             console.log('Auth initialized: User is authenticated.');
        } catch (error) {
             // If fetching user info fails, it means the token might be invalid/expired
             console.error('Failed to initialize auth, tokens might be invalid:', error);
             this.logout(); // Log out if user info cannot be fetched
        }
      } else {
          this.logout(); // No tokens found, ensure logged out state
          console.log('Auth initialized: No tokens found, user is logged out.');
      }
    },
  },
});
