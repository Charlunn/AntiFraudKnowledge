import { useAuthStore } from '~/stores/auth';

export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore();

  // Initialize store from localStorage
  authStore.initialize();

  // If the user is not authenticated and is trying to access a protected route
  if (!authStore.accessToken && to.path !== '/login' && to.path !== '/register') {
    // Redirect them to the login page
    return navigateTo('/login');
  }
});
