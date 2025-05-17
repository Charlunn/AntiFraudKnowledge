<template>
    <div class="app-layout">
        <!-- 侧边栏 -->
        <GraphFilterSidebar class="sidebar-area" />

        <!-- 主内容区域 -->
        <main class="main-content">
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

.back-button {
    position: absolute;
    top: 25px; /* 调整位置 */
    left: 25px; /* 调整位置 */
    z-index: 10; /* 确保在图表上层 */
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

    .back-button {
        top: 10px;
        left: 10px;
        padding: 8px 12px; /* 调整小屏幕下的内边距 */
    }
}
</style>
