<template>
  <div class="min-h-screen bg-gray-50 dark:bg-dark-bg">
    <div class="container mx-auto px-4 py-8">
      <!-- 返回按钮 -->
      <div class="mb-6">
        <button 
          @click="$router.back()"
          class="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          返回资源列表
        </button>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="error" class="text-center py-12">
        <div class="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 class="text-xl font-semibold text-gray-900 dark:text-dark-text mb-2">加载失败</h2>
        <p class="text-gray-600 dark:text-dark-text-secondary mb-4">{{ error }}</p>
        <button 
          @click="loadResource"
          class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
        >
          重试
        </button>
      </div>

      <!-- 资源详情 -->
      <div v-else-if="resource" class="max-w-4xl mx-auto">
        <!-- 资源头部信息 -->
        <div class="bg-white dark:bg-dark-surface rounded-xl shadow-lg p-8 mb-8">
          <div class="flex flex-wrap items-start justify-between mb-6">
            <div class="flex-1 min-w-0">
              <div class="flex items-center mb-4">
                <span 
                  class="inline-block px-3 py-1 rounded-full text-sm font-medium mr-3"
                  :class="getTypeClass(resource.type)"
                >
                  {{ getTypeName(resource.type) }}
                </span>
                <span class="text-sm text-gray-500 dark:text-dark-text-secondary">
                  {{ formatDate(resource.createdAt) }}
                </span>
              </div>
              <h1 class="text-3xl font-bold text-gray-900 dark:text-dark-text mb-4">
                {{ resource.title }}
              </h1>
              <p class="text-lg text-gray-600 dark:text-dark-text-secondary mb-6">
                {{ resource.description }}
              </p>
            </div>
          </div>

          <!-- 统计信息 -->
          <div class="flex items-center space-x-6 text-sm text-gray-500 dark:text-dark-text-secondary mb-6">
            <span class="flex items-center">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {{ resource.views }} 次浏览
            </span>
            <span class="flex items-center">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {{ resource.likes }} 个赞
            </span>
            <span class="flex items-center">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              {{ resource.tags.join(', ') }}
            </span>
          </div>

          <!-- 操作按钮 -->
          <div class="flex items-center space-x-4">
            <button 
              @click="toggleLike"
              class="flex items-center px-4 py-2 rounded-lg transition-colors duration-200"
              :class="isLiked ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400' : 'bg-gray-100 text-gray-600 dark:bg-dark-bg dark:text-dark-text hover:bg-gray-200 dark:hover:bg-gray-700'"
            >
              <svg class="w-4 h-4 mr-2" :fill="isLiked ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {{ isLiked ? '已点赞' : '点赞' }}
            </button>
            <button 
              @click="shareResource"
              class="flex items-center px-4 py-2 bg-gray-100 text-gray-600 dark:bg-dark-bg dark:text-dark-text rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
              分享
            </button>
          </div>
        </div>

        <!-- 资源内容 -->
        <div class="bg-white dark:bg-dark-surface rounded-xl shadow-lg p-8 mb-8">
          <h2 class="text-2xl font-semibold text-gray-900 dark:text-dark-text mb-6">资源内容</h2>
          
          <!-- 视频内容 -->
          <div v-if="resource.type === 'video'" class="mb-6">
            <div class="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <div class="text-center">
                <svg class="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" />
                </svg>
                <p class="text-gray-500 dark:text-gray-400">视频播放器</p>
                <p class="text-sm text-gray-400 dark:text-gray-500 mt-2">点击播放按钮开始观看</p>
              </div>
            </div>
          </div>

          <!-- 文章内容 -->
          <div v-else class="prose dark:prose-invert max-w-none">
            <div v-html="resource.content || getDefaultContent()"></div>
          </div>
        </div>

        <!-- 相关资源推荐 -->
        <div class="bg-white dark:bg-dark-surface rounded-xl shadow-lg p-8">
          <h2 class="text-2xl font-semibold text-gray-900 dark:text-dark-text mb-6">相关推荐</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div 
              v-for="relatedResource in relatedResources" 
              :key="relatedResource.id"
              class="border border-gray-200 dark:border-dark-border rounded-lg p-4 hover:shadow-md transition-shadow duration-200 cursor-pointer"
              @click="navigateTo(`/resources/${relatedResource.id}`)"
            >
              <div class="flex items-center mb-2">
                <span 
                  class="inline-block px-2 py-1 rounded text-xs font-medium mr-2"
                  :class="getTypeClass(relatedResource.type)"
                >
                  {{ getTypeName(relatedResource.type) }}
                </span>
              </div>
              <h3 class="font-semibold text-gray-900 dark:text-dark-text mb-2 line-clamp-2">
                {{ relatedResource.title }}
              </h3>
              <p class="text-sm text-gray-600 dark:text-dark-text-secondary line-clamp-2">
                {{ relatedResource.description }}
              </p>
              <div class="flex items-center justify-between mt-3 text-xs text-gray-500 dark:text-dark-text-secondary">
                <span>{{ relatedResource.views }} 浏览</span>
                <span>{{ formatDate(relatedResource.createdAt) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { fetchQuestions } from '~/composables/useApi'

// 页面布局
definePageMeta({
  layout: 'default'
})

// 获取路由参数
const route = useRoute()
const resourceId = route.params.id

// 页面元数据
useHead({
  title: computed(() => resource.value ? `${resource.value.title} - 学习资源` : '学习资源详情'),
  meta: [
    { name: 'description', content: computed(() => resource.value?.description || '查看详细的学习资源内容') }
  ]
})

// 响应式数据
const loading = ref(true)
const error = ref(null)
const resource = ref(null)
const isLiked = ref(false)
const relatedResources = ref([])

// 资源数据将从API获取

// 获取资源详情
const loadResource = async () => {
  try {
    loading.value = true
    error.value = null
    // TODO: 实现从API获取资源详情
    // const response = await $fetch(`/api/resources/${resourceId}`)
    // resource.value = response.data
  } catch (err) {
    error.value = err.message || '获取资源详情失败'
  } finally {
    loading.value = false
  }
}
// 类型映射
const getTypeName = (type) => {
  const typeMap = {
    'article': '文章',
    'video': '视频',
    'guide': '指南',
    'case': '案例'
  }
  return typeMap[type] || '未知'
}

const getTypeClass = (type) => {
  const classMap = {
    'article': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
    'video': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    'guide': 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
    'case': 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
  }
  return classMap[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
}

// 页面挂载时加载数据
onMounted(() => {
  loadResource()
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.prose {
  max-width: none;
}

.prose h3 {
  @apply text-xl font-semibold text-gray-900 dark:text-dark-text mt-6 mb-4;
}

.prose h4 {
  @apply text-lg font-medium text-gray-800 dark:text-dark-text mt-4 mb-2;
}

.prose p {
  @apply text-gray-600 dark:text-dark-text-secondary mb-4 leading-relaxed;
}

.prose ul {
  @apply list-disc list-inside mb-4 text-gray-600 dark:text-dark-text-secondary;
}

.prose li {
  @apply mb-2;
}
</style>