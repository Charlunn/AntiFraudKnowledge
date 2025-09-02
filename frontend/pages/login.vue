<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-900 text-white">
    <div class="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-2xl shadow-lg">
      <div class="text-center">
        <h1 class="text-3xl font-bold text-primary-color">Welcome Back</h1>
        <p class="text-gray-400">Log in to continue your training.</p>
      </div>
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div>
          <label for="identifier" class="block text-sm font-medium text-gray-300">Username, Email, or Phone</label>
          <input
            id="identifier"
            v-model="identifier"
            type="text"
            required
            class="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-color"
          />
        </div>
        <div>
          <label for="password" class="block text-sm font-medium text-gray-300">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            class="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-color"
          />
        </div>
        <div v-if="error" class="text-red-400 text-sm">
          {{ error }}
        </div>
        <button
          type="submit"
          class="w-full py-3 font-semibold text-gray-900 bg-primary-color rounded-md hover:bg-opacity-90 transition-colors"
        >
          Log In
        </button>
      </form>
      <div class="text-center text-gray-400">
        Don't have an account?
        <NuxtLink to="/register" class="font-medium text-primary-color hover:underline">Register</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { login } from '~/api/auth';
import { useAuthStore } from '~/stores/auth';

const identifier = ref('');
const password = ref('');
const error = ref(null);
const router = useRouter();
const authStore = useAuthStore();

const handleSubmit = async () => {
  error.value = null;
  try {
    const response = await login(identifier.value, password.value);
    const { access, refresh } = response.data;
    authStore.setTokens(access, refresh);
    router.push('/dashboard');
  } catch (err) {
    error.value = 'Login failed. Please check your credentials.';
  }
};
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
.focus\:ring-primary-color:focus {
  --tw-ring-color: var(--primary-color);
}
</style>
