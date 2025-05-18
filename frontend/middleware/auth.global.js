import { defineNuxtRouteMiddleware } from '#app';
import { useAuthStore } from '~/stores/auth';

export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore();

  // Check if the route requires authentication using meta fields
  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    // If the user is not authenticated and the route requires auth, redirect to the login page
    return navigateTo('/login');
  }
});