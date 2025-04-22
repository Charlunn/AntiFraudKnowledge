<template>
    <div class="app-layout">
      <!-- 侧边栏 -->
      <GraphFilterSidebar class="sidebar-area" />
  
      <!-- 主内容区域 -->
      <div class="main-content">
        <!-- 返回按钮 (仅在查看邻居时显示) -->
        <button v-if="isNeighborView && !isLoading" @click="goBackToFullGraph" class="back-button">
          ← Back to Full Graph
        </button>
  
        <!-- 加载状态 -->
        <div v-if="isLoading" class="loading-indicator">Loading Graph Data...</div>
  
        <!-- 错误信息 -->
        <div v-if="error && !isLoading" class="error-message">Error: {{ error }}</div>
  
        <!-- ECharts 图谱 -->
        <GraphChart
          v-if="!isLoading && currentNodes.length > 0"
          :nodes="currentNodes"
          :links="currentLinks"
          :title="chartTitle"
          @node-dblclick="handleNodeDoubleClick"
          class="graph-area"
        />
         <div v-else-if="!isLoading && currentNodes.length === 0 && !error" class="no-data">
          No graph data to display. Perform a filter or check API.
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { onMounted, computed } from 'vue';
  import { useGraphStore } from '@/stores/graph'; // 确保路径正确
  import { storeToRefs } from 'pinia';
  
  // 导入组件
  import GraphFilterSidebar from '~/components/GraphFilterSidebar.vue'; // 使用 Nuxt 的 ~ 别名
  import GraphChart from '~/components/GraphChart.vue';
  
  const graphStore = useGraphStore();
  // 使用 storeToRefs 保持响应性
  const { currentNodes, currentLinks, isLoading, isNeighborView, error } = storeToRefs(graphStore);
  
  // 计算属性，用于动态设置图表标题
  const chartTitle = computed(() => {
    return isNeighborView.value ? 'Node and Neighbors View' : 'Full Knowledge Graph';
  });
  
  // 处理节点双击事件
  const handleNodeDoubleClick = (nodeId) => {
    // console.log('Received node double click on page for ID:', nodeId);
    graphStore.fetchNodeNeighbors(nodeId);
  };
  
  // 处理返回按钮点击
  const goBackToFullGraph = () => {
    graphStore.showInitialGraph();
  };
  
  // 组件挂载后加载初始数据
  onMounted(() => {
     // 只有在初始数据为空时才加载，避免重复加载
     if (graphStore.currentNodes.length === 0) {
         graphStore.fetchInitialGraph();
     }
  });
  </script>
  
  <style scoped>
  .app-layout {
    display: flex;
    height: 100vh; /* 占满整个视口高度 */
    width: 100%;
  }
  
  .sidebar-area {
    width: 250px; /* 侧边栏宽度 */
    flex-shrink: 0; /* 防止侧边栏被压缩 */
    background-color: #f8f9fa;
    overflow-y: auto; /* 如果内容过多，允许滚动 */
  }
  
  .main-content {
    flex-grow: 1; /* 占据剩余空间 */
    display: flex;
    flex-direction: column;
    position: relative; /* 为了定位返回按钮 */
    padding: 10px; /* 添加一些内边距 */
    overflow: hidden; /* 防止图表溢出 */
  }
  
  .back-button {
    position: absolute;
    top: 15px;
    left: 15px;
    z-index: 10; /* 确保在图表上层 */
    padding: 8px 12px;
    background-color: rgba(0, 0, 0, 0.6);
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  .back-button:hover {
      background-color: rgba(0, 0, 0, 0.8);
  }
  
  .loading-indicator, .error-message, .no-data {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%; /* 占据可用空间 */
    font-size: 1.2em;
    color: #666;
  }
  
  .error-message {
      color: red;
  }
  
  .graph-area {
    flex-grow: 1; /* 让图表区域填充剩余空间 */
    width: 100%;
    min-height: 400px; /* 保证最小高度 */
  }
  </style>