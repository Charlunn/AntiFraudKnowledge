<template>
  <div class="full-app-container">
    <AppHeader />
    <div class="page-content">
      <!-- Nuxt 3 的路由视图占位符 -->
      <NuxtLayout :name="layout">
        <NuxtPage />
      </NuxtLayout>
    </div>
    <AppFooter />
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
// 导入组件
import AppHeader from '~/components/AppHeader.vue';
import AppFooter from '~/components/AppFooter.vue';
import { useAuthStore } from '~/stores/auth'; // Import the auth store

const authStore = useAuthStore(); // Initialize the auth store

onMounted(() => {
  authStore.initializeAuth(); // Initialize auth state when the component is mounted
});
</script>

<style scoped>
/* frontend/app.vue */

.full-app-container {
  display: flex;
  flex-direction: column; /* 垂直布局 Header, Page Content, Footer */
  min-height: 100vh; /* 确保至少占满整个视口高度 */
  background-color: var(--background-color); /* 应用背景色 */
  color: var(--text-color); /* 应用文字颜色 */
}

.page-content {
  flex: 1; /* 占据 Header 和 Footer 之间的剩余空间 */
  /* 根据需要调整内边距 */
  /* padding: 20px; */
}

/* 如果需要，可以在这里添加全局的媒体查询 */
/* @media (max-width: 768px) {
  .page-content {
    padding: 10px;
  }
} */
</style>
