<template>
  <div class="min-h-screen bg-gray-50 dark:bg-dark-bg">
    <div class="container mx-auto px-4 py-8">
      <!-- 页面标题 -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-gray-900 dark:text-dark-text mb-4">
          学习资源
        </h1>
        <p class="text-xl text-gray-600 dark:text-dark-text-secondary max-w-3xl mx-auto">
          丰富的反欺诈案例、防范指南和学习材料，帮助您全面提升防范意识
        </p>
      </div>

      <!-- 资源分类导航 -->
      <div class="flex flex-wrap justify-center gap-4 mb-8">
        <button 
          v-for="category in categories" 
          :key="category.id"
          @click="activeCategory = category.id"
          class="px-6 py-2 rounded-full font-medium transition-colors duration-200"
          :class="activeCategory === category.id 
            ? 'bg-blue-500 text-white' 
            : 'bg-white dark:bg-dark-surface text-gray-700 dark:text-dark-text hover:bg-blue-50 dark:hover:bg-dark-bg'"
        >
          {{ category.name }}
        </button>
      </div>

      <!-- 资源列表 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          v-for="resource in filteredResources" 
          :key="resource.id"
          class="bg-white dark:bg-dark-surface rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
        >
          <!-- 资源类型标签 -->
          <div class="flex items-center justify-between mb-4">
            <span 
              class="px-3 py-1 rounded-full text-sm font-medium"
              :class="getTypeClass(resource.type)"
            >
              {{ getTypeName(resource.type) }}
            </span>
            <span class="text-sm text-gray-500 dark:text-dark-text-secondary">
              {{ formatDate(resource.createdAt) }}
            </span>
          </div>

          <!-- 资源标题和描述 -->
          <h3 class="text-xl font-semibold text-gray-900 dark:text-dark-text mb-2">
            {{ resource.title }}
          </h3>
          <p class="text-gray-600 dark:text-dark-text-secondary mb-4 line-clamp-3">
            {{ resource.description }}
          </p>

          <!-- 资源标签 -->
          <div class="flex flex-wrap gap-2 mb-4">
            <span 
              v-for="tag in resource.tags" 
              :key="tag"
              class="px-2 py-1 bg-gray-100 dark:bg-dark-bg text-gray-600 dark:text-dark-text-secondary text-xs rounded-md"
            >
              {{ tag }}
            </span>
          </div>

          <!-- 操作按钮 -->
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4 text-sm text-gray-500 dark:text-dark-text-secondary">
              <span class="flex items-center">
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {{ resource.views }}
              </span>
              <span class="flex items-center">
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {{ resource.likes }}
              </span>
            </div>
            <button 
              @click="viewResource(resource)"
              class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
            >
              查看详情
            </button>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="filteredResources.length === 0" class="text-center py-12">
        <svg class="w-16 h-16 text-gray-400 dark:text-dark-text-secondary mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p class="text-gray-500 dark:text-dark-text-secondary text-lg">暂无相关资源</p>
        <p class="text-sm text-gray-400 dark:text-dark-text-secondary mt-2">请尝试选择其他分类或稍后再来查看</p>
      </div>

      <!-- 分页 -->
      <div v-if="totalPages > 1" class="flex justify-center mt-8">
        <nav class="flex space-x-2">
          <button 
            v-for="page in totalPages" 
            :key="page"
            @click="currentPage = page"
            class="px-4 py-2 rounded-lg font-medium transition-colors duration-200"
            :class="currentPage === page 
              ? 'bg-blue-500 text-white' 
              : 'bg-white dark:bg-dark-surface text-gray-700 dark:text-dark-text hover:bg-blue-50 dark:hover:bg-dark-bg'"
          >
            {{ page }}
          </button>
        </nav>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// 页面布局
definePageMeta({
  layout: 'default'
})

// 页面元数据
useHead({
  title: '学习资源',
  meta: [
    { name: 'description', content: '丰富的反欺诈案例、防范指南和学习材料' }
  ]
})

// 响应式数据
const activeCategory = ref('all')
const currentPage = ref(1)
const pageSize = 12

// 资源分类
const categories = [
  { id: 'all', name: '全部' },
  { id: 'case', name: '案例分析' },
  { id: 'guide', name: '防范指南' },
  { id: 'video', name: '视频教程' },
  { id: 'article', name: '文章资讯' },
  { id: 'tool', name: '实用工具' }
]

// 模拟资源数据
const resources = ref([
  {
    id: 1,
    title: '电信诈骗典型案例分析',
    description: '深入分析近期高发的电信诈骗案例，总结诈骗手法和防范要点',
    type: 'case',
    category: 'case',
    tags: ['电信诈骗', '案例分析', '防范技巧'],
    views: 1250,
    likes: 89,
    createdAt: '2024-01-15'
  },
  {
    id: 2,
    title: '网络购物安全防范指南',
    description: '全面介绍网络购物中的常见陷阱和安全防范措施',
    type: 'guide',
    category: 'guide',
    tags: ['网络购物', '安全防范', '消费者保护'],
    views: 980,
    likes: 67,
    createdAt: '2024-01-12'
  },
  {
    id: 3,
    title: '识别虚假投资平台',
    description: '教您如何识别和避免虚假投资平台的陷阱',
    type: 'video',
    category: 'video',
    tags: ['投资诈骗', '平台识别', '风险防范'],
    views: 2100,
    likes: 156,
    createdAt: '2024-01-10'
  },
  {
    id: 4,
    title: '反诈骗最新动态',
    description: '关注最新的诈骗手法和防范措施更新',
    type: 'article',
    category: 'article',
    tags: ['最新动态', '诈骗手法', '防范更新'],
    views: 750,
    likes: 45,
    createdAt: '2024-01-08'
  },
  {
    id: 5,
    title: '诈骗电话识别工具',
    description: '实用的诈骗电话识别和举报工具使用指南',
    type: 'tool',
    category: 'tool',
    tags: ['识别工具', '举报功能', '实用工具'],
    views: 1580,
    likes: 112,
    createdAt: '2024-01-05'
  }
])

// 计算属性
const filteredResources = computed(() => {
  let filtered = resources.value
  if (activeCategory.value !== 'all') {
    filtered = filtered.filter(resource => resource.category === activeCategory.value)
  }
  
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return filtered.slice(start, end)
})

const totalPages = computed(() => {
  let filtered = resources.value
  if (activeCategory.value !== 'all') {
    filtered = filtered.filter(resource => resource.category === activeCategory.value)
  }
  return Math.ceil(filtered.length / pageSize)
})

// 方法
const getTypeClass = (type) => {
  const classes = {
    'case': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    'guide': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
    'video': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    'article': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    'tool': 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
  }
  return classes[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
}

const getTypeName = (type) => {
  const names = {
    'case': '案例分析',
    'guide': '防范指南',
    'video': '视频教程',
    'article': '文章资讯',
    'tool': '实用工具'
  }
  return names[type] || '其他'
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const viewResource = (resource) => {
  // TODO: 实现资源详情查看功能
  console.log('查看资源:', resource)
}

// 生命周期
onMounted(() => {
  // TODO: 从API加载资源数据
  // loadResources()
})
</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>