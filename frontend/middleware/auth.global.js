import { defineNuxtRouteMiddleware } from '#app';
import { useAuthStore } from '~/stores/auth';

export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore();

  // Check if the route requires authentication using meta fields
  // Use authStore.isAuthenticated as defined in the store
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    // If the user is not authenticated and the route requires auth, redirect to the login page
    return navigateTo('/login');
  }

  // Optional: If authenticated, prevent access to login/register pages
  if (authStore.isAuthenticated && (to.path === '/login' || to.path === '/register')) {
    return navigateTo('/'); // Redirect to home or dashboard if already logged in
  }
});
