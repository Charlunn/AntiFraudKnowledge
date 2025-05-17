<template>
    <div class="sidebar">
      <h3>Filter Graph</h3>
      <div class="filter-group">
        <label for="filterProp">Property Name:</label>
        <input type="text" id="filterProp" v-model="filterProp" placeholder="e.g., name or category">
      </div>
      <div class="filter-group">
        <label for="filterValue">Property Value:</label>
        <input type="text" id="filterValue" v-model="filterValue" placeholder="e.g., 网络钓鱼">
      </div>
      <button @click="applyFilter" :disabled="isLoading || !filterProp || !filterValue">Apply Filter</button>
      <p v-if="error" class="error-message">{{ error }}</p>
    </div>
  </template>

  <script setup>
  import { ref } from 'vue';
  import { useGraphStore } from '@/stores/graph'; // 确保路径正确
  import { storeToRefs } from 'pinia';

  const graphStore = useGraphStore();
  const { isLoading, error } = storeToRefs(graphStore); // 响应式地引用 store 的状态

  const filterProp = ref('');
  const filterValue = ref('');

  const applyFilter = () => {
    // 清除之前的错误
    error.value = null; // 直接修改 Pinia store 的 error 状态
    graphStore.fetchFilteredGraph(filterProp.value, filterValue.value);
  };
  </script>

  <style scoped>
  /* 使用从全局或父组件继承的CSS变量 */
  /* 如果CSS变量在app.vue中定义，这里应该可以直接访问 */

  .sidebar {
    padding: 25px; /* 增加内边距，更宽松 */
    display: flex;
    flex-direction: column;
    gap: 20px; /* 增加元素间距 */
    background-color: var(--surface-color); /* 使用表面色 */
    border-radius: 15px; /* 圆润边角与主内容区域一致 */
    box-shadow: 0 4px 12px var(--shadow-color); /* 添加阴影 */
    color: var(--text-color); /* 应用文字颜色 */
  }

  h3 {
    font-size: 1.6em; /* 调整标题大小 */
    color: var(--primary-color); /* 使用主题色 */
    margin-bottom: 15px; /* 增加标题下方外边距 */
    text-align: center;
    font-weight: 600; /* 稍微加粗 */
  }

  .filter-group {
    display: flex;
    flex-direction: column;
    gap: 10px; /* 调整组内间距 */
    margin-bottom: 15px; /* 增加组下方外边距 */
  }

  label {
    font-weight: bold;
    font-size: 1.1em; /* 调整标签大小 */
    color: var(--subtle-text-color); /* 使用中灰色文字 */
  }

  input[type="text"] {
    padding: 12px 15px; /* 增加内边距 */
    border: 1px solid var(--border-color); /* 调整边框颜色和粗细 */
    border-radius: 10px; /* 增加圆角 */
    transition: border-color 0.3s ease, box-shadow 0.3s ease; /* 添加过渡效果 */
    background-color: var(--background-color); /* 应用背景色 */
    color: var(--text-color); /* 应用文字颜色 */
    font-size: 1em;
  }

  input[type="text"]:focus {
      outline: none;
      border-color: var(--primary-color); /* focus 时的边框颜色 */
      box-shadow: 0 0 0 3px rgba(var(--primary-color), 0.2); /* 添加 focus 阴影 */
  }

  button {
    padding: 12px 20px; /* 增加内边距 */
    background-color: var(--primary-color); /* 使用主题色 */
    color: white;
    border: none;
    border-radius: 10px; /* 增加圆角 */
    cursor: pointer;
    font-size: 1.1em;
    font-weight: bold;
    transition: background-color 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease; /* 添加更多过渡效果 */
  }

  button:hover {
    background-color: #357abd; /* 悬停时颜色变深，使用具体颜色值 */
    box-shadow: 0 6px 16px rgba(var(--primary-color), 0.3); /* 悬停时增加阴影 */
  }

  button:active {
      transform: scale(0.98); /* 点击时的微小缩小效果 */
      box-shadow: 0 2px 8px rgba(var(--primary-color), 0.4); /* 点击时阴影变化 */
  }

  button:disabled {
    background-color: #cccccc;
    color: #999999;
    cursor: not-allowed;
    box-shadow: none;
    transform: none;
    transition: none; /* 禁用状态没有动画 */
    opacity: 0.7; /* 禁用时半透明 */
  }

  .error-message {
      color: red; /* 错误信息仍然使用红色 */
      font-size: 0.9em;
      margin-top: 10px;
      opacity: 0; /* 初始状态透明 */
      animation: fadeIn 0.5s ease forwards; /* 添加淡入动画 */
  }

  @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
  }
  </style>
