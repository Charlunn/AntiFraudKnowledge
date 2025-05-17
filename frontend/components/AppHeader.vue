<template>
  <header class="app-header">
    <div class="container">
      <h1>My App</h1>
      <nav>
        <ul>
          <li><a href="#">Home</a></li>
          <li><a href="#">About</a></li>
          <li><a href="#">Contact</a></li>
        </ul>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
// Script setup is empty for this simple header
</script>

<style scoped>
/* frontend/components/AppHeader.vue */

.app-header {
  background-color: var(--surface-color); /* 使用表面色作为背景 */
  box-shadow: 0 2px 8px var(--shadow-color); /* 添加柔和的底部阴影 */
  padding: 15px 0; /* 上下内边距 */
  position: sticky; /* 固定在顶部 */
  top: 0;
  z-index: 100; /* 确保在其他内容之上 */
}

.app-header .container {
  display: flex;
  justify-content: space-between; /* Logo 和导航左右对齐 */
  align-items: center; /* 垂直居中对齐 */
}

.app-header h1 {
  margin: 0;
  font-size: 1.8rem; /* 稍微增大标题字号 */
  color: var(--text-color); /* 使用文字颜色 */
  font-weight: 700; /* 加粗标题 */
}

.app-header nav ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
}

.app-header nav li {
  margin-left: 25px; /* 增加导航项之间的间距 */
}

.app-header nav a {
  text-decoration: none;
  color: var(--subtle-text-color); /* 使用中灰色文字 */
  font-weight: 500; /* 中等字重 */
  transition: color 0.3s ease;
}

.app-header nav a:hover {
  color: var(--primary-color); /* 悬停时使用主题色 */
}

/* 如果需要活动链接的样式，可以添加一个类 */
/* .app-header nav a.active {
  color: var(--primary-color-dark);
  font-weight: 700;
} */

</style>