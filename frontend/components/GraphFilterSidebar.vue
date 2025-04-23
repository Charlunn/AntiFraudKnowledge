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
    padding: 15px;
    border-right: 1px solid #ccc;
    display: flex;
    flex-direction: column;
    gap: 10px; /* 元素间距 */
  }
  .filter-group {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
  label {
    font-weight: bold;
    font-size: 0.9em;
  }
  input[type="text"] {
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  button {
    padding: 10px 15px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }
  button:hover {
    background-color: #0056b3;
  }
  button:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
  .error-message {
      color: red;
      font-size: 0.9em;
      margin-top: 10px;
  }
  </style>