<template>
  <div class="bg-gray-900 text-white min-h-screen">
    <NavBar />
    <main>
      <slot />
    </main>
  </div>
</template>

<script setup>
import NavBar from '~/components/NavBar.vue';
</script>
