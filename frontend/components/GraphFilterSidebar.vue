<template>
  <div class="filter-sidebar">
    <h2>Graph Filters</h2>

    <div class="filter-group">
      <label for="filter-prop">Property Name:</label>
      <input type="text" id="filter-prop" v-model="localFilters.filterProp" />
    </div>

    <div class="filter-group">
      <label for="filter-value">Property Value:</label>
      <input type="text" id="filter-value" v-model="localFilters.filterValue" />
    </div>

    <!-- 添加一个用于显示错误信息的元素 -->
    <div :class="['error-message', { hidden: !errorMessage }]">{{ errorMessage }}</div>

    <button @click="applyFilters" :disabled="isLoading">Apply Filters</button>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  filters: {
    type: Object,
    required: true,
    default: () => ({
      filterProp: '',
      filterValue: ''
    })
  },
  isLoading: {
    type: Boolean,
    default: false
  },
  errorMessage: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['apply-filters']);

// 创建一个内部的 ref 来存储过滤器的临时值
const localFilters = ref({
 filterProp: props.filters.filterProp || '',
 filterValue: props.filters.filterValue || ''
});

// 监听外部 filters prop 的变化，以便在外部重置时更新内部状态
watch(() => props.filters, (newFilters) => {
 localFilters.value = {
 filterProp: newFilters.filterProp || '',
 filterValue: newFilters.filterValue || ''
 };
}, { deep: true });

const applyFilters = () => {
  emit('apply-filters', { filterProp: localFilters.value.filterProp, filterValue: localFilters.value.filterValue });
};

</script>

<style scoped>
/* frontend/components/GraphFilterSidebar.vue */

.filter-sidebar {
  width: 300px; /* 调整侧边栏宽度 */
  background-color: var(--surface-color); /* 使用表面色作为背景 */
  padding: 25px; /* 增加内边距 */
  border-radius: 15px; /* 增加圆角，与卡片样式一致 */
  box-shadow: 0 8px 24px var(--shadow-color); /* 添加柔和的阴影 */
  display: flex;
  flex-direction: column; /* 垂直布局 */
  gap: 20px; /* 增加元素之间的垂直间距 */
}

.filter-sidebar h2 {
  margin-top: 0;
  margin-bottom: 10px; /* 调整标题下外边距 */
  font-size: 1.6rem; /* 调整标题字号 */
  color: var(--text-color); /* 使用文字颜色 */
  font-weight: 700;
}

.filter-group {
  display: flex;
  flex-direction: column; /* 标签和输入框垂直布局 */
  gap: 8px; /* 标签和输入框之间的间距 */
}

.filter-group label {
  font-weight: 600; /* 加粗标签 */
  color: var(--text-color); /* 使用文字颜色 */
  font-size: 0.95em; /* 稍微调整字号 */
}

.filter-group input[type="text"] {
  /* 输入框样式将继承 main.css 中的基础样式 */
  /* 可以根据需要在组件内进行微调 */
   padding: 12px; /* 增加内边距 */
   border-radius: 10px; /* 增加圆角 */
   border: 1px solid var(--border-color);
   background-color: var(--background-color); /* 输入框背景使用浅灰色，与侧边栏背景区分 */
   color: var(--text-color);
   transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.filter-group input[type="text"]:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(var(--primary-color-dark), 0.1);
}


button {
  /* 按钮样式将继承 main.css 中的基础样式 */
  /* 在此可以根据侧边栏的特定需求进行微调 */
  width: 100%; /* 按钮填充父容器宽度 */
  padding: 12px 20px; /* 增加内边距 */
  background-color: var(--primary-color); /* 使用主题色 */
  color: white; /* 文字颜色为白色，确保与主题色对比 */
  border: none;
  border-radius: 10px; /* 增加圆角 */
  cursor: pointer;
  font-size: 1.1em;
  font-weight: bold;
  transition: background-color 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease;
  /* 添加一个细微的边框或更明显的阴影来增强可见性 */
  border: 1px solid rgba(0, 0, 0, 0.1); /* 添加一个细微的边框 */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* 默认状态下的阴影 */
}

button:hover {
  background-color: var(--primary-color-dark); /* 悬停时颜色变深，使用主题色深色版本 */
  box-shadow: 0 6px 16px var(--hover-shadow-color); /* 悬停时增加阴影 */
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
  color: #e53e3e; /* 使用红色表示错误 */
  font-size: 0.9em;
  margin-top: 10px;
  opacity: 1; /* 默认可见 */
  transition: opacity 0.5s ease-in-out; /* 淡入淡出动画 */
}

.error-message.hidden {
  opacity: 0; /* 隐藏时完全透明 */
  pointer-events: none; /* 隐藏时禁用鼠标事件 */
}
</style>
