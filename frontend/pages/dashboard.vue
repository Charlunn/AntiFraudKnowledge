<template>
  <div class="dashboard-container">
    <h1>仪表盘</h1>
    <p>欢迎来到您的用户仪表盘！</p>
    <!-- 这里可以添加更多仪表盘内容，例如用户统计、最近活动等 -->
  </div>
</template>

<script setup>
// 定义页面元数据，指示此页面需要用户认证
definePageMeta({
  requiresAuth: true,
});
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
  text-align: center;
}

h1 {
  color: var(--primary-color);
  margin-bottom: 20px;
}

p {
  color: var(--text-color);
  font-size: 1.1rem;
}
</style>
