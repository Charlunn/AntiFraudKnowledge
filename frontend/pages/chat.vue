<template>
  <div class="chat-container">
    <h1>聊天</h1>
    <p>这是一个模拟聊天页面，需要用户登录才能访问。</p>
    <!-- 实际的聊天界面将在这里实现 -->
  </div>
</template>

<script setup>
// 定义页面元数据，指示此页面需要用户认证
definePageMeta({
  requiresAuth: true,
});
</script>

<style scoped>
.chat-container {
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
