<template>
  <div class="min-h-screen bg-muted/40 dark:bg-muted/40">
    <div class="container mx-auto px-4 py-8">
      <!-- 返回按钮 -->
      <div class="mb-6">
        <button 
          @click="$router.back()"
          class="flex items-center text-primary dark:text-primary hover:text-primary dark:hover:text-primary/70 transition-colors duration-200"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          返回资源列表
        </button>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="error" class="text-center py-12">
        <div class="w-16 h-16 bg-destructive/10 dark:bg-destructive/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-destructive dark:text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 class="text-xl font-semibold text-foreground dark:text-foreground mb-2">加载失败</h2>
        <p class="text-muted-foreground dark:text-muted-foreground mb-4">{{ error }}</p>
        <button 
          @click="loadResource"
          class="bg-primary/100 hover:bg-primary text-white px-4 py-2 rounded-lg transition-colors duration-200"
        >
          重试
        </button>
      </div>

      <!-- 资源详情 -->
      <div v-else-if="resource" class="max-w-4xl mx-auto">
        <!-- 资源头部信息 -->
        <div class="bg-card dark:bg-card rounded-xl shadow-lg p-8 mb-8">
          <div class="flex flex-wrap items-start justify-between mb-6">
            <div class="flex-1 min-w-0">
              <div class="flex items-center mb-4">
                <span 
                  class="inline-block px-3 py-1 rounded-full text-sm font-medium mr-3"
                  :class="getTypeClass(resource.type)"
                >
                  {{ getTypeName(resource.type) }}
                </span>
                <span class="text-sm text-muted-foreground dark:text-muted-foreground">
                  {{ formatDate(resource.createdAt) }}
                </span>
              </div>
              <h1 class="text-3xl font-bold text-foreground dark:text-foreground mb-4">
                {{ resource.title }}
              </h1>
              <p class="text-lg text-muted-foreground dark:text-muted-foreground mb-6">
                {{ resource.description }}
              </p>
            </div>
          </div>

          <!-- 统计信息 -->
          <div class="flex items-center space-x-6 text-sm text-muted-foreground dark:text-muted-foreground mb-6">
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
              :class="isLiked ? 'bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive' : 'bg-muted/60 text-muted-foreground dark:bg-muted/40 dark:text-foreground hover:bg-muted/60 dark:hover:bg-muted/40'"
            >
              <svg class="w-4 h-4 mr-2" :fill="isLiked ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {{ isLiked ? '已点赞' : '点赞' }}
            </button>
            <button 
              @click="shareResource"
              class="flex items-center px-4 py-2 bg-muted/60 text-muted-foreground dark:bg-muted/40 dark:text-foreground rounded-lg hover:bg-muted/60 dark:hover:bg-muted/40 transition-colors duration-200"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
              分享
            </button>
          </div>
        </div>

        <!-- 资源内容 -->
        <div class="bg-card dark:bg-card rounded-xl shadow-lg p-8 mb-8">
          <h2 class="text-2xl font-semibold text-foreground dark:text-foreground mb-6">资源内容</h2>
          
          <!-- 视频内容 -->
          <div v-if="resource.type === 'video'" class="mb-6">
            <div class="aspect-video bg-muted/60 dark:bg-muted/40 rounded-lg flex items-center justify-center">
              <div class="text-center">
                <svg class="w-16 h-16 text-muted-foreground dark:text-muted-foreground mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" />
                </svg>
                <p class="text-muted-foreground dark:text-muted-foreground">视频播放器</p>
                <p class="text-sm text-muted-foreground dark:text-muted-foreground mt-2">点击播放按钮开始观看</p>
              </div>
            </div>
          </div>

          <!-- 文章内容 -->
          <div v-else class="prose dark:prose-invert max-w-none">
            <div v-html="resource.content || getDefaultContent()"></div>
          </div>
        </div>

        <!-- 相关资源推荐 -->
        <div class="bg-card dark:bg-card rounded-xl shadow-lg p-8">
          <h2 class="text-2xl font-semibold text-foreground dark:text-foreground mb-6">相关推荐</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div 
              v-for="relatedResource in relatedResources" 
              :key="relatedResource.id"
              class="border border-border dark:border-border rounded-lg p-4 hover:shadow-md transition-shadow duration-200 cursor-pointer"
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
              <h3 class="font-semibold text-foreground dark:text-foreground mb-2 line-clamp-2">
                {{ relatedResource.title }}
              </h3>
              <p class="text-sm text-muted-foreground dark:text-muted-foreground line-clamp-2">
                {{ relatedResource.description }}
              </p>
              <div class="flex items-center justify-between mt-3 text-xs text-muted-foreground dark:text-muted-foreground">
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
    'article': 'bg-primary/20 text-primary dark:bg-primary/20 dark:text-primary',
    'video': 'bg-primary/20 text-success-700 dark:bg-success-900/20 dark:text-success-400',
    'guide': 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
    'case': 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
  }
  return classMap[type] || 'bg-muted/60 text-foreground dark:bg-background/20 dark:text-muted-foreground'
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
  @apply text-xl font-semibold text-foreground dark:text-foreground mt-6 mb-4;
}

.prose h4 {
  @apply text-lg font-medium text-foreground dark:text-foreground mt-4 mb-2;
}

.prose p {
  @apply text-muted-foreground dark:text-muted-foreground mb-4 leading-relaxed;
}

.prose ul {
  @apply list-disc list-inside mb-4 text-muted-foreground dark:text-muted-foreground;
}

.prose li {
  @apply mb-2;
}
</style>