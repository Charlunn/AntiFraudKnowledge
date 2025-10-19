<template>
  <div class="community-page fadeInUp">
    <!-- 页面头部 -->
    <div class="page-header fadeInDown">
      <div class="header-content">
        <div class="header-text">
          <h1 class="page-title">社区讨论</h1>
          <p class="page-description">与其他用户交流反欺诈知识，分享经验和见解</p>
        </div>
        
        <div class="header-actions">
          <button @click="refreshPosts" class="btn btn-secondary" :disabled="loading">
            <Icon name="heroicons:arrow-path" class="w-4 h-4" :class="{ 'animate-spin': loading }" />
            刷新
          </button>
          <button @click="showCreatePost = true" class="btn btn-primary">
            <Icon name="heroicons:plus" class="w-4 h-4" />
            发布帖子
          </button>
        </div>
      </div>
    </div>
    
    <!-- 社区统计 -->
    <div class="community-stats slideInUp">
      <div class="stat-card hover-lift fadeInUp delay-100">
        <div class="stat-icon">
          <Icon name="heroicons:chat-bubble-left-right" class="w-6 h-6 text-primary" />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats?.total_posts || 0 }}</div>
          <div class="stat-label">总帖子数</div>
        </div>
      </div>
      
      <div class="stat-card hover-lift fadeInUp delay-200">
        <div class="stat-icon">
          <Icon name="heroicons:users" class="w-6 h-6 text-success-500" />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats?.active_users || 0 }}</div>
          <div class="stat-label">活跃用户</div>
        </div>
      </div>
      
      <div class="stat-card hover-lift fadeInUp delay-300">
        <div class="stat-icon">
          <Icon name="heroicons:eye" class="w-6 h-6 text-purple-500" />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats?.total_views || 0 }}</div>
          <div class="stat-label">总浏览量</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">
          <Icon name="heroicons:heart" class="w-6 h-6 text-destructive" />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats?.total_likes || 0 }}</div>
          <div class="stat-label">总点赞数</div>
        </div>
      </div>
    </div>
    
    <!-- 筛选和搜索 -->
    <div class="filters-section">
      <div class="filters-row">
        <!-- 分类筛选 -->
        <div class="filter-group">
          <label class="filter-label">分类:</label>
          <select v-model="filterState.category" class="filter-select">
            <option value="">全部分类</option>
            <option v-for="category in categories" :key="category.value" :value="category.value">
              {{ category.label }}
            </option>
          </select>
        </div>
        
        <!-- 排序方式 -->
        <div class="filter-group">
          <label class="filter-label">排序:</label>
          <select v-model="filterState.sort" class="filter-select">
            <option value="latest">最新发布</option>
            <option value="hot">热门讨论</option>
            <option value="most_replies">回复最多</option>
            <option value="most_likes">点赞最多</option>
          </select>
        </div>
        
        <!-- 时间筛选 -->
        <div class="filter-group">
          <label class="filter-label">时间:</label>
          <select v-model="filterState.timeRange" class="filter-select">
            <option value="">全部时间</option>
            <option value="today">今天</option>
            <option value="week">本周</option>
            <option value="month">本月</option>
          </select>
        </div>
      </div>
      
      <!-- 搜索框 -->
      <div class="search-row">
        <div class="search-box">
          <Icon name="heroicons:magnifying-glass" class="search-icon" />
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="搜索帖子标题、内容或作者..."
            class="search-input"
            @keyup.enter="searchPosts"
          />
          <button v-if="searchQuery" @click="clearSearch" class="clear-search">
            <Icon name="heroicons:x-mark" class="w-4 h-4" />
          </button>
        </div>
        <button @click="searchPosts" class="btn btn-primary">
          搜索
        </button>
      </div>
    </div>
    
    <!-- 热门标签 -->
    <div class="tags-section">
      <div class="section-title">
        <Icon name="heroicons:hashtag" class="w-5 h-5" />
        热门标签
      </div>
      <div class="tags-list">
        <button 
          v-for="tag in popularTags" 
          :key="tag?.name || tag"
          @click="filterByTag(tag.name)"
          class="tag-item"
          :class="{ 'active': filterState.tag === tag.name }"
          v-if="tag && tag.name"
        >
          {{ tag.name }}
          <span class="tag-count">{{ tag.count || 0 }}</span>
        </button>
      </div>
    </div>
    
    <!-- 帖子列表 -->
    <div class="posts-section">
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>正在加载帖子...</p>
      </div>
      
      <!-- 错误状态 -->
      <div v-else-if="error" class="error-state">
        <Icon name="heroicons:exclamation-triangle" class="w-12 h-12 text-destructive" />
        <h3>加载失败</h3>
        <p>{{ error }}</p>
        <button @click="fetchPosts" class="btn btn-primary">重试</button>
      </div>
      
      <!-- 空状态 -->
      <div v-else-if="filteredPosts.length === 0" class="empty-state">
        <Icon name="heroicons:chat-bubble-left-ellipsis" class="w-16 h-16 text-muted-foreground" />
        <h3>暂无帖子</h3>
        <p>{{ searchQuery ? '没有找到匹配的帖子' : '还没有人发布帖子，快来发布第一个吧！' }}</p>
        <button v-if="!searchQuery" @click="showCreatePost = true" class="btn btn-primary">
          发布帖子
        </button>
      </div>
      
      <!-- 帖子列表 -->
      <div v-else class="posts-list">
        <div 
          v-for="post in filteredPosts" 
          :key="post.id"
          class="post-card"
          @click="goToPost(post.id)"
        >
          <!-- 帖子头部 -->
          <div class="post-header">
            <div class="author-info">
              <img :src="post.author.avatar" :alt="post.author.name" class="author-avatar" />
              <div class="author-details">
                <div class="author-name">{{ post.author.name }}</div>
                <div class="post-meta">
                  <span class="post-time">{{ formatRelativeTime(post.created_at) }}</span>
                  <span class="post-category">{{ getCategoryLabel(post.category) }}</span>
                </div>
              </div>
            </div>
            
            <div class="post-actions">
              <button 
                @click.stop="toggleLike(post)"
                class="action-btn"
                :class="{ 'liked': post.is_liked }"
              >
                <Icon 
                  :name="post.is_liked ? 'heroicons:heart-solid' : 'heroicons:heart'" 
                  class="w-4 h-4"
                />
              </button>
              <button @click.stop="toggleBookmark(post)" class="action-btn" :class="{ 'bookmarked': post.is_bookmarked }">
                <Icon 
                  :name="post.is_bookmarked ? 'heroicons:bookmark-solid' : 'heroicons:bookmark'" 
                  class="w-4 h-4"
                />
              </button>
            </div>
          </div>
          
          <!-- 帖子内容 -->
          <div class="post-content">
            <h3 class="post-title">{{ post.title }}</h3>
            <p class="post-excerpt">{{ post.excerpt }}</p>
            
            <!-- 标签 -->
            <div v-if="post.tags && post.tags.length > 0" class="post-tags">
              <span v-for="tag in post.tags" :key="tag" class="post-tag">
                #{{ tag }}
              </span>
            </div>
          </div>
          
          <!-- 帖子统计 -->
          <div class="post-stats">
            <div class="stat-item">
              <Icon name="heroicons:eye" class="w-4 h-4" />
              <span>{{ post.views }}</span>
            </div>
            <div class="stat-item">
              <Icon name="heroicons:heart" class="w-4 h-4" />
              <span>{{ post.likes }}</span>
            </div>
            <div class="stat-item">
              <Icon name="heroicons:chat-bubble-left" class="w-4 h-4" />
              <span>{{ post.replies }}</span>
            </div>
            <div class="stat-item">
              <Icon name="heroicons:bookmark" class="w-4 h-4" />
              <span>{{ post.bookmarks }}</span>
            </div>
            
            <!-- 最后回复 -->
            <div v-if="post.last_reply" class="last-reply">
              <span class="last-reply-text">最后回复:</span>
              <span class="last-reply-author">{{ post.last_reply.author }}</span>
              <span class="last-reply-time">{{ formatRelativeTime(post.last_reply.time) }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 分页 -->
      <div v-if="totalPages > 1" class="pagination">
        <button 
          @click="goToPage(currentPage - 1)"
          :disabled="currentPage === 1"
          class="pagination-btn"
        >
          <Icon name="heroicons:chevron-left" class="w-4 h-4" />
          上一页
        </button>
        
        <div class="pagination-info">
          第 {{ currentPage }} 页，共 {{ totalPages }} 页
        </div>
        
        <button 
          @click="goToPage(currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="pagination-btn"
        >
          下一页
          <Icon name="heroicons:chevron-right" class="w-4 h-4" />
        </button>
      </div>
    </div>
    
    <!-- 发布帖子弹窗 -->
    <div v-if="showCreatePost" class="modal-overlay" @click="showCreatePost = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">发布新帖子</h3>
          <button @click="showCreatePost = false" class="modal-close">
            <Icon name="heroicons:x-mark" class="w-5 h-5" />
          </button>
        </div>
        
        <form @submit.prevent="createPost" class="modal-body">
          <div class="form-group">
            <label class="form-label">标题 *</label>
            <input 
              v-model="newPost.title" 
              type="text" 
              class="form-input"
              placeholder="请输入帖子标题"
              required
            />
          </div>
          
          <div class="form-group">
            <label class="form-label">分类 *</label>
            <select v-model="newPost.category" class="form-select" required>
              <option value="">请选择分类</option>
              <option v-for="category in categories" :key="category.value" :value="category.value">
                {{ category.label }}
              </option>
            </select>
          </div>
          
          <div class="form-group">
            <label class="form-label">内容 *</label>
            <textarea 
              v-model="newPost.content" 
              class="form-textarea"
              rows="8"
              placeholder="请输入帖子内容，支持Markdown格式"
              required
            ></textarea>
          </div>
          
          <div class="form-group">
            <label class="form-label">标签</label>
            <input 
              v-model="newPost.tags" 
              type="text" 
              class="form-input"
              placeholder="请输入标签，用逗号分隔"
            />
            <div class="form-help">例如: 信用卡欺诈, 风险控制, 机器学习</div>
          </div>
          
          <div class="modal-actions">
            <button type="button" @click="showCreatePost = false" class="btn btn-secondary">
              取消
            </button>
            <button type="submit" class="btn btn-primary" :disabled="creating">
              <Icon v-if="creating" name="heroicons:arrow-path" class="w-4 h-4 animate-spin" />
              {{ creating ? '发布中...' : '发布帖子' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useCommunityApi } from '~/composables/useApiData'
import { useToast } from '~/composables/useNotification'
import { formatDate } from '~/utils/formatters'
import { COMMUNITY_CATEGORIES, COMMUNITY_SORT_OPTIONS } from '~/constants'

// 设置页面布局和认证中间件
definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

// 页面元数据
useHead({
  title: '社区讨论 - 反欺诈知识图谱系统',
  meta: [
    { name: 'description', content: '反欺诈知识分享社区，与专家和同行交流经验，共同提升反欺诈能力' }
  ]
})

// API和通知
const { getCommunityPosts, getCommunityStats, getPopularTags, togglePostLike } = useCommunityApi()
const { showToast } = useToast()

// 响应式数据
const loading = ref(false)
const error = ref(null)
const posts = ref([])
const stats = ref(null)
const popularTags = ref([])
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = 10
const totalPages = ref(1)
const showCreatePost = ref(false)
const creating = ref(false)

// 筛选条件
const filterState = reactive({
  category: '',
  sort: 'latest',
  timeRange: '',
  tag: ''
})

// 新帖子数据
const newPost = ref({
  title: '',
  category: '',
  content: '',
  tags: ''
})

// 分类选项
const categories = [
  { label: '欺诈检测', value: 'fraud_detection' },
  { label: '风险控制', value: 'risk_control' },
  { label: '机器学习', value: 'machine_learning' },
  { label: '数据分析', value: 'data_analysis' },
  { label: '案例分享', value: 'case_study' },
  { label: '技术讨论', value: 'tech_discussion' },
  { label: '行业动态', value: 'industry_news' },
  { label: '经验分享', value: 'experience_sharing' }
]

// 模拟数据
const mockStats = {
  total_posts: 1248,
  active_users: 356,
  total_views: 45672,
  total_likes: 8934
}

const mockTags = [
  { name: '信用卡欺诈', count: 156 },
  { name: '机器学习', count: 134 },
  { name: '风险评估', count: 98 },
  { name: '数据挖掘', count: 87 },
  { name: '异常检测', count: 76 },
  { name: '深度学习', count: 65 },
  { name: '特征工程', count: 54 },
  { name: '模型优化', count: 43 }
]

const mockPosts = [
  {
    id: 1,
    title: '如何提高信用卡欺诈检测的准确率？',
    excerpt: '最近在做信用卡欺诈检测项目，发现准确率总是不够理想。想请教一下大家有什么好的方法和经验可以分享...',
    content: '详细内容...',
    category: 'fraud_detection',
    tags: ['信用卡欺诈', '机器学习', '准确率'],
    author: {
      id: 1,
      name: '张三',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhang'
    },
    created_at: '2024-01-15T10:30:00Z',
    views: 234,
    likes: 45,
    replies: 12,
    bookmarks: 8,
    is_liked: false,
    is_bookmarked: true,
    last_reply: {
      author: '李四',
      time: '2024-01-15T16:20:00Z'
    }
  },
  {
    id: 2,
    title: '分享一个实用的异常检测算法',
    excerpt: '在实际项目中使用了Isolation Forest算法进行异常检测，效果不错。这里分享一下具体的实现方法和参数调优经验...',
    content: '详细内容...',
    category: 'tech_discussion',
    tags: ['异常检测', 'Isolation Forest', '算法'],
    author: {
      id: 2,
      name: '王五',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wang'
    },
    created_at: '2024-01-14T14:15:00Z',
    views: 189,
    likes: 32,
    replies: 8,
    bookmarks: 15,
    is_liked: true,
    is_bookmarked: false,
    last_reply: {
      author: '赵六',
      time: '2024-01-15T09:45:00Z'
    }
  },
  {
    id: 3,
    title: '金融反欺诈中的特征工程实践',
    excerpt: '特征工程在反欺诈系统中起着关键作用。本文总结了一些在实际项目中验证有效的特征构造方法...',
    content: '详细内容...',
    category: 'experience_sharing',
    tags: ['特征工程', '金融反欺诈', '实践'],
    author: {
      id: 3,
      name: '孙七',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sun'
    },
    created_at: '2024-01-13T11:20:00Z',
    views: 312,
    likes: 67,
    replies: 23,
    bookmarks: 28,
    is_liked: false,
    is_bookmarked: false,
    last_reply: {
      author: '周八',
      time: '2024-01-14T20:30:00Z'
    }
  }
]

// 计算属性
const filteredPosts = computed(() => {
  if (!Array.isArray(posts.value)) {
    return []
  }
  let result = [...posts.value]
  
  // 分类筛选
  if (filterState.category) {
    result = result.filter(post => post.category === filterState.category)
  }
  
  // 标签筛选
  if (filterState.tag) {
    result = result.filter(post => post.tags.includes(filterState.tag))
  }
  
  // 搜索筛选
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(post => 
      post.title.toLowerCase().includes(query) ||
      post.excerpt.toLowerCase().includes(query) ||
      post.author.name.toLowerCase().includes(query)
    )
  }
  
  // 排序
  switch (filterState.sort) {
    case 'hot':
      result.sort((a, b) => (b.likes + b.replies) - (a.likes + a.replies))
      break
    case 'most_replies':
      result.sort((a, b) => b.replies - a.replies)
      break
    case 'most_likes':
      result.sort((a, b) => b.likes - a.likes)
      break
    default: // latest
      result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  }
  
  return result
})

// 方法
const fetchPosts = async () => {
  loading.value = true
  error.value = null
  
  try {
    const params = {
      search: searchQuery.value,
      category: filterState.category,
      sort: filterState.sort,
      tag: filterState.tag,
      page: currentPage.value,
      page_size: pageSize
    }
    
    const [postsResponse, statsResponse, tagsResponse] = await Promise.all([
      getCommunityPosts(params),
      getCommunityStats(),
      getPopularTags()
    ])
    
    const rawPosts = postsResponse.results || postsResponse
    posts.value = Array.isArray(rawPosts) ? rawPosts : []
    stats.value = statsResponse?.data || statsResponse || mockStats
    const rawTags = tagsResponse?.data || tagsResponse || mockTags
    popularTags.value = Array.isArray(rawTags) ? rawTags.filter(tag => tag && tag.name) : []
    
    showToast('社区内容加载成功', 'success')
  } catch (err) {
    error.value = '获取帖子列表失败: ' + err.message
    showToast('获取社区内容失败', 'error')
    console.error('Failed to fetch posts:', err)
    
    // 开发环境下使用模拟数据
    if (process.dev) {
      posts.value = Array.isArray(mockPosts) ? mockPosts : []
      stats.value = mockStats
      popularTags.value = Array.isArray(mockTags) ? mockTags.filter(tag => tag && tag.name) : []
    }
  } finally {
    loading.value = false
  }
}

const refreshPosts = () => {
  fetchPosts()
}

const searchPosts = () => {
  // 搜索逻辑已在计算属性中实现
  currentPage.value = 1
}

const clearSearch = () => {
  searchQuery.value = ''
  currentPage.value = 1
}

const filterByTag = (tagName) => {
  if (filterState.tag === tagName) {
    filterState.tag = ''
  } else {
    filterState.tag = tagName
  }
  currentPage.value = 1
}

const getCategoryLabel = (value) => {
  return COMMUNITY_CATEGORIES[value]?.label || value
}

const formatRelativeTime = (timestamp) => {
  return formatDate.toRelativeTime(timestamp)
}

const toggleLike = async (post) => {
  try {
    const response = await togglePostLike(post.id)
    post.is_liked = response.is_liked
    post.likes = response.likes_count
    
    showToast(post.is_liked ? '点赞成功' : '取消点赞', 'success')
  } catch (err) {
    showToast('操作失败', 'error')
    console.error('Failed to toggle like:', err)
  }
}

const toggleBookmark = async (post) => {
  try {
    const response = await togglePostBookmark(post.id)
    post.is_bookmarked = response.is_bookmarked
    post.bookmarks = response.bookmarks_count
    showToast(response.is_bookmarked ? '收藏成功' : '取消收藏成功', 'success')
  } catch (err) {
    showToast('操作失败', 'error')
    console.error('Failed to toggle bookmark:', err)
  }
}

const createPost = async () => {
  if (!newPost.value.title || !newPost.value.category || !newPost.value.content) {
    showToast('请填写完整的帖子信息', 'warning')
    return
  }
  
  creating.value = true
  
  try {
    // 处理标签
    const tags = newPost.value.tags 
      ? newPost.value.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      : []
    
    const response = await createCommunityPost({
      title: newPost.value.title,
      category: newPost.value.category,
      content: newPost.value.content,
      tags
    })
    
    // 重置表单
    newPost.value = {
      title: '',
      category: '',
      content: '',
      tags: ''
    }
    
    showCreatePost.value = false
    
    // 刷新帖子列表
    await fetchPosts()
    
    showToast('帖子发布成功', 'success')
    
  } catch (err) {
    showToast('发布帖子失败', 'error')
    console.error('Failed to create post:', err)
  } finally {
    creating.value = false
  }
}

const goToPost = (postId) => {
  navigateTo(`/community/${postId}`)
}

const goToPage = (page) => {
  currentPage.value = page
  // TODO: 重新获取对应页面的数据
}

// 监听筛选条件变化
watch(filterState, () => {
  currentPage.value = 1
}, { deep: true })

// 生命周期
onMounted(() => {
  fetchPosts()
})
</script>

<style scoped>
.community-page {
  @apply min-h-screen bg-muted/40 dark:bg-background;
}

.page-header {
  @apply bg-card dark:bg-card border-b border-border dark:border-border;
}

.header-content {
  @apply max-w-6xl mx-auto px-6 py-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6;
}

.header-text {
  @apply flex-1;
}

.page-title {
  @apply text-3xl font-bold text-foreground dark:text-white mb-2;
}

.page-description {
  @apply text-muted-foreground dark:text-muted-foreground;
}

.header-actions {
  @apply flex flex-col sm:flex-row gap-3;
}

.community-stats {
  @apply max-w-6xl mx-auto px-6 py-6 grid grid-cols-2 lg:grid-cols-4 gap-4;
}

.stat-card {
  @apply bg-card dark:bg-card rounded-lg p-6 shadow-sm border border-border dark:border-border
         flex items-center gap-4;
}

.stat-icon {
  @apply flex-shrink-0;
}

.stat-content {
  @apply flex-1;
}

.stat-value {
  @apply text-2xl font-bold text-foreground dark:text-white;
}

.stat-label {
  @apply text-sm text-muted-foreground dark:text-muted-foreground;
}

.filters-section {
  @apply max-w-6xl mx-auto px-6 py-6 bg-card dark:bg-card border-b border-border dark:border-border;
}

.filters-row {
  @apply flex flex-wrap gap-4 mb-4;
}

.filter-group {
  @apply flex items-center gap-2;
}

.filter-label {
  @apply text-sm font-medium text-muted-foreground dark:text-muted-foreground whitespace-nowrap;
}

.filter-select {
  @apply px-3 py-2 border border-border dark:border-border rounded-lg
         bg-card dark:bg-muted/40 text-foreground dark:text-white
         focus:ring-2 focus:ring-primary focus:border-primary;
}

.search-row {
  @apply flex gap-3;
}

.search-box {
  @apply flex-1 relative;
}

.search-icon {
  @apply absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground;
}

.search-input {
  @apply w-full pl-10 pr-10 py-2 border border-border dark:border-border rounded-lg
         bg-card dark:bg-muted/40 text-foreground dark:text-white placeholder:text-muted-foreground
         focus:ring-2 focus:ring-primary focus:border-primary;
}

.clear-search {
  @apply absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-muted-foreground;
}

.tags-section {
  @apply max-w-6xl mx-auto px-6 py-4 bg-card dark:bg-card border-b border-border dark:border-border;
}

.section-title {
  @apply flex items-center gap-2 text-lg font-semibold text-foreground dark:text-white mb-3;
}

.tags-list {
  @apply flex flex-wrap gap-2;
}

.tag-item {
  @apply inline-flex items-center gap-1 px-3 py-1 bg-muted/60 dark:bg-muted/40
         text-muted-foreground dark:text-muted-foreground rounded-full text-sm
         hover:bg-primary/20 dark:hover:bg-primary/25 hover:text-primary dark:hover:text-primary/80
         transition-colors;
}

.tag-item.active {
  @apply bg-primary text-white;
}

.tag-count {
  @apply text-xs opacity-75;
}

.posts-section {
  @apply max-w-6xl mx-auto px-6 py-6;
}

.loading-state,
.error-state,
.empty-state {
  @apply flex flex-col items-center justify-center py-12 text-center;
}

.loading-spinner {
  @apply w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin mb-4;
}

.posts-list {
  @apply space-y-6;
}

.post-card {
  @apply bg-card dark:bg-card rounded-lg p-6 shadow-sm border border-border dark:border-border
         hover:shadow-md hover:border-primary/40 dark:hover:border-primary
         transition-all cursor-pointer;
}

.post-header {
  @apply flex items-start justify-between mb-4;
}

.author-info {
  @apply flex items-center gap-3;
}

.author-avatar {
  @apply w-10 h-10 rounded-full;
}

.author-details {
  @apply flex-1;
}

.author-name {
  @apply font-semibold text-foreground dark:text-white;
}

.post-meta {
  @apply flex items-center gap-3 text-sm text-muted-foreground dark:text-muted-foreground;
}

.post-category {
  @apply bg-muted/60 dark:bg-muted/40 px-2 py-1 rounded text-xs;
}

.post-actions {
  @apply flex items-center gap-2;
}

.action-btn {
  @apply p-2 rounded-lg text-muted-foreground hover:text-muted-foreground dark:hover:text-muted-foreground
         hover:bg-muted/60 dark:hover:bg-muted/40 transition-colors;
}

.action-btn.liked {
  @apply text-destructive;
}

.action-btn.bookmarked {
  @apply text-yellow-500;
}

.post-content {
  @apply mb-4;
}

.post-title {
  @apply text-xl font-semibold text-foreground dark:text-white mb-2 hover:text-primary dark:hover:text-primary;
}

.post-excerpt {
  @apply text-muted-foreground dark:text-muted-foreground leading-relaxed mb-3;
}

.post-tags {
  @apply flex flex-wrap gap-2;
}

.post-tag {
  @apply text-xs bg-primary/20 dark:bg-primary/30 text-primary dark:text-primary/80
         px-2 py-1 rounded;
}

.post-stats {
  @apply flex items-center justify-between pt-4 border-t border-border dark:border-border;
}

.stat-item {
  @apply flex items-center gap-1 text-sm text-muted-foreground dark:text-muted-foreground;
}

.last-reply {
  @apply flex items-center gap-2 text-sm text-muted-foreground dark:text-muted-foreground;
}

.last-reply-text {
  @apply text-xs;
}

.last-reply-author {
  @apply font-medium;
}

.last-reply-time {
  @apply text-xs;
}

.pagination {
  @apply flex items-center justify-between mt-8 pt-6 border-t border-border dark:border-border;
}

.pagination-btn {
  @apply flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg
         border border-border dark:border-border text-muted-foreground dark:text-muted-foreground
         hover:bg-muted/40 dark:hover:bg-muted/40 disabled:opacity-50 disabled:cursor-not-allowed;
}

.pagination-info {
  @apply text-sm text-muted-foreground dark:text-muted-foreground;
}

.modal-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50;
}

.modal-content {
  @apply bg-card dark:bg-card rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto;
}

.modal-header {
  @apply flex items-center justify-between p-6 border-b border-border dark:border-border;
}

.modal-title {
  @apply text-xl font-semibold text-foreground dark:text-white;
}

.modal-close {
  @apply p-2 rounded-lg text-muted-foreground hover:text-muted-foreground dark:hover:text-muted-foreground
         hover:bg-muted/60 dark:hover:bg-muted/40;
}

.modal-body {
  @apply p-6 space-y-6;
}

.form-group {
  @apply space-y-2;
}

.form-label {
  @apply block text-sm font-medium text-muted-foreground dark:text-muted-foreground;
}

.form-input,
.form-select {
  @apply w-full px-3 py-2 border border-border dark:border-border rounded-lg
         bg-card dark:bg-muted/40 text-foreground dark:text-white
         focus:ring-2 focus:ring-primary focus:border-primary;
}

.form-textarea {
  @apply w-full px-3 py-2 border border-border dark:border-border rounded-lg
         bg-card dark:bg-muted/40 text-foreground dark:text-white
         focus:ring-2 focus:ring-primary focus:border-primary
         resize-y;
}

.form-help {
  @apply text-xs text-muted-foreground dark:text-muted-foreground;
}

.modal-actions {
  @apply flex justify-end gap-3 pt-4 border-t border-border dark:border-border;
}

.btn {
  @apply inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors
         focus:outline-none focus:ring-2 focus:ring-offset-2;
}

.btn-primary {
  @apply bg-primary text-white hover:bg-primary/90 focus:ring-primary;
}

.btn-secondary {
  @apply bg-muted/80 text-white hover:bg-muted/40 focus:ring-primary;
}
</style>