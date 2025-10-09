<template>
  <div class="post-detail-page">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>正在加载帖子详情...</p>
    </div>
    
    <!-- 错误状态 -->
    <div v-else-if="error" class="error-state">
      <Icon name="heroicons:exclamation-triangle" class="w-12 h-12 text-destructive" />
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
                  <button @click="deletePost" class="dropdown-item text-destructive">
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
            <Icon name="heroicons:chat-bubble-left-ellipsis" class="w-12 h-12 text-muted-foreground" />
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
                  class="comment-action text-destructive"
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

// 设置页面布局
definePageMeta({
  layout: 'default'
})

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

// 帖子数据和评论数据将从API获取

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
    
    // 生产环境下不使用模拟数据
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
  })
}

const editPost = () => {
  // TODO: 跳转到编辑页面或显示编辑弹窗
}

const deletePost = () => {
  // TODO: 显示确认弹窗并删除帖子
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
}

const deleteComment = (comment) => {
  // TODO: 实现删除评论功能
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
  @apply min-h-screen bg-muted/40 dark:bg-background;
}

.loading-state,
.error-state {
  @apply flex flex-col items-center justify-center py-12 text-center;
}

.loading-spinner {
  @apply w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin mb-4;
}

.post-content {
  @apply max-w-4xl mx-auto p-6;
}

.back-navigation {
  @apply mb-6;
}

.back-btn {
  @apply inline-flex items-center gap-2 px-4 py-2 text-muted-foreground dark:text-muted-foreground
         hover:text-foreground dark:hover:text-white transition-colors;
}

.post-main {
  @apply bg-card dark:bg-card rounded-lg shadow-sm border border-border dark:border-border p-8 mb-8;
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
  @apply text-lg font-semibold text-foreground dark:text-white;
}

.author-title {
  @apply text-sm text-muted-foreground dark:text-muted-foreground;
}

.post-time {
  @apply text-sm text-muted-foreground dark:text-muted-foreground mt-1;
}

.updated-time {
  @apply text-muted-foreground dark:text-muted-foreground;
}

.post-actions {
  @apply flex items-center gap-3;
}

.action-btn {
  @apply flex items-center gap-2 px-3 py-2 rounded-lg text-muted-foreground dark:text-muted-foreground
         hover:bg-muted/60 dark:hover:bg-muted/40 hover:text-foreground dark:hover:text-white
         transition-colors;
}

.action-btn.liked {
  @apply text-destructive;
}

.action-btn.bookmarked {
  @apply text-yellow-500;
}

.dropdown {
  @apply relative;
}

.dropdown-menu {
  @apply absolute right-0 top-full mt-2 w-32 bg-card dark:bg-card rounded-lg shadow-lg
         border border-border dark:border-border py-2 z-10;
}

.dropdown-item {
  @apply w-full flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground dark:text-muted-foreground
         hover:bg-muted/60 dark:hover:bg-muted/40;
}

.post-taxonomy {
  @apply flex items-center gap-4;
}

.post-category {
  @apply flex items-center gap-2 px-3 py-1 bg-muted/60 dark:bg-muted/40
         text-muted-foreground dark:text-muted-foreground rounded-full text-sm;
}

.post-tags {
  @apply flex flex-wrap gap-2;
}

.post-tag {
  @apply px-2 py-1 bg-primary/20 dark:bg-primary/30 text-primary dark:text-primary/80
         rounded text-sm;
}

.post-title {
  @apply text-3xl font-bold text-foreground dark:text-white mb-6 leading-tight;
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
  @apply bg-muted/60 dark:bg-card px-2 py-1 rounded text-sm;
}

.content-text :deep(table) {
  @apply w-full border-collapse border border-border dark:border-border mb-4;
}

.content-text :deep(th),
.content-text :deep(td) {
  @apply border border-border dark:border-border px-4 py-2 text-left;
}

.content-text :deep(th) {
  @apply bg-muted/60 dark:bg-muted/40 font-semibold;
}

.post-stats {
  @apply flex items-center gap-6 pt-6 border-t border-border dark:border-border;
}

.stat-item {
  @apply flex items-center gap-2 text-sm text-muted-foreground dark:text-muted-foreground;
}

.comments-section {
  @apply bg-card dark:bg-card rounded-lg shadow-sm border border-border dark:border-border p-8;
}

.comments-header {
  @apply flex items-center justify-between mb-6 pb-4 border-b border-border dark:border-border;
}

.comments-title {
  @apply text-2xl font-bold text-foreground dark:text-white flex items-center gap-3;
}

.sort-select {
  @apply px-3 py-2 border border-border dark:border-border rounded-lg
         bg-card dark:bg-muted/40 text-foreground dark:text-white
         focus:ring-2 focus:ring-primary focus:border-primary;
}

.comment-form {
  @apply mb-8 p-6 bg-muted/40 dark:bg-muted/40 rounded-lg;
}

.form-header {
  @apply flex items-center gap-3 mb-4;
}

.user-avatar {
  @apply w-8 h-8 rounded-full;
}

.form-title {
  @apply font-semibold text-foreground dark:text-white;
}

.comment-textarea {
  @apply w-full px-4 py-3 border border-border dark:border-border rounded-lg
         bg-card dark:bg-card text-foreground dark:text-white
         focus:ring-2 focus:ring-primary focus:border-primary
         resize-y;
}

.form-actions {
  @apply flex items-center justify-between mt-4;
}

.form-tips {
  @apply flex items-center gap-2 text-sm text-muted-foreground dark:text-muted-foreground;
}

.comments-list {
  @apply space-y-6;
}

.empty-comments {
  @apply flex flex-col items-center justify-center py-12 text-center text-muted-foreground dark:text-muted-foreground;
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
  @apply font-semibold text-foreground dark:text-white;
}

.author-title {
  @apply text-sm text-muted-foreground dark:text-muted-foreground;
}

.comment-time {
  @apply text-sm text-muted-foreground dark:text-muted-foreground;
}

.comment-body {
  @apply mb-3;
}

.comment-text {
  @apply text-muted-foreground dark:text-muted-foreground leading-relaxed;
}

.comment-actions {
  @apply flex items-center gap-4;
}

.comment-action {
  @apply flex items-center gap-1 text-sm text-muted-foreground dark:text-muted-foreground
         hover:text-muted-foreground dark:hover:text-muted-foreground transition-colors;
}

.comment-action.liked {
  @apply text-destructive;
}

.reply-form {
  @apply mt-4 p-4 bg-muted/40 dark:bg-muted/20 rounded-lg;
}

.reply-textarea {
  @apply w-full px-3 py-2 border border-border dark:border-border rounded-lg
         bg-card dark:bg-muted/40 text-foreground dark:text-white
         focus:ring-2 focus:ring-primary focus:border-primary
         resize-y;
}

.reply-actions {
  @apply flex justify-end gap-2 mt-3;
}

.replies-list {
  @apply mt-4 pl-4 border-l-2 border-border dark:border-border space-y-4;
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
  @apply font-medium text-foreground dark:text-white text-sm;
}

.reply-time {
  @apply text-xs text-muted-foreground dark:text-muted-foreground;
}

.reply-body {
  @apply mb-2;
}

.reply-text {
  @apply text-sm text-muted-foreground dark:text-muted-foreground leading-relaxed;
}

.reply-actions {
  @apply flex items-center gap-3;
}

.reply-action {
  @apply flex items-center gap-1 text-xs text-muted-foreground dark:text-muted-foreground
         hover:text-muted-foreground dark:hover:text-muted-foreground transition-colors;
}

.reply-action.liked {
  @apply text-destructive;
}

.btn {
  @apply inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors
         focus:outline-none focus:ring-2 focus:ring-offset-2;
}

.btn-sm {
  @apply px-3 py-1.5 text-sm;
}

.btn-primary {
  @apply bg-primary text-white hover:bg-primary/90 focus:ring-primary;
}

.btn-secondary {
  @apply bg-muted/80 text-white hover:bg-muted/40 focus:ring-primary;
}
</style>