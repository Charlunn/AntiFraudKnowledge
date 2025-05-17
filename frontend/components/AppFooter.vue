<template>
  <footer class="app-footer">
    <div class="container">
      <p>&copy; {{ new Date().getFullYear() }} My App. All rights reserved.</p>
      </div>
  </footer>
</template>

<script setup>
// Footer 组件可能不需要额外的脚本
</script>

<style scoped>
/* frontend/components/AppFooter.vue */

.app-footer {
  background-color: var(--surface-color); /* 使用表面色作为背景 */
  padding: 20px 0; /* 上下内边距 */
  text-align: center; /* 文字居中 */
  color: var(--subtle-text-color); /* 使用中灰色文字 */
  font-size: 0.9em; /* 稍微减小字号 */
  border-top: 1px solid var(--border-color); /* 添加顶部细边框 */
  margin-top: 40px; /* 在 Footer 上方添加一些间距 */
}

.app-footer .container {
    /* 如果 Footer 内容需要左右对齐，可以在这里使用 flexbox */
    /* display: flex;
    justify-content: space-between;
    align-items: center; */
}

.app-footer p {
    margin: 0; /* 移除默认段落外边距 */
}
</style>
