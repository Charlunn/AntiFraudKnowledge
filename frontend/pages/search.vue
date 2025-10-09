<template>
  <div class="min-h-screen bg-muted/40 dark:bg-muted/40">
    <div class="container mx-auto px-4 py-8">
      <!-- 页面标题 -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-foreground dark:text-foreground mb-2">
          搜索
        </h1>
        <p class="text-muted-foreground dark:text-muted-foreground">
          搜索知识图谱、测验、社区内容和学习资源
        </p>
      </div>

      <!-- 搜索框 -->
      <div class="mb-8">
        <div class="relative max-w-2xl mx-auto">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg class="h-5 w-5 text-muted-foreground dark:text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="输入搜索关键词..."
            class="block w-full pl-10 pr-3 py-3 border border-border dark:border-border rounded-lg bg-card dark:bg-card text-foreground dark:text-foreground placeholder:text-muted-foreground dark:placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            @keyup.enter="performSearch"
          >
        </div>
        <div class="flex justify-center mt-4">
          <button
            @click="performSearch"
            :disabled="!searchQuery.trim() || loading"
            class="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <span v-if="loading" class="flex items-center">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              搜索中...
            </span>
            <span v-else>搜索</span>
          </button>
        </div>
      </div>

      <!-- 搜索过滤器 -->
      <div class="mb-6" v-if="searchQuery">
        <div class="flex flex-wrap gap-2">
          <button
            v-for="filter in searchFilters"
            :key="filter.key"
            @click="toggleFilter(filter.key)"
            class="px-3 py-1 text-sm rounded-full border transition-colors duration-200"
            :class="activeFilters.includes(filter.key) 
              ? 'bg-primary text-white border-primary' 
              : 'bg-card dark:bg-card text-muted-foreground dark:text-foreground border-border dark:border-border hover:bg-muted/40 dark:hover:bg-muted/30'"
          >
            {{ filter.label }}
          </button>
        </div>
      </div>

      <!-- 搜索结果 -->
      <div v-if="searchResults.length > 0" class="space-y-6">
        <div class="text-sm text-muted-foreground dark:text-muted-foreground">
          找到 {{ searchResults.length }} 个结果
        </div>
        
        <div class="grid gap-6">
          <div
            v-for="result in filteredResults"
            :key="result.id"
            class="bg-card dark:bg-card rounded-lg shadow-sm border border-border dark:border-border p-6 hover:shadow-md transition-shadow duration-200"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center space-x-2 mb-2">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    :class="getTypeClass(result.type)">
                    {{ getTypeLabel(result.type) }}
                  </span>
                </div>
                <h3 class="text-lg font-semibold text-foreground dark:text-foreground mb-2">
                  <NuxtLink :to="result.url" class="hover:text-primary transition-colors duration-200">
                    {{ result.title }}
                  </NuxtLink>
                </h3>
                <p class="text-muted-foreground dark:text-muted-foreground mb-3">
                  {{ result.description }}
                </p>
                <div class="flex items-center space-x-4 text-sm text-muted-foreground dark:text-muted-foreground">
                  <span v-if="result.author">作者: {{ result.author }}</span>
                  <span v-if="result.date">{{ formatDate(result.date) }}</span>
                  <span v-if="result.views">{{ result.views }} 次查看</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 无搜索结果 -->
      <div v-else-if="searchQuery && !loading" class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-muted-foreground dark:text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-foreground dark:text-foreground">未找到搜索结果</h3>
        <p class="mt-1 text-sm text-muted-foreground dark:text-muted-foreground">请尝试使用不同的关键词或调整搜索过滤器</p>
      </div>

      <!-- 搜索建议 -->
      <div v-else class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-muted-foreground dark:text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-foreground dark:text-foreground">开始搜索</h3>
        <p class="mt-1 text-sm text-muted-foreground dark:text-muted-foreground">输入关键词搜索知识图谱、测验、社区内容和学习资源</p>
        
        <div class="mt-6">
          <h4 class="text-sm font-medium text-foreground dark:text-foreground mb-3">热门搜索</h4>
          <div class="flex flex-wrap justify-center gap-2">
            <button
              v-for="suggestion in searchSuggestions"
              :key="suggestion"
              @click="searchQuery = suggestion; performSearch()"
              class="px-3 py-1 text-sm bg-muted/50 dark:bg-muted/40 text-muted-foreground dark:text-foreground rounded-full hover:bg-muted/60 dark:hover:bg-muted/30 transition-colors duration-200"
            >
              {{ suggestion }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

// 设置页面元数据
definePageMeta({
  layout: 'default'
})

useHead({
  title: '搜索 - 反欺诈知识平台',
  meta: [
    { name: 'description', content: '搜索反欺诈知识图谱、测验、社区内容和学习资源' }
  ]
})

// 响应式数据
const route = useRoute()
const router = useRouter()
const searchQuery = ref('')
const loading = ref(false)
const searchResults = ref([])
const activeFilters = ref([])

// 搜索过滤器
const searchFilters = [
  { key: 'all', label: '全部' },
  { key: 'knowledge', label: '知识图谱' },
  { key: 'quiz', label: '测验' },
  { key: 'community', label: '社区' },
  { key: 'resources', label: '学习资源' }
]

// 搜索建议
const searchSuggestions = [
  '电信诈骗',
  '网络钓鱼',
  '身份盗用',
  '金融诈骗',
  '社交工程',
  '恶意软件'
]

// 计算属性
const filteredResults = computed(() => {
  if (activeFilters.value.length === 0 || activeFilters.value.includes('all')) {
    return searchResults.value
  }
  return searchResults.value.filter(result => activeFilters.value.includes(result.type))
})

// 方法
const performSearch = async () => {
  if (!searchQuery.value.trim()) return
  
  loading.value = true
  
  try {
    // 模拟搜索API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 模拟搜索结果
    searchResults.value = [
      {
        id: 1,
        type: 'knowledge',
        title: '电信诈骗防范知识图谱',
        description: '详细介绍电信诈骗的各种手段、识别方法和防范措施，包含真实案例分析。',
        url: '/graph?node=telecom-fraud',
        author: '反欺诈专家',
        date: '2024-01-15',
        views: 1250
      },
      {
        id: 2,
        type: 'quiz',
        title: '网络钓鱼识别测验',
        description: '通过实际案例测试您识别网络钓鱼攻击的能力，提高网络安全意识。',
        url: '/quiz/2',
        author: '安全教育团队',
        date: '2024-01-10',
        views: 890
      },
      {
        id: 3,
        type: 'community',
        title: '如何识别虚假投资平台？',
        description: '社区用户分享的识别虚假投资平台的经验和技巧，避免金融诈骗。',
        url: '/community/15',
        author: '用户张三',
        date: '2024-01-08',
        views: 567
      },
      {
        id: 4,
        type: 'resources',
        title: '反欺诈法律法规汇编',
        description: '收集整理了相关的反欺诈法律法规，帮助用户了解法律保护措施。',
        url: '/resources/legal-guide',
        author: '法务团队',
        date: '2024-01-05',
        views: 432
      }
    ].filter(item => 
      item.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  } catch (error) {
    console.error('搜索失败:', error)
    searchResults.value = []
  } finally {
    loading.value = false
  }
}

const toggleFilter = (filterKey) => {
  if (filterKey === 'all') {
    activeFilters.value = ['all']
  } else {
    const index = activeFilters.value.indexOf(filterKey)
    if (index > -1) {
      activeFilters.value.splice(index, 1)
    } else {
      activeFilters.value = activeFilters.value.filter(f => f !== 'all')
      activeFilters.value.push(filterKey)
    }
    
    if (activeFilters.value.length === 0) {
      activeFilters.value = ['all']
    }
  }
}

const getTypeClass = (type) => {
  const classes = {
    knowledge: 'bg-primary/20 text-primary dark:bg-primary/20 dark:text-primary',
    quiz: 'bg-primary/20 text-success-700 dark:bg-success-900/20 dark:text-success-400',
    community: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
    resources: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
  }
  return classes[type] || 'bg-muted/60 text-foreground dark:bg-background/20 dark:text-muted-foreground'
}

const getTypeLabel = (type) => {
  const labels = {
    knowledge: '知识图谱',
    quiz: '测验',
    community: '社区',
    resources: '学习资源'
  }
  return labels[type] || '其他'
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN')
}

// 生命周期
onMounted(() => {
  // 从URL参数获取搜索关键词
  if (route.query.q) {
    searchQuery.value = route.query.q
    performSearch()
  }
  
  // 设置默认过滤器
  activeFilters.value = ['all']
})
</script>

<style scoped>
/* 自定义样式 */
</style>