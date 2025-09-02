<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-900 text-white">
    <div class="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-2xl shadow-lg">
      <div class="text-center">
        <h1 class="text-3xl font-bold text-primary-color">Create an Account</h1>
        <p class="text-gray-400">Join VeritySpring to start your anti-fraud training.</p>
      </div>
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div>
          <label for="username" class="block text-sm font-medium text-gray-300">Username</label>
          <input
            id="username"
            v-model="username"
            type="text"
            required
            class="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-color"
          />
        </div>
        <div>
          <label for="nickname" class="block text-sm font-medium text-gray-300">Nickname</label>
          <input
            id="nickname"
            v-model="nickname"
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
        <div>
          <label for="password2" class="block text-sm font-medium text-gray-300">Confirm Password</label>
          <input
            id="password2"
            v-model="password2"
            type="password"
            required
            class="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-color"
          />
        </div>
        <div v-if="error" class="text-red-400 text-sm">
          {{ error }}
        </div>
        <div v-if="passwordError" class="text-red-400 text-sm">
          {{ passwordError }}
        </div>
        <button
          type="submit"
          class="w-full py-3 font-semibold text-gray-900 bg-primary-color rounded-md hover:bg-opacity-90 transition-colors"
        >
          Register
        </button>
      </form>
      <div class="text-center text-gray-400">
        Already have an account?
        <NuxtLink to="/login" class="font-medium text-primary-color hover:underline">Log in</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { register } from '~/api/auth';

const username = ref('');
const nickname = ref('');
const password = ref('');
const password2 = ref('');
const error = ref(null);
const passwordError = ref(null);
const router = useRouter();

const validatePassword = () => {
  if (password.value !== password2.value) {
    passwordError.value = 'Passwords do not match.';
    return false;
  }
  if (password.value.length < 8) {
    passwordError.value = 'Password must be at least 8 characters long.';
    return false;
  }
  passwordError.value = null;
  return true;
};

const handleSubmit = async () => {
  error.value = null;
  if (!validatePassword()) {
    return;
  }
  try {
    await register({
      username: username.value,
      nickname: nickname.value,
      password: password.value,
      password2: password2.value,
    });
    router.push('/login');
  } catch (err) {
    error.value = 'Registration failed. Please try again.';
    if (err.response && err.response.data) {
        const errors = err.response.data;
        if (errors.username) {
            error.value = `Username: ${errors.username[0]}`;
        } else if (errors.password) {
            error.value = `Password: ${errors.password[0]}`;
        }
    }
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
