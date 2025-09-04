<template>
  <div class="post-detail-page">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>正在加载帖子详情...</p>
    </div>
    
    <!-- 错误状态 -->
    <div v-else-if="error" class="error-state">
      <Icon name="heroicons:exclamation-triangle" class="w-12 h-12 text-red-500" />
      <h3>加载失败</h3>
      <p>{{ error }}</p>
      <button @click="fetchPost" class="btn btn-primary">重试</button>
    </div>
    
    <!-- 帖子详情 -->
    <div v-else-if="post" class="post-content">
      <!-- 返回按钮 -->
      <div class="back-navigation">
        <button @click="goBack" class="back-btn">
          <Icon name="heroicons:arrow-left" class="w-4 h-4" />
          返回社区
        </button>
      </div>
      
      <!-- 帖子主体 -->
      <div class="post-main">
        <!-- 帖子头部 -->
        <div class="post-header">
          <div class="post-meta">
            <div class="author-info">
              <img :src="post.author.avatar" :alt="post.author.name" class="author-avatar" />
              <div class="author-details">
                <div class="author-name">{{ post.author.name }}</div>
                <div class="author-title">{{ post.author.title }}</div>
                <div class="post-time">
                  发布于 {{ formatDateTime(post.created_at) }}
                  <span v-if="post.updated_at !== post.created_at" class="updated-time">
                    · 更新于 {{ formatDateTime(post.updated_at) }}
                  </span>
                </div>
              </div>
            </div>
            
            <div class="post-actions">
              <button 
                @click="toggleLike"
                class="action-btn"
                :class="{ 'liked': post.is_liked }"
              >
                <Icon 
                  :name="post.is_liked ? 'heroicons:heart-solid' : 'heroicons:heart'" 
                  class="w-5 h-5"
                />
                <span>{{ post.likes }}</span>
              </button>
              
              <button 
                @click="toggleBookmark"
                class="action-btn"
                :class="{ 'bookmarked': post.is_bookmarked }"
              >
                <Icon 
                  :name="post.is_bookmarked ? 'heroicons:bookmark-solid' : 'heroicons:bookmark'" 
                  class="w-5 h-5"
                />
                <span>{{ post.bookmarks }}</span>
              </button>
              
              <button @click="sharePost" class="action-btn">
                <Icon name="heroicons:share" class="w-5 h-5" />
                分享
              </button>
              
              <div class="dropdown" v-if="canEdit">
                <button @click="showDropdown = !showDropdown" class="action-btn">
                  <Icon name="heroicons:ellipsis-horizontal" class="w-5 h-5" />
                </button>
                <div v-if="showDropdown" class="dropdown-menu">
                  <button @click="editPost" class="dropdown-item">
                    <Icon name="heroicons:pencil" class="w-4 h-4" />
                    编辑
                  </button>
                  <button @click="deletePost" class="dropdown-item text-red-600">
                    <Icon name="heroicons:trash" class="w-4 h-4" />
                    删除
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 分类和标签 -->
          <div class="post-taxonomy">
            <div class="post-category">
              <Icon name="heroicons:folder" class="w-4 h-4" />
              {{ getCategoryLabel(post.category) }}
            </div>
            <div v-if="post.tags && post.tags.length > 0" class="post-tags">
              <span v-for="tag in post.tags" :key="tag" class="post-tag">
                #{{ tag }}
              </span>
            </div>
          </div>
        </div>
        
        <!-- 帖子标题 -->
        <h1 class="post-title">{{ post.title }}</h1>
        
        <!-- 帖子内容 -->
        <div class="post-body">
          <div class="content-text" v-html="formatContent(post.content)"></div>
        </div>
        
        <!-- 帖子统计 -->
        <div class="post-stats">
          <div class="stat-item">
            <Icon name="heroicons:eye" class="w-4 h-4" />
            <span>{{ post.views }} 浏览</span>
          </div>
          <div class="stat-item">
            <Icon name="heroicons:heart" class="w-4 h-4" />
            <span>{{ post.likes }} 点赞</span>
          </div>
          <div class="stat-item">
            <Icon name="heroicons:chat-bubble-left" class="w-4 h-4" />
            <span>{{ post.replies }} 回复</span>
          </div>
          <div class="stat-item">
            <Icon name="heroicons:bookmark" class="w-4 h-4" />
            <span>{{ post.bookmarks }} 收藏</span>
          </div>
        </div>
      </div>
      
      <!-- 评论区 -->
      <div class="comments-section">
        <div class="comments-header">
          <h2 class="comments-title">
            <Icon name="heroicons:chat-bubble-left-right" class="w-6 h-6" />
            评论 ({{ comments.length }})
          </h2>
          
          <div class="comments-sort">
            <select v-model="commentSort" class="sort-select">
              <option value="latest">最新</option>
              <option value="oldest">最早</option>
              <option value="most_likes">最多点赞</option>
            </select>
          </div>
        </div>
        
        <!-- 发表评论 -->
        <div class="comment-form">
          <div class="form-header">
            <img :src="currentUser.avatar" :alt="currentUser.name" class="user-avatar" />
            <div class="form-title">发表评论</div>
          </div>
          
          <form @submit.prevent="submitComment">
            <textarea 
              v-model="newComment.content" 
              class="comment-textarea"
              rows="4"
              placeholder="写下你的想法..."
              required
            ></textarea>
            
            <div class="form-actions">
              <div class="form-tips">
                <Icon name="heroicons:information-circle" class="w-4 h-4" />
                支持Markdown格式
              </div>
              <button type="submit" class="btn btn-primary" :disabled="submitting">
                <Icon v-if="submitting" name="heroicons:arrow-path" class="w-4 h-4 animate-spin" />
                {{ submitting ? '发布中...' : '发布评论' }}
              </button>
            </div>
          </form>
        </div>
        
        <!-- 评论列表 -->
        <div class="comments-list">
          <div v-if="sortedComments.length === 0" class="empty-comments">
            <Icon name="heroicons:chat-bubble-left-ellipsis" class="w-12 h-12 text-gray-400" />
            <p>还没有评论，快来发表第一个评论吧！</p>
          </div>
          
          <div 
            v-for="comment in sortedComments" 
            :key="comment.id"
            class="comment-item"
          >
            <div class="comment-avatar">
              <img :src="comment.author.avatar" :alt="comment.author.name" class="avatar" />
            </div>
            
            <div class="comment-content">
              <div class="comment-header">
                <div class="comment-author">
                  <span class="author-name">{{ comment.author.name }}</span>
                  <span class="author-title">{{ comment.author.title }}</span>
                </div>
                <div class="comment-time">{{ formatRelativeTime(comment.created_at) }}</div>
              </div>
              
              <div class="comment-body">
                <div class="comment-text" v-html="formatContent(comment.content)"></div>
              </div>
              
              <div class="comment-actions">
                <button 
                  @click="toggleCommentLike(comment)"
                  class="comment-action"
                  :class="{ 'liked': comment.is_liked }"
                >
                  <Icon 
                    :name="comment.is_liked ? 'heroicons:heart-solid' : 'heroicons:heart'" 
                    class="w-4 h-4"
                  />
                  <span>{{ comment.likes }}</span>
                </button>
                
                <button 
                  @click="replyToComment(comment)"
                  class="comment-action"
                >
                  <Icon name="heroicons:chat-bubble-left" class="w-4 h-4" />
                  回复
                </button>
                
                <button 
                  v-if="canEditComment(comment)"
                  @click="editComment(comment)"
                  class="comment-action"
                >
                  <Icon name="heroicons:pencil" class="w-4 h-4" />
                  编辑
                </button>
                
                <button 
                  v-if="canDeleteComment(comment)"
                  @click="deleteComment(comment)"
                  class="comment-action text-red-600"
                >
                  <Icon name="heroicons:trash" class="w-4 h-4" />
                  删除
                </button>
              </div>
              
              <!-- 回复表单 -->
              <div v-if="replyingTo === comment.id" class="reply-form">
                <form @submit.prevent="submitReply(comment)">
                  <textarea 
                    v-model="replyContent" 
                    class="reply-textarea"
                    rows="3"
                    :placeholder="`回复 @${comment.author.name}...`"
                    required
                  ></textarea>
                  <div class="reply-actions">
                    <button type="button" @click="cancelReply" class="btn btn-secondary btn-sm">
                      取消
                    </button>
                    <button type="submit" class="btn btn-primary btn-sm" :disabled="submittingReply">
                      <Icon v-if="submittingReply" name="heroicons:arrow-path" class="w-4 h-4 animate-spin" />
                      {{ submittingReply ? '发布中...' : '发布回复' }}
                    </button>
                  </div>
                </form>
              </div>
              
              <!-- 子回复 -->
              <div v-if="comment.replies && comment.replies.length > 0" class="replies-list">
                <div 
                  v-for="reply in comment.replies" 
                  :key="reply.id"
                  class="reply-item"
                >
                  <div class="reply-avatar">
                    <img :src="reply.author.avatar" :alt="reply.author.name" class="avatar" />
                  </div>
                  
                  <div class="reply-content">
                    <div class="reply-header">
                      <span class="reply-author">{{ reply.author.name }}</span>
                      <span class="reply-time">{{ formatRelativeTime(reply.created_at) }}</span>
                    </div>
                    
                    <div class="reply-body">
                      <div class="reply-text" v-html="formatContent(reply.content)"></div>
                    </div>
                    
                    <div class="reply-actions">
                      <button 
                        @click="toggleReplyLike(reply)"
                        class="reply-action"
                        :class="{ 'liked': reply.is_liked }"
                      >
                        <Icon 
                          :name="reply.is_liked ? 'heroicons:heart-solid' : 'heroicons:heart'" 
                          class="w-3 h-3"
                        />
                        <span>{{ reply.likes }}</span>
                      </button>
                    </div>
                  </div>
                </div>
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
import { useCommunityApi } from '~/composables/useApi'
import { useCommentForm } from '~/composables/useForm'
import { useToast } from '~/composables/useNotification'
import { formatDate } from '~/utils/formatters'
import { COMMUNITY_CATEGORIES } from '~/constants'

// 获取路由参数
const route = useRoute()
const postId = route.params.id

// 页面元数据
useHead({
  title: '帖子详情 - 社区讨论',
  meta: [
    { name: 'description', content: '查看帖子详情和参与讨论' }
  ]
})

// API和表单
const { getPostDetail, getPostComments, createComment, togglePostLike } = useCommunityApi()
const { showToast } = useToast()
const commentForm = useCommentForm()

// 响应式数据
const loading = ref(false)
const error = ref(null)
const post = ref(null)
const comments = ref([])
const commentLoading = ref(false)
const submitting = ref(false)
const submittingReply = ref(false)
const replyingTo = ref(null)
const replyContent = ref('')

// 表单数据
const newComment = ref({
  content: ''
})

// 当前用户（模拟数据）
const currentUser = ref({
  id: 1,
  name: '当前用户',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=current'
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

// 模拟帖子数据
const mockPost = {
  id: 1,
  title: '如何提高信用卡欺诈检测的准确率？',
  content: `# 背景介绍

最近在做信用卡欺诈检测项目，发现准确率总是不够理想。经过一段时间的研究和实践，总结了一些提高准确率的方法和经验，希望能对大家有所帮助。

## 数据预处理

### 1. 特征工程

特征工程是提高模型性能的关键步骤：

- **时间特征**：提取交易时间的小时、星期、月份等特征
- **统计特征**：计算用户历史交易的均值、方差、频率等
- **行为特征**：分析用户的消费习惯和行为模式

### 2. 数据清洗

- 处理缺失值和异常值
- 标准化数值特征
- 编码分类特征

## 模型选择

经过对比测试，以下几种模型效果较好：

1. **随机森林**：对特征重要性有很好的解释性
2. **XGBoost**：在不平衡数据上表现优秀
3. **神经网络**：能够捕捉复杂的非线性关系

## 实验结果

| 模型 | 准确率 | 精确率 | 召回率 | F1分数 |
|------|--------|--------|--------|---------|
| 随机森林 | 0.92 | 0.89 | 0.85 | 0.87 |
| XGBoost | 0.94 | 0.91 | 0.88 | 0.89 |
| 神经网络 | 0.93 | 0.90 | 0.87 | 0.88 |

## 总结

通过合理的特征工程和模型选择，我们成功将准确率从85%提升到94%。希望这些经验能对大家有所帮助！`,
  category: 'fraud_detection',
  tags: ['信用卡欺诈', '机器学习', '准确率', '特征工程'],
  author: {
    id: 2,
    name: '张三',
    title: '高级数据科学家',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhang'
  },
  created_at: '2024-01-15T10:30:00Z',
  updated_at: '2024-01-15T10:30:00Z',
  views: 234,
  likes: 45,
  replies: 12,
  bookmarks: 8,
  is_liked: false,
  is_bookmarked: true
}

// 模拟评论数据
const mockComments = [
  {
    id: 1,
    content: '非常详细的分享！特别是特征工程部分，对我很有启发。请问在处理时间特征时，有没有考虑过节假日的影响？',
    author: {
      id: 3,
      name: '李四',
      title: '数据分析师',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=li'
    },
    created_at: '2024-01-15T11:15:00Z',
    likes: 8,
    is_liked: false,
    replies: [
      {
        id: 11,
        content: '@李四 好问题！节假日确实是一个重要的特征，我们在后续的版本中加入了节假日标识，效果有一定提升。',
        author: {
          id: 2,
          name: '张三',
          title: '高级数据科学家',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhang'
        },
        created_at: '2024-01-15T12:30:00Z',
        likes: 3,
        is_liked: true
      }
    ]
  },
  {
    id: 2,
    content: '实验结果很不错！想了解一下XGBoost的具体参数设置，能分享一下吗？',
    author: {
      id: 4,
      name: '王五',
      title: '机器学习工程师',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wang'
    },
    created_at: '2024-01-15T14:20:00Z',
    likes: 5,
    is_liked: true,
    replies: []
  },
  {
    id: 3,
    content: '感谢分享！我们团队也在做类似的项目，这些经验很宝贵。有机会可以交流一下。',
    author: {
      id: 5,
      name: '赵六',
      title: '算法工程师',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhao'
    },
    created_at: '2024-01-15T16:45:00Z',
    likes: 2,
    is_liked: false,
    replies: []
  }
]

// 计算属性
const canEdit = computed(() => {
  return post.value && post.value.author.id === currentUser.value.id
})

const sortedComments = computed(() => {
  const sorted = [...comments.value]
  
  switch (commentSort.value) {
    case 'oldest':
      return sorted.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    case 'most_likes':
      return sorted.sort((a, b) => b.likes - a.likes)
    default: // latest
      return sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  }
})

// 方法
const fetchPost = async () => {
  loading.value = true
  error.value = null
  
  try {
    const [postResponse, commentsResponse] = await Promise.all([
      getPostDetail(postId),
      getPostComments(postId)
    ])
    
    post.value = postResponse
    comments.value = commentsResponse.results || commentsResponse
    
    // 更新页面标题
    useHead({
      title: `${post.value.title} - 社区讨论`
    })
    
    showToast('帖子详情加载成功', 'success')
  } catch (err) {
    error.value = '获取帖子详情失败: ' + err.message
    showToast('获取帖子详情失败', 'error')
    console.error('Failed to fetch post:', err)
    
    // 开发环境下使用模拟数据
    if (process.dev) {
      post.value = mockPost
      comments.value = mockComments
      useHead({
        title: `${post.value.title} - 社区讨论`
      })
    }
  } finally {
    loading.value = false
  }
}

const getCategoryLabel = (value) => {
  return COMMUNITY_CATEGORIES[value]?.label || value
}

const formatDateTime = (timestamp) => {
  return formatDate.toDateTimeString(timestamp)
}

const formatRelativeTime = (timestamp) => {
  return formatDate.toRelativeTime(timestamp)
}

const formatContent = (content) => {
  // 简单的Markdown转HTML（实际项目中应使用专业的Markdown解析器）
  return content
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
}

const toggleLike = async () => {
  try {
    const response = await togglePostLike(post.value.id)
    post.value.is_liked = response.is_liked
    post.value.likes = response.likes_count
    showToast(response.is_liked ? '点赞成功' : '取消点赞成功', 'success')
  } catch (err) {
    showToast('操作失败', 'error')
    console.error('Failed to toggle like:', err)
  }
}

const toggleBookmark = async () => {
  try {
    const response = await togglePostBookmark(post.value.id)
    post.value.is_bookmarked = response.is_bookmarked
    post.value.bookmarks = response.bookmarks_count
    showToast(response.is_bookmarked ? '收藏成功' : '取消收藏成功', 'success')
  } catch (err) {
    showToast('操作失败', 'error')
    console.error('Failed to toggle bookmark:', err)
  }
}

const sharePost = () => {
  // 复制链接到剪贴板
  const url = window.location.href
  navigator.clipboard.writeText(url).then(() => {
    // TODO: 显示成功提示
    console.log('链接已复制到剪贴板')
  })
}

const editPost = () => {
  // TODO: 跳转到编辑页面或显示编辑弹窗
  console.log('编辑帖子')
}

const deletePost = () => {
  // TODO: 显示确认弹窗并删除帖子
  console.log('删除帖子')
}

const submitComment = async () => {
  const isValid = await validateCommentForm()
  if (!isValid) return
  
  try {
    await submitCommentForm(async (data) => {
      const response = await createComment(post.value.id, data)
      
      // 添加新评论到列表
      comments.value.unshift(response)
      post.value.replies += 1
      
      showToast('评论发布成功', 'success')
      return response
    })
  } catch (err) {
    showToast('评论发布失败', 'error')
    console.error('Failed to submit comment:', err)
  }
}

const toggleCommentLike = async (comment) => {
  try {
    const response = await toggleCommentLike(comment.id)
    comment.is_liked = response.is_liked
    comment.likes = response.likes_count
    showToast(response.is_liked ? '点赞成功' : '取消点赞成功', 'success')
  } catch (err) {
    showToast('操作失败', 'error')
    console.error('Failed to toggle comment like:', err)
  }
}

const replyToComment = (comment) => {
  replyingTo.value = comment.id
  replyContent.value = ''
}

const cancelReply = () => {
  replyingTo.value = null
  replyContent.value = ''
}

const submitReply = async (comment) => {
  if (!replyContent.value.trim()) return
  
  submittingReply.value = true
  
  try {
    const response = await createCommentReply(comment.id, {
      content: replyContent.value
    })
    
    if (!comment.replies) {
      comment.replies = []
    }
    comment.replies.push(response)
    
    // 重置表单
    cancelReply()
    
    showToast('回复发布成功', 'success')
  } catch (err) {
    showToast('回复发布失败', 'error')
    console.error('Failed to submit reply:', err)
  } finally {
    submittingReply.value = false
  }
}

const toggleReplyLike = async (reply) => {
  try {
    const response = await toggleCommentLike(reply.id)
    reply.is_liked = response.is_liked
    reply.likes = response.likes_count
    showToast(response.is_liked ? '已点赞回复' : '已取消点赞', 'success')
  } catch (err) {
    showToast('操作失败', 'error')
    console.error('Failed to toggle reply like:', err)
  }
}

const canEditComment = (comment) => {
  return comment.author.id === currentUser.value.id
}

const canDeleteComment = (comment) => {
  return comment.author.id === currentUser.value.id || canEdit.value
}

const editComment = (comment) => {
  // TODO: 实现编辑评论功能
  console.log('编辑评论', comment)
}

const deleteComment = (comment) => {
  // TODO: 实现删除评论功能
  console.log('删除评论', comment)
}

const goBack = () => {
  navigateTo('/community')
}

// 生命周期
onMounted(() => {
  fetchPost()
})
</script>

<style scoped>
.post-detail-page {
  @apply min-h-screen bg-gray-50 dark:bg-gray-900;
}

.loading-state,
.error-state {
  @apply flex flex-col items-center justify-center py-12 text-center;
}

.loading-spinner {
  @apply w-8 h-8 border-4 border-gray-200 border-t-primary-600 rounded-full animate-spin mb-4;
}

.post-content {
  @apply max-w-4xl mx-auto p-6;
}

.back-navigation {
  @apply mb-6;
}

.back-btn {
  @apply inline-flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400
         hover:text-gray-900 dark:hover:text-white transition-colors;
}

.post-main {
  @apply bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 mb-8;
}

.post-header {
  @apply mb-6;
}

.post-meta {
  @apply flex items-start justify-between mb-4;
}

.author-info {
  @apply flex items-center gap-4;
}

.author-avatar {
  @apply w-12 h-12 rounded-full;
}

.author-details {
  @apply flex-1;
}

.author-name {
  @apply text-lg font-semibold text-gray-900 dark:text-white;
}

.author-title {
  @apply text-sm text-gray-600 dark:text-gray-400;
}

.post-time {
  @apply text-sm text-gray-500 dark:text-gray-400 mt-1;
}

.updated-time {
  @apply text-gray-400 dark:text-gray-500;
}

.post-actions {
  @apply flex items-center gap-3;
}

.action-btn {
  @apply flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 dark:text-gray-400
         hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white
         transition-colors;
}

.action-btn.liked {
  @apply text-red-500;
}

.action-btn.bookmarked {
  @apply text-yellow-500;
}

.dropdown {
  @apply relative;
}

.dropdown-menu {
  @apply absolute right-0 top-full mt-2 w-32 bg-white dark:bg-gray-800 rounded-lg shadow-lg
         border border-gray-200 dark:border-gray-700 py-2 z-10;
}

.dropdown-item {
  @apply w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300
         hover:bg-gray-100 dark:hover:bg-gray-700;
}

.post-taxonomy {
  @apply flex items-center gap-4;
}

.post-category {
  @apply flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-700
         text-gray-700 dark:text-gray-300 rounded-full text-sm;
}

.post-tags {
  @apply flex flex-wrap gap-2;
}

.post-tag {
  @apply px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300
         rounded text-sm;
}

.post-title {
  @apply text-3xl font-bold text-gray-900 dark:text-white mb-6 leading-tight;
}

.post-body {
  @apply mb-8;
}

.content-text {
  @apply prose prose-gray dark:prose-invert max-w-none;
}

.content-text :deep(h1) {
  @apply text-2xl font-bold mb-4 mt-8 first:mt-0;
}

.content-text :deep(h2) {
  @apply text-xl font-bold mb-3 mt-6;
}

.content-text :deep(h3) {
  @apply text-lg font-bold mb-2 mt-4;
}

.content-text :deep(p) {
  @apply mb-4 leading-relaxed;
}

.content-text :deep(ul) {
  @apply mb-4 pl-6 space-y-2;
}

.content-text :deep(li) {
  @apply list-disc;
}

.content-text :deep(code) {
  @apply bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm;
}

.content-text :deep(table) {
  @apply w-full border-collapse border border-gray-300 dark:border-gray-600 mb-4;
}

.content-text :deep(th),
.content-text :deep(td) {
  @apply border border-gray-300 dark:border-gray-600 px-4 py-2 text-left;
}

.content-text :deep(th) {
  @apply bg-gray-100 dark:bg-gray-700 font-semibold;
}

.post-stats {
  @apply flex items-center gap-6 pt-6 border-t border-gray-200 dark:border-gray-700;
}

.stat-item {
  @apply flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400;
}

.comments-section {
  @apply bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8;
}

.comments-header {
  @apply flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-700;
}

.comments-title {
  @apply text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3;
}

.sort-select {
  @apply px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
         focus:ring-2 focus:ring-primary-500 focus:border-primary-500;
}

.comment-form {
  @apply mb-8 p-6 bg-gray-50 dark:bg-gray-700 rounded-lg;
}

.form-header {
  @apply flex items-center gap-3 mb-4;
}

.user-avatar {
  @apply w-8 h-8 rounded-full;
}

.form-title {
  @apply font-semibold text-gray-900 dark:text-white;
}

.comment-textarea {
  @apply w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg
         bg-white dark:bg-gray-800 text-gray-900 dark:text-white
         focus:ring-2 focus:ring-primary-500 focus:border-primary-500
         resize-y;
}

.form-actions {
  @apply flex items-center justify-between mt-4;
}

.form-tips {
  @apply flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400;
}

.comments-list {
  @apply space-y-6;
}

.empty-comments {
  @apply flex flex-col items-center justify-center py-12 text-center text-gray-500 dark:text-gray-400;
}

.comment-item {
  @apply flex gap-4;
}

.comment-avatar {
  @apply flex-shrink-0;
}

.avatar {
  @apply w-10 h-10 rounded-full;
}

.comment-content {
  @apply flex-1;
}

.comment-header {
  @apply flex items-center justify-between mb-2;
}

.comment-author {
  @apply flex items-center gap-3;
}

.author-name {
  @apply font-semibold text-gray-900 dark:text-white;
}

.author-title {
  @apply text-sm text-gray-600 dark:text-gray-400;
}

.comment-time {
  @apply text-sm text-gray-500 dark:text-gray-400;
}

.comment-body {
  @apply mb-3;
}

.comment-text {
  @apply text-gray-700 dark:text-gray-300 leading-relaxed;
}

.comment-actions {
  @apply flex items-center gap-4;
}

.comment-action {
  @apply flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400
         hover:text-gray-700 dark:hover:text-gray-300 transition-colors;
}

.comment-action.liked {
  @apply text-red-500;
}

.reply-form {
  @apply mt-4 p-4 bg-gray-50 dark:bg-gray-600 rounded-lg;
}

.reply-textarea {
  @apply w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-lg
         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
         focus:ring-2 focus:ring-primary-500 focus:border-primary-500
         resize-y;
}

.reply-actions {
  @apply flex justify-end gap-2 mt-3;
}

.replies-list {
  @apply mt-4 pl-4 border-l-2 border-gray-200 dark:border-gray-600 space-y-4;
}

.reply-item {
  @apply flex gap-3;
}

.reply-avatar {
  @apply flex-shrink-0;
}

.reply-avatar .avatar {
  @apply w-8 h-8;
}

.reply-content {
  @apply flex-1;
}

.reply-header {
  @apply flex items-center gap-3 mb-1;
}

.reply-author {
  @apply font-medium text-gray-900 dark:text-white text-sm;
}

.reply-time {
  @apply text-xs text-gray-500 dark:text-gray-400;
}

.reply-body {
  @apply mb-2;
}

.reply-text {
  @apply text-sm text-gray-700 dark:text-gray-300 leading-relaxed;
}

.reply-actions {
  @apply flex items-center gap-3;
}

.reply-action {
  @apply flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400
         hover:text-gray-700 dark:hover:text-gray-300 transition-colors;
}

.reply-action.liked {
  @apply text-red-500;
}

.btn {
  @apply inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors
         focus:outline-none focus:ring-2 focus:ring-offset-2;
}

.btn-sm {
  @apply px-3 py-1.5 text-sm;
}

.btn-primary {
  @apply bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500;
}

.btn-secondary {
  @apply bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500;
}
</style>