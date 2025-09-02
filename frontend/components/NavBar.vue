<template>
  <header class="bg-gray-800/80 backdrop-blur-sm sticky top-0 z-50">
    <nav class="container mx-auto px-6 py-4 flex justify-between items-center">
      <NuxtLink to="/" class="flex items-center gap-3">
        <svg class="h-8 w-8 text-primary-color" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
          <path d="M39.5563 34.1455V13.8546C39.5563 15.708 36.8773 17.3437 32.7927 18.3189C30.2914 18.916 27.263 19.2655 24 19.2655C20.737 19.2655 17.7086 18.916 15.2073 18.3189C11.1227 17.3437 8.44365 15.708 8.44365 13.8546V34.1455C8.44365 35.9988 11.1227 37.6346 15.2073 38.6098C17.7086 39.2069 20.737 39.5564 24 39.5564C27.263 39.5564 30.2914 39.2069 32.7927 38.6098C36.8773 37.6346 39.5563 35.9988 39.5563 34.1455Z" fill="currentColor"></path>
        </svg>
        <h1 class="text-xl font-bold text-white">VeritySpring</h1>
      </NuxtLink>

      <div class="flex items-center gap-8">
        <NuxtLink to="/dashboard" class="text-gray-300 hover:text-primary-color transition-colors">Dashboard</NuxtLink>
        <NuxtLink to="/knowledge-graph" class="text-gray-300 hover:text-primary-color transition-colors">Graph</NuxtLink>
        <NuxtLink to="/challenge" class="text-gray-300 hover:text-primary-color transition-colors">Challenge</NuxtLink>
        <NuxtLink to="/ai-test" class="text-gray-300 hover:text-primary-color transition-colors">AI Test</NuxtLink>
      </div>

      <div class="flex items-center gap-4">
        <template v-if="authStore.isAuthenticated">
          <div class="relative">
            <button @click="toggleDropdown" class="flex items-center gap-2">
              <img v-if="authStore.user && authStore.user.avatar" :src="authStore.user.avatar" alt="User avatar" class="size-10 rounded-full object-cover" />
              <div v-else class="size-10 rounded-full bg-gray-700"></div>
              <span class="text-white font-medium">{{ authStore.user ? authStore.user.nickname : 'User' }}</span>
            </button>
            <div v-if="dropdownOpen" class="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1 z-20">
              <NuxtLink to="/profile" class="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">Profile</NuxtLink>
              <NuxtLink to="/settings" class="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">Settings</NuxtLink>
              <a @click.prevent="handleLogout" href="#" class="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">Logout</a>
            </div>
          </div>
        </template>
        <template v-else>
          <NuxtLink to="/login" class="text-gray-300 hover:text-primary-color transition-colors">Login</NuxtLink>
          <NuxtLink to="/register" class="bg-primary-color text-gray-900 px-4 py-2 rounded-md font-semibold hover:bg-opacity-90 transition-colors">Register</NuxtLink>
        </template>
      </div>
    </nav>
  </header>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '~/stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();
const dropdownOpen = ref(false);

const toggleDropdown = () => {
  dropdownOpen.value = !dropdownOpen.value;
};

const handleLogout = () => {
  authStore.clear();
  dropdownOpen.value = false;
  router.push('/login');
};

onMounted(() => {
  authStore.initialize();
  if (authStore.isAuthenticated) {
    authStore.fetchUser();
  }
});
</script>

<style scoped>
:root {
  --primary-color: #38e07b;
}
.text-primary-color {
  color: var(--primary-color);
}
.bg-primary-color {
  background-color: var(--primary-color);
}
</style>
