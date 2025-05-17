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
  .sidebar {
    padding: 20px; /* 增加内边距 */
    /* border-right: 1px solid #ccc; /* 移除或调整边框 */
    display: flex;
    flex-direction: column;
    gap: 20px; /* 增加元素间距 */
  }

  h3 {
    font-size: 1.4em; /* 调整标题大小 */
    color: #333; /* 调整标题颜色 */
    margin-bottom: 10px; /* 增加标题下方外边距 */
  }

  .filter-group {
    display: flex;
    flex-direction: column;
    gap: 8px; /* 调整组内间距 */
  }

  label {
    font-weight: bold;
    font-size: 1em; /* 调整标签大小 */
    color: #555; /* 调整标签颜色 */
  }

  input[type="text"] {
    padding: 10px 12px; /* 增加内边距 */
    border: 1px solid #ddd; /* 调整边框颜色 */
    border-radius: 8px; /* 增加圆角 */
    transition: border-color 0.3s ease; /* 添加过渡效果 */
  }

  input[type="text"]:focus {
      outline: none;
      border-color: #007bff; /* focus 时的边框颜色 */
  }

  button {
    padding: 10px 15px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 8px; /* 增加圆角 */
    cursor: pointer;
    transition: background-color 0.3s ease, transform 0.1s ease; /* 添加过渡效果 */
  }

  button:hover {
    background-color: #0056b3;
  }

  button:active {
      transform: scale(0.98); /* 点击时的缩小效果 */
  }

  button:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }

  .error-message {
      color: red;
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