<template>
    <div class="app-layout">
        <!-- 侧边栏 -->
        <!-- 确保这里绑定了 apply-filters 事件 -->
        <GraphFilterSidebar class="sidebar-area" @apply-filters="handleApplyFilters" />

        <!-- 主内容区域 -->
        <main class="main-content">
          <div class="graph-title">
            <!-- 返回按钮 (仅在查看邻居时显示) -->
            <div class="button-box">
              <button v-if="isNeighborView && !isLoading" @click="goBackToFullGraph" class="back-button">
                  ← 返回
              </button>
            </div>
          <span class="title-text">防诈骗知识图谱</span>
          </div>


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
        </main>
    </div>
</template>

<script setup>
import { onMounted, computed } from 'vue';
import { useGraphStore } from '@/stores/graph'; // 确保路径正确
import { storeToRefs } from 'pinia';

// 导入组件
import GraphFilterSidebar from '~/components/GraphFilterSidebar.vue'; // 使用 Nuxt 的 ~ 别名
import GraphChart from '~/components/GraphChart.vue';
// AppHeader 和 AppFooter 不应该在这里导入和使用，它们在 app.vue 中

const graphStore = useGraphStore();
// 使用 storeToRefs 保持响应性
const { currentNodes, currentLinks, isLoading, isNeighborView, error } = storeToRefs(graphStore);

// 用于存储双击的节点名称
const doubleClickedNodeName = ref('');

// 计算属性，用于动态设置图表标题
const chartTitle = computed(() => {
    // **修改这里：当处于邻居视图时，使用双击的节点名称作为标题**
    return isNeighborView.value ? ` "${doubleClickedNodeName.value}" 的相关节点` : ''; // 默认标题
});

// 处理节点双击事件
const handleNodeDoubleClick = (nodeId) => {
    console.log('Received node double click on page for ID:', nodeId);

    // 查找被双击的节点对象
    const clickedNode = currentNodes.value.find(node => node.id === nodeId);

    if (clickedNode) {
        // 获取节点名称并更新 reactive 变量
        doubleClickedNodeName.value = clickedNode.name || 'Unnamed Node'; // 使用 name，如果没有则显示 'Unnamed Node'
        console.log('Double-clicked node name:', doubleClickedNodeName.value);

        // 继续获取邻居节点 (这会触发 isNeighborView.value 变为 true)
        graphStore.fetchNodeNeighbors(nodeId);
    } else {
        console.warn(`Node with ID ${nodeId} not found in currentNodes.`);
        doubleClickedNodeName.value = ''; // 找不到节点时清空显示
    }

};

// **修改后的函数：处理 GraphFilterSidebar 发出的 apply-filters 事件**
const handleApplyFilters = (filters) => {
  console.log('Applying filters from sidebar:', filters); // Log filters

  const { filterProp, filterValue } = filters;

  // 检查是否有有效的过滤属性和值
  if (filterProp && filterValue) {
       // 调用 Store 中的 fetchFilteredGraph action，并传递 filterProp 和 filterValue
      graphStore.fetchFilteredGraph(filterProp, filterValue);
  } else if (filterProp || filterValue) {
      // 如果只输入了属性名或属性值，显示提示
      graphStore.error = 'Please enter both property name and value for filtering.';
      console.log('Partial filter criteria entered.');
  } else {
      // 如果没有输入任何过滤条件，可以不进行任何操作或返回到初始图谱
      console.log('No filter criteria entered. Returning to initial graph.');
      graphStore.showInitialGraph(); // 例如：没有过滤条件时显示完整图谱
  }
};


// 处理返回按钮点击
const goBackToFullGraph = () => {
    graphStore.showInitialGraph();
};

// 组件挂载后加载初始数据
onMounted(() => {
    // 修改：现在我们依赖 initialNodes/Links 来进行前端过滤，所以确保它们被加载
    // 如果你仍然希望每次加载页面时都获取初始图谱，可以保留以下代码
    // if (graphStore.initialNodes.length === 0) {
    //     graphStore.fetchInitialGraph();
    // }
    // 或者，如果你希望默认显示一个空图谱，直到用户应用过滤，可以移除以下代码
    graphStore.fetchInitialGraph(); // 默认加载初始图谱
});
</script>

<style scoped>
/* frontend/pages/index.vue 的样式 - 知识图谱页面布局和元素样式 */

/* 这里的颜色变量定义可以移除，因为它们应该在 main.css 中全局定义 */
/* 如果你需要在组件内部覆盖或定义新的变量，可以在这里保留 */
/* :root {
  --primary-color: #4a90e2;
  --secondary-color: #7bdcb5;
  --background-color: #f4f7f6;
  --surface-color: #ffffff;
  --text-color: #333333;
  --subtle-text-color: #666666;
  --border-color: #dddddd;
  --shadow-color: rgba(0, 0, 0, 0.1);
  --hover-shadow-color: rgba(0, 0, 0, 0.15);
} */

.app-layout {
    display: flex;
    /* 高度设置为 100%，占据父容器的可用高度 */
    /* 如果父容器 (page-content) 占据剩余视口高度，这里就会占满 */
    flex-grow: 1; /* 在 page-content 中占据剩余空间 */
    width: 100%;
    padding: 20px; /* 增加整体内边距 */
    gap: 20px; /* 增加侧边栏和主内容之间的间距 */
    max-width: 1400px; /* 设置最大宽度 */
    margin: 0 auto; /* 居中 */
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

.graph-title{
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  position: relative;
  font-size: 18px;
  box-shadow: 0 4px 12px var(--shadow-color); /* 添加阴影 */
  background-color: var(--surface-color); /* 应用表面色 */
  border-radius: 15px; /* 圆润边角 */
  width: 100%;
  margin-left: 0;
  height: 3rem;
}
.title-text{

}
.back-button {
    padding: 10px 15px; /* 增加内边距 */
    background-color: var(--primary-color); /* 使用主题色 */
    color: white; /* 文字颜色为白色 */
    border: none;
    border-radius: 8px; /* 增加圆角 */
    cursor: pointer;
    transition: background-color 0.3s ease, transform 0.1s ease, box-shadow 0.3s ease; /* 添加阴影过渡 */
    box-shadow: 0 2px 4px var(--shadow-color); /* 默认阴影 */
}
.back-button:hover {
    background-color: var(--primary-color-dark); /* 悬停时颜色变深 */
    transform: translateY(-2px); /* 悬停时微小上移 */
    box-shadow: 0 4px 8px var(--hover-shadow-color); /* 悬停时增加阴影 */
}
.back-button:active {
    transform: translateY(0); /* 点击时恢复位置 */
    box-shadow: 0 2px 4px var(--shadow-color); /* 点击时阴影恢复 */
}

.loading-indicator, .error-message, .no-data {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-grow: 1; /* 让这些元素占据可用空间 */
    font-size: 1.3em; /* 字体稍大 */
    color: var(--subtle-text-color); /* 应用中灰色文字 */
    text-align: center;
    padding: 20px;
    border-radius: 10px; /* 添加圆角 */
    /* 背景可以根据需要调整 */
}

.error-message {
    color: #e53e3e; /* 使用红色表示错误 */
}

.graph-area {
    flex-grow: 1; /* 让图表区域填充剩余空间 */
    width: 100%;
    min-height: 400px; /* 保证最小高度 */
    /* 图表容器的圆角和阴影将在 GraphChart.vue 内部设置 */
}

/* media queries for responsiveness */
@media (max-width: 768px) {
    .app-layout {
        flex-direction: column; /* 在小屏幕上垂直堆叠侧边栏和主内容区域 */
        padding: 10px;
        gap: 10px;
    }

    .sidebar-area {
        width: 100%; /* 小屏幕下侧边栏宽度为100% */
    }

    .main-content {
        padding: 10px;
    }

}
.button-box{
      position: absolute;
      left: 15px;
      top: 50%;                /* 配合 transform 实现垂直居中 */
      transform: translateY(-50%); /* 实现垂直居中 */
    }
</style>
