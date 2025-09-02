<template>
  <div class="relative min-h-screen">
    <div class="relative z-10">
      <main class="container mx-auto mt-12 px-4 md:px-16">
        <h2 class="text-4xl font-bold tracking-tight text-white">Welcome back, {{ authStore.user?.nickname || 'User' }}</h2>
        <p class="mt-2 text-lg text-gray-400">Let's continue your anti-fraud training.</p>
        <div class="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div class="gradient-border bg-gray-800 p-6">
            <p class="text-sm font-medium text-gray-400">Overall Progress</p>
            <p class="mt-1 text-3xl font-bold text-primary-color">75%</p>
          </div>
          <div class="gradient-border bg-gray-800 p-6">
            <p class="text-sm font-medium text-gray-400">Anti-Fraud Level</p>
            <p class="mt-1 text-3xl font-bold text-primary-color">Intermediate</p>
          </div>
          <div class="gradient-border bg-gray-800 p-6">
            <p class="text-sm font-medium text-gray-400">Achievement Badges</p>
            <p class="mt-1 text-3xl font-bold text-primary-color">3</p>
          </div>
        </div>
        <h3 class="mt-12 text-2xl font-bold tracking-tight text-white">Quick Access</h3>
        <div class="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <NuxtLink to="/knowledge-graph" class="group flex cursor-pointer flex-col overflow-hidden rounded-xl bg-gray-800 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary-color/20">
            <div class="h-40 w-full bg-gray-700"></div>
            <div class="p-4">
              <h4 class="font-semibold text-white">Scam Knowledge Graph</h4>
              <p class="mt-1 text-sm text-gray-400">Explore the latest scam tactics and trends.</p>
            </div>
          </NuxtLink>
          <NuxtLink to="/ai-test" class="group flex cursor-pointer flex-col overflow-hidden rounded-xl bg-gray-800 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary-color/20">
            <div class="h-40 w-full bg-gray-700"></div>
            <div class="p-4">
              <h4 class="font-semibold text-white">AI Simulation Combat</h4>
              <p class="mt-1 text-sm text-gray-400">Engage in realistic scenarios to test your skills.</p>
            </div>
          </NuxtLink>
          <NuxtLink to="/challenge" class="group flex cursor-pointer flex-col overflow-hidden rounded-xl bg-gray-800 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary-color/20">
            <div class="h-40 w-full bg-gray-700"></div>
            <div class="p-4">
              <h4 class="font-semibold text-white">Proactive Defense</h4>
              <p class="mt-1 text-sm text-gray-400">Learn how to protect yourself and your loved ones.</p>
            </div>
          </NuxtLink>
          <div class="group flex cursor-pointer flex-col overflow-hidden rounded-xl bg-gray-800 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary-color/20">
             <div class="h-40 w-full bg-gray-700"></div>
            <div class="p-4">
              <h4 class="font-semibold text-white">Gaming Community</h4>
              <p class="mt-1 text-sm text-gray-400">Connect with others and share your experiences.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth';

definePageMeta({
  middleware: 'auth'
});

const authStore = useAuthStore();
</script>

<style scoped>
:root {
  --primary-color: #38e07b;
  --secondary-color: #2a9d8f;
  --card-bg: #222222;
  --border-color: #333333;
}

.text-primary-color {
  color: var(--primary-color);
}

.gradient-border {
  position: relative;
  border: 2px solid transparent;
  background-clip: padding-box;
  border-radius: 1.5rem;
}
.gradient-border::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: -1;
  margin: -2px;
  border-radius: inherit;
  background: linear-gradient(to right, var(--primary-color), var(--secondary-color));
}
.hover\:shadow-primary-color\/20:hover {
    box-shadow: 0 25px 50px -12px rgba(56, 224, 123, 0.2);
}
</style>
