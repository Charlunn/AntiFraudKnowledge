<template>
  <div class="full-app-container">
    <AppHeader />

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

    <AppFooter />
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue';
import { useGraphStore } from '@/stores/graph'; // 确保路径正确
import { storeToRefs } from 'pinia';

// 导入组件
import GraphFilterSidebar from '~/components/GraphFilterSidebar.vue'; // 使用 Nuxt 的 ~ 别名
import GraphChart from '~/components/GraphChart.vue';
import AppHeader from '~/components/AppHeader.vue'; // 导入 Header
import AppFooter from '~/components/AppFooter.vue'; // 导入 Footer


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
/* 定义颜色变量 */
:root {
  --primary-color: #4a90e2; /* 蓝色系 */
  --secondary-color: #7bdcb5; /* 绿色系 */
  --background-color: #f4f7f6; /* 浅灰色背景 */
  --surface-color: #ffffff; /* 白色表面 */
  --text-color: #333333; /* 深灰色文字 */
  --subtle-text-color: #666666; /* 中灰色文字 */
  --border-color: #dddddd; /* 浅灰色边框 */
  --shadow-color: rgba(0, 0, 0, 0.1); /* 阴影颜色 */
}

.full-app-container {
  display: flex;
  flex-direction: column; /* 垂直布局 */
  min-height: 100vh; /* 最小高度占满视口 */
  background-color: var(--background-color); /* 应用背景色 */
  color: var(--text-color); /* 应用文字颜色 */
}

.app-layout {
  display: flex;
  flex-grow: 1; /* 占据 Header 和 Footer 之间的空间 */
  width: 100%;
  padding: 20px; /* 增加整体内边距 */
  gap: 20px; /* 增加侧边栏和主内容之间的间距 */
}

.sidebar-area {
  width: 280px; /* 侧边栏宽度略微增加 */
  flex-shrink: 0; /* 防止侧边栏被压缩 */
  background-color: var(--surface-color); /* 应用表面色 */
  border-radius: 15px; /* 圆润边角 */
  overflow-y: auto; /* 如果内容过多，允许滚动 */
  padding: 20px; /* 增加侧边栏内边距 */
  box-shadow: 0 4px 12px var(--shadow-color); /* 添加阴影 */
}

.main-content {
  flex-grow: 1; /* 占据剩余空间 */
  display: flex;
  flex-direction: column;
  position: relative; /* 为了定位返回按钮 */
  background-color: var(--surface-color); /* 应用表面色 */
  border-radius: 15px; /* 圆润边角 */
  padding: 20px; /* 增加主内容区域内边距 */
  overflow: hidden; /* 防止图表溢出 */
  box-shadow: 0 4px 12px var(--shadow-color); /* 添加阴影 */
}

.back-button {
  position: absolute;
  top: 25px; /* 调整位置 */
  left: 25px; /* 调整位置 */
  z-index: 10; /* 确保在图表上层 */
  padding: 10px 15px; /* 增加内边距 */
  background-color: rgba(var(--primary-color), 0.8); /* 使用主题色并增加透明度 */
  color: white;
  border: none;
  border-radius: 8px; /* 增加圆角 */
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.1s ease; /* 添加过渡动画 */
}
.back-button:hover {
  background-color: var(--primary-color); /* 悬停时颜色变实 */
  transform: translateY(-2px); /* 悬停时微小上移 */
}
.back-button:active {
  transform: translateY(0); /* 点击时恢复位置 */
}


.loading-indicator, .error-message, .no-data {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%; /* 占据可用空间 */
  font-size: 1.3em; /* 字体稍大 */
  color: var(--subtle-text-color); /* 应用中灰色文字 */
  text-align: center;
  padding: 20px;
  border-radius: 10px;
  background-color: rgba(var(--surface-color), 0.8);
}

.error-message {
    color: red; /* 错误信息仍然使用红色 */
}

.graph-area {
  flex-grow: 1; /* 让图表区域填充剩余空间 */
  width: 100%;
  min-height: 400px; /* 保证最小高度 */
  /* ECharts 容器通常不需要圆角，其内部元素会处理 */
}

/* 基础动画示例 - 可以根据需要扩展到其他元素 */
/* 例如，为输入框或按钮添加 focus 效果 */
input:focus, button:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(var(--primary-color), 0.3);
  transition: box-shadow 0.3s ease;
}
</style>
