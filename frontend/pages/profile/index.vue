<template>
  <div class="profile-page fadeInUp">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state pulse">
      <div class="loading-spinner"></div>
      <p>正在加载用户资料...</p>
    </div>
    
    <!-- 错误状态 -->
    <div v-else-if="error" class="error-state">
      <Icon name="heroicons:exclamation-triangle" class="w-12 h-12 text-red-500" />
      <h3>加载失败</h3>
      <p>{{ error }}</p>
      <button @click="fetchProfile" class="btn btn-primary">重试</button>
    </div>
    
    <!-- 用户资料 -->
    <div v-else-if="profile" class="profile-content">
      <!-- 用户头部信息 -->
      <div class="profile-header fadeInDown">
        <div class="header-background"></div>
        <div class="header-content">
          <div class="avatar-section">
            <div class="avatar-container hover-lift">
              <img :src="profile.avatar" :alt="profile.name" class="user-avatar" />
              <button v-if="isOwnProfile" @click="showAvatarUpload = true" class="avatar-edit-btn">
                <Icon name="heroicons:camera" class="w-4 h-4" />
              </button>
            </div>
            
            <div class="user-info fadeInLeft">
              <h1 class="user-name">{{ profile.name }}</h1>
              <p class="user-title">{{ profile.title }}</p>
              <p class="user-bio">{{ profile.bio }}</p>
              
              <div class="user-meta">
                <div class="meta-item">
                  <Icon name="heroicons:calendar-days" class="w-4 h-4" />
                  <span>加入于 {{ formatDate(profile.joined_at) }}</span>
                </div>
                <div class="meta-item">
                  <Icon name="heroicons:map-pin" class="w-4 h-4" />
                  <span>{{ profile.location }}</span>
                </div>
                <div class="meta-item">
                  <Icon name="heroicons:envelope" class="w-4 h-4" />
                  <span>{{ profile.email }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="profile-actions">
            <button v-if="isOwnProfile" @click="showEditModal = true" class="btn btn-primary">
              <Icon name="heroicons:pencil" class="w-4 h-4" />
              编辑资料
            </button>
            <button v-else @click="handleFollowUser" class="btn" :class="profile.is_following ? 'btn-secondary' : 'btn-primary'">
              <Icon :name="profile.is_following ? 'heroicons:user-minus' : 'heroicons:user-plus'" class="w-4 h-4" />
              {{ profile.is_following ? '取消关注' : '关注' }}
            </button>
            
            <button @click="shareProfile" class="btn btn-secondary">
              <Icon name="heroicons:share" class="w-4 h-4" />
              分享
            </button>
          </div>
        </div>
      </div>
      
      <!-- 统计数据 -->
      <div class="stats-section">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">
              <Icon name="heroicons:academic-cap" class="w-6 h-6 text-blue-500" />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ profile.stats.learning_hours }}</div>
              <div class="stat-label">学习时长</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">
              <Icon name="heroicons:trophy" class="w-6 h-6 text-yellow-500" />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ profile.stats.achievements }}</div>
              <div class="stat-label">获得成就</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">
              <Icon name="heroicons:chat-bubble-left-right" class="w-6 h-6 text-green-500" />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ profile.stats.posts }}</div>
              <div class="stat-label">发布帖子</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">
              <Icon name="heroicons:heart" class="w-6 h-6 text-red-500" />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ profile.stats.likes_received }}</div>
              <div class="stat-label">获得点赞</div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 主要内容区域 -->
      <div class="main-content">
        <!-- 导航标签 -->
        <div class="content-tabs">
          <button 
            v-for="tab in tabs" 
            :key="tab.key"
            @click="activeTab = tab.key"
            class="tab-btn"
            :class="{ 'active': activeTab === tab.key }"
          >
            <Icon :name="tab.icon" class="w-4 h-4" />
            {{ tab.label }}
          </button>
        </div>
        
        <!-- 成就系统 -->
        <div v-if="activeTab === 'achievements'" class="tab-content">
          <div class="achievements-section">
            <div class="section-header">
              <h2 class="section-title">成就徽章</h2>
              <div class="achievement-progress">
                <span class="progress-text">{{ unlockedAchievements.length }}/{{ achievements.length }} 已解锁</span>
                <div class="progress-bar">
                  <div 
                    class="progress-fill" 
                    :style="{ width: `${(unlockedAchievements.length / achievements.length) * 100}%` }"
                  ></div>
                </div>
              </div>
            </div>
            
            <div class="achievements-grid">
              <div 
                v-for="achievement in achievements" 
                :key="achievement.id"
                class="achievement-card"
                :class="{ 'unlocked': achievement.unlocked, 'featured': achievement.featured }"
              >
                <div class="achievement-icon">
                  <Icon :name="achievement.icon" class="w-8 h-8" />
                  <div v-if="achievement.unlocked" class="unlock-badge">
                    <Icon name="heroicons:check" class="w-3 h-3" />
                  </div>
                </div>
                
                <div class="achievement-info">
                  <h3 class="achievement-name">{{ achievement.name }}</h3>
                  <p class="achievement-description">{{ achievement.description }}</p>
                  
                  <div v-if="achievement.unlocked" class="achievement-date">
                    <Icon name="heroicons:calendar" class="w-3 h-3" />
                    {{ formatDate(achievement.unlocked_at) }}
                  </div>
                  
                  <div v-else-if="achievement.progress" class="achievement-progress-bar">
                    <div class="progress-info">
                      <span class="progress-current">{{ achievement.progress.current }}</span>
                      <span class="progress-separator">/</span>
                      <span class="progress-total">{{ achievement.progress.total }}</span>
                    </div>
                    <div class="progress-bar">
                      <div 
                        class="progress-fill" 
                        :style="{ width: `${(achievement.progress.current / achievement.progress.total) * 100}%` }"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 学习记录 -->
        <div v-if="activeTab === 'learning'" class="tab-content">
          <div class="learning-section">
            <div class="section-header">
              <h2 class="section-title">学习记录</h2>
              <div class="time-filter">
                <select v-model="learningTimeRange" class="filter-select">
                  <option value="week">最近一周</option>
                  <option value="month">最近一月</option>
                  <option value="quarter">最近三月</option>
                  <option value="year">最近一年</option>
                </select>
              </div>
            </div>
            
            <!-- 学习统计图表 -->
            <div class="learning-chart">
              <div class="chart-placeholder">
                <Icon name="heroicons:chart-bar" class="w-12 h-12 text-gray-400" />
                <p class="text-gray-500">学习时长趋势图</p>
                <p class="text-sm text-gray-400">（图表功能待实现）</p>
              </div>
            </div>
            
            <!-- 最近学习活动 -->
            <div class="recent-learning">
              <h3 class="subsection-title">最近学习活动</h3>
              <div class="learning-timeline">
                <div 
                  v-for="activity in learningActivities" 
                  :key="activity.id"
                  class="timeline-item"
                >
                  <div class="timeline-marker">
                    <Icon :name="getActivityIcon(activity.type)" class="w-4 h-4" />
                  </div>
                  
                  <div class="timeline-content">
                    <div class="activity-header">
                      <h4 class="activity-title">{{ activity.title }}</h4>
                      <span class="activity-time">{{ formatRelativeTime(activity.timestamp) }}</span>
                    </div>
                    
                    <p class="activity-description">{{ activity.description }}</p>
                    
                    <div class="activity-meta">
                      <span class="activity-type">{{ getActivityTypeLabel(activity.type) }}</span>
                      <span v-if="activity.score" class="activity-score">
                        得分: {{ activity.score }}
                      </span>
                      <span v-if="activity.duration" class="activity-duration">
                        用时: {{ activity.duration }}分钟
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 发布的帖子 -->
        <div v-if="activeTab === 'posts'" class="tab-content">
          <div class="posts-section">
            <div class="section-header">
              <h2 class="section-title">发布的帖子</h2>
              <div class="posts-filter">
                <select v-model="postsFilter" class="filter-select">
                  <option value="all">全部帖子</option>
                  <option value="popular">热门帖子</option>
                  <option value="recent">最新帖子</option>
                </select>
              </div>
            </div>
            
            <div v-if="userPosts.length === 0" class="empty-posts">
              <Icon name="heroicons:document-text" class="w-12 h-12 text-gray-400" />
              <p class="text-gray-500">还没有发布任何帖子</p>
              <NuxtLink v-if="isOwnProfile" to="/community" class="btn btn-primary mt-4">
                <Icon name="heroicons:plus" class="w-4 h-4" />
                发布第一个帖子
              </NuxtLink>
            </div>
            
            <div v-else class="posts-grid">
              <div 
                v-for="post in filteredPosts" 
                :key="post.id"
                class="post-card"
              >
                <div class="post-header">
                  <div class="post-category">
                    <Icon name="heroicons:folder" class="w-4 h-4" />
                    {{ getCategoryLabel(post.category) }}
                  </div>
                  <div class="post-date">{{ formatDate(post.created_at) }}</div>
                </div>
                
                <h3 class="post-title">
                  <NuxtLink :to="`/community/${post.id}`" class="post-link">
                    {{ post.title }}
                  </NuxtLink>
                </h3>
                
                <p class="post-excerpt">{{ post.excerpt }}</p>
                
                <div class="post-tags">
                  <span v-for="tag in post.tags.slice(0, 3)" :key="tag" class="post-tag">
                    #{{ tag }}
                  </span>
                </div>
                
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
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 设置 -->
        <div v-if="activeTab === 'settings' && isOwnProfile" class="tab-content">
          <div class="settings-section">
            <div class="section-header">
              <h2 class="section-title">账户设置</h2>
            </div>
            
            <div class="settings-groups">
              <!-- 个人信息设置 -->
              <div class="settings-group">
                <h3 class="group-title">个人信息</h3>
                <div class="settings-items">
                  <div class="setting-item">
                    <div class="setting-info">
                      <div class="setting-name">用户名</div>
                      <div class="setting-description">{{ profile.name }}</div>
                    </div>
                    <button class="setting-action">修改</button>
                  </div>
                  
                  <div class="setting-item">
                    <div class="setting-info">
                      <div class="setting-name">邮箱地址</div>
                      <div class="setting-description">{{ profile.email }}</div>
                    </div>
                    <button class="setting-action">修改</button>
                  </div>
                  
                  <div class="setting-item">
                    <div class="setting-info">
                      <div class="setting-name">个人简介</div>
                      <div class="setting-description">{{ profile.bio || '未设置' }}</div>
                    </div>
                    <button class="setting-action">修改</button>
                  </div>
                </div>
              </div>
              
              <!-- 隐私设置 -->
              <div class="settings-group">
                <h3 class="group-title">隐私设置</h3>
                <div class="settings-items">
                  <div class="setting-item">
                    <div class="setting-info">
                      <div class="setting-name">个人资料可见性</div>
                      <div class="setting-description">控制其他用户是否可以查看你的个人资料</div>
                    </div>
                    <div class="setting-toggle">
                      <input 
                        v-model="settings.profile_public" 
                        type="checkbox" 
                        class="toggle-input"
                        id="profile-public"
                      >
                      <label for="profile-public" class="toggle-label"></label>
                    </div>
                  </div>
                  
                  <div class="setting-item">
                    <div class="setting-info">
                      <div class="setting-name">学习记录可见性</div>
                      <div class="setting-description">控制其他用户是否可以查看你的学习记录</div>
                    </div>
                    <div class="setting-toggle">
                      <input 
                        v-model="settings.learning_public" 
                        type="checkbox" 
                        class="toggle-input"
                        id="learning-public"
                      >
                      <label for="learning-public" class="toggle-label"></label>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- 通知设置 -->
              <div class="settings-group">
                <h3 class="group-title">通知设置</h3>
                <div class="settings-items">
                  <div class="setting-item">
                    <div class="setting-info">
                      <div class="setting-name">邮件通知</div>
                      <div class="setting-description">接收重要更新和活动通知</div>
                    </div>
                    <div class="setting-toggle">
                      <input 
                        v-model="settings.email_notifications" 
                        type="checkbox" 
                        class="toggle-input"
                        id="email-notifications"
                      >
                      <label for="email-notifications" class="toggle-label"></label>
                    </div>
                  </div>
                  
                  <div class="setting-item">
                    <div class="setting-info">
                      <div class="setting-name">推送通知</div>
                      <div class="setting-description">接收浏览器推送通知</div>
                    </div>
                    <div class="setting-toggle">
                      <input 
                        v-model="settings.push_notifications" 
                        type="checkbox" 
                        class="toggle-input"
                        id="push-notifications"
                      >
                      <label for="push-notifications" class="toggle-label"></label>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- 危险操作 -->
              <div class="settings-group danger-group">
                <h3 class="group-title">危险操作</h3>
                <div class="settings-items">
                  <div class="setting-item">
                    <div class="setting-info">
                      <div class="setting-name">删除账户</div>
                      <div class="setting-description">永久删除你的账户和所有相关数据</div>
                    </div>
                    <button class="setting-action danger">删除账户</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 编辑资料弹窗 -->
    <div v-if="showEditModal" class="modal-overlay" @click="showEditModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2 class="modal-title">编辑个人资料</h2>
          <button @click="showEditModal = false" class="modal-close">
            <Icon name="heroicons:x-mark" class="w-5 h-5" />
          </button>
        </div>
        
        <form @submit.prevent="updateProfile" class="modal-body">
          <div class="form-group">
            <label class="form-label">用户名</label>
            <input 
              v-model="editForm.name" 
              type="text" 
              class="form-input"
              required
            >
          </div>
          
          <div class="form-group">
            <label class="form-label">职位/头衔</label>
            <input 
              v-model="editForm.title" 
              type="text" 
              class="form-input"
            >
          </div>
          
          <div class="form-group">
            <label class="form-label">个人简介</label>
            <textarea 
              v-model="editForm.bio" 
              class="form-textarea"
              rows="4"
              placeholder="介绍一下你自己..."
            ></textarea>
          </div>
          
          <div class="form-group">
            <label class="form-label">所在地</label>
            <input 
              v-model="editForm.location" 
              type="text" 
              class="form-input"
            >
          </div>
          
          <div class="modal-actions">
            <button type="button" @click="showEditModal = false" class="btn btn-secondary">
              取消
            </button>
            <button type="submit" class="btn btn-primary" :disabled="updating">
              <Icon v-if="updating" name="heroicons:arrow-path" class="w-4 h-4 animate-spin" />
              {{ updating ? '保存中...' : '保存' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { fetchUserProfile, fetchUserStats } from '~/composables/useApi'
import { useToast } from '~/composables/useNotification'
import { formatDate, formatNumber } from '~/utils/formatters'
import { USER_ROLES, ACHIEVEMENT_TYPES } from '~/constants'

// 设置页面布局和认证中间件
definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

// 路由参数
const route = useRoute()
const userId = route.params.id || 'me' // 默认为当前用户

// 页面元数据
useHead({
  title: '个人中心 - 反欺诈知识图谱系统',
  meta: [
    { name: 'description', content: '查看和管理您的个人资料、学习进度和成就' }
  ]
})

// API和通知
const { showToast } = useToast()
const { user: currentUser } = useAuth()

// 响应式数据
const loading = ref(false)
const error = ref(null)
const profile = ref(null)
const activeTab = ref('achievements')
const showEditModal = ref(false)
const showAvatarUpload = ref(false)
const updating = ref(false)
const learningTimeRange = ref('month')
const postsFilter = ref('all')

// 当前用户ID（模拟）
const currentUserId = ref(1)

// 表单数据
const editForm = ref({
  name: '',
  title: '',
  bio: '',
  location: ''
})

// 设置数据
const settings = ref({
  profile_public: true,
  learning_public: true,
  email_notifications: true,
  push_notifications: false
})

// 标签页配置
const tabs = [
  { key: 'achievements', label: '成就', icon: 'heroicons:trophy' },
  { key: 'learning', label: '学习记录', icon: 'heroicons:academic-cap' },
  { key: 'posts', label: '发布的帖子', icon: 'heroicons:document-text' },
  { key: 'settings', label: '设置', icon: 'heroicons:cog-6-tooth' }
]

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

// 用户资料数据将从API获取

// 模拟成就数据
const achievements = ref([
  {
    id: 1,
    name: '初学者',
    description: '完成第一个测验',
    icon: 'heroicons:academic-cap',
    unlocked: true,
    unlocked_at: '2024-01-10T00:00:00Z',
    featured: false
  },
  {
    id: 2,
    name: '知识探索者',
    description: '浏览知识图谱超过10次',
    icon: 'heroicons:magnifying-glass',
    unlocked: true,
    unlocked_at: '2024-01-12T00:00:00Z',
    featured: false
  },
  {
    id: 3,
    name: '社区贡献者',
    description: '发布第一个帖子',
    icon: 'heroicons:chat-bubble-left-right',
    unlocked: true,
    unlocked_at: '2024-01-15T00:00:00Z',
    featured: true
  },
  {
    id: 4,
    name: '学习达人',
    description: '累计学习时长达到100小时',
    icon: 'heroicons:clock',
    unlocked: true,
    unlocked_at: '2024-01-20T00:00:00Z',
    featured: true
  },
  {
    id: 5,
    name: '测验高手',
    description: '完成10个测验且平均分超过90分',
    icon: 'heroicons:trophy',
    unlocked: false,
    progress: {
      current: 7,
      total: 10
    },
    featured: false
  },
  {
    id: 6,
    name: '人气王',
    description: '获得100个点赞',
    icon: 'heroicons:heart',
    unlocked: false,
    progress: {
      current: 68,
      total: 100
    },
    featured: false
  }
])

// 模拟学习活动数据
const learningActivities = ref([
  {
    id: 1,
    type: 'quiz',
    title: '信用卡欺诈检测基础',
    description: '完成了关于信用卡欺诈检测的基础测验',
    timestamp: '2024-01-20T14:30:00Z',
    score: 92,
    duration: 15
  },
  {
    id: 2,
    type: 'graph',
    title: '探索知识图谱',
    description: '浏览了反洗钱相关的知识节点',
    timestamp: '2024-01-20T10:15:00Z',
    duration: 25
  },
  {
    id: 3,
    type: 'post',
    title: '发布技术分享',
    description: '分享了关于特征工程的经验',
    timestamp: '2024-01-19T16:45:00Z'
  },
  {
    id: 4,
    type: 'quiz',
    title: '机器学习算法应用',
    description: '完成了机器学习算法在反欺诈中的应用测验',
    timestamp: '2024-01-18T11:20:00Z',
    score: 88,
    duration: 20
  }
])

// 模拟用户帖子数据
const userPosts = ref([
  {
    id: 1,
    title: '如何提高信用卡欺诈检测的准确率？',
    excerpt: '最近在做信用卡欺诈检测项目，发现准确率总是不够理想。经过一段时间的研究和实践，总结了一些提高准确率的方法...',
    category: 'fraud_detection',
    tags: ['信用卡欺诈', '机器学习', '准确率'],
    created_at: '2024-01-15T10:30:00Z',
    views: 234,
    likes: 45,
    replies: 12
  },
  {
    id: 2,
    title: '反洗钱系统中的异常检测算法对比',
    excerpt: '在反洗钱系统开发过程中，异常检测是核心功能之一。本文对比了几种常用的异常检测算法...',
    category: 'machine_learning',
    tags: ['反洗钱', '异常检测', '算法对比'],
    created_at: '2024-01-10T14:20:00Z',
    views: 189,
    likes: 32,
    replies: 8
  }
])

// 计算属性
const isOwnProfile = computed(() => {
  return userId === 'me' || (profile.value && profile.value.id === currentUserId.value)
})

const unlockedAchievements = computed(() => {
  return achievements.value.filter(a => a.unlocked)
})

const filteredPosts = computed(() => {
  let posts = [...userPosts.value]
  
  switch (postsFilter.value) {
    case 'popular':
      return posts.sort((a, b) => b.likes - a.likes)
    case 'recent':
      return posts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    default:
      return posts
  }
})

// 方法
const fetchProfile = async () => {
  loading.value = true
  error.value = null
  
  try {
    // 尝试获取真实数据
    const [userProfileData, userStatsData] = await Promise.all([
      fetchUserProfile().catch(() => null),
      fetchUserStats().catch(() => null)
    ])
    
    if (userProfileData && userStatsData) {
      // 使用真实数据构建用户资料
      profile.value = {
        id: userProfileData.id || 1,
        name: userProfileData.username || userProfileData.name || '用户',
        title: userProfileData.title || '学习者',
        bio: userProfileData.bio || '这个用户很懒，什么都没有留下。',
        email: userProfileData.email || '',
        location: userProfileData.location || '',
        avatar: userProfileData.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=user',
        joined_at: userProfileData.date_joined || userProfileData.created_at || new Date().toISOString(),
        is_following: false,
        stats: {
          learning_hours: Math.floor(userStatsData.total_study_time / 60) || 0,
          achievements: userStatsData.achievements_count || 0,
          posts: userStatsData.posts_count || 0,
          likes_received: userStatsData.likes_received || 0
        }
      }
      
      // 更新成就数据
      if (userStatsData.achievements) {
        achievements.value = userStatsData.achievements.map((achievement, index) => ({
          id: achievement.id || index + 1,
          name: achievement.name || '成就',
          description: achievement.description || '完成特定任务',
          icon: achievement.icon || 'heroicons:trophy',
          unlocked: achievement.unlocked || true,
          unlocked_at: achievement.unlocked_at || new Date().toISOString(),
          featured: achievement.featured || false
        }))
      }
      
      // 更新学习活动数据
      if (userStatsData.recent_activities) {
        learningActivities.value = userStatsData.recent_activities.map((activity, index) => ({
          id: activity.id || index + 1,
          type: activity.type || 'quiz',
          title: activity.title || '学习活动',
          description: activity.description || '完成了一项学习任务',
          timestamp: activity.timestamp || activity.created_at || new Date().toISOString(),
          score: activity.score,
          duration: activity.duration
        }))
      }
    } else {
      // 回退到模拟数据
      profile.value = mockProfile
    }
    
    // 如果是自己的资料，初始化编辑表单
    if (isOwnProfile.value) {
      editForm.value = {
        name: profile.value.name,
        title: profile.value.title,
        bio: profile.value.bio,
        location: profile.value.location
      }
    }
    
    // 更新页面标题
    useHead({
      title: `${profile.value.name} - 个人资料`
    })
    
  } catch (err) {
    error.value = '获取用户资料失败: ' + err.message
    showToast('获取用户资料失败', 'error')
    console.error('Failed to fetch profile:', err)
  } finally {
    loading.value = false
  }
}



const formatRelativeTime = (timestamp) => {
  const now = new Date()
  const time = new Date(timestamp)
  const diff = now - time
  
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  
  return time.toLocaleDateString('zh-CN')
}

const getCategoryLabel = (value) => {
  const category = categories.find(c => c.value === value)
  return category ? category.label : value
}

const getActivityIcon = (type) => {
  const icons = {
    quiz: 'heroicons:academic-cap',
    graph: 'heroicons:share',
    post: 'heroicons:chat-bubble-left-right',
    achievement: 'heroicons:trophy'
  }
  return icons[type] || 'heroicons:clock'
}

const getActivityTypeLabel = (type) => {
  const labels = {
    quiz: '测验',
    graph: '图谱探索',
    post: '社区发帖',
    achievement: '成就解锁'
  }
  return labels[type] || type
}

const handleFollowUser = async () => {
  try {
    const response = await followUser(profile.value.id)
    profile.value.is_following = response.is_following
    showToast(response.is_following ? '关注成功' : '取消关注成功', 'success')
  } catch (err) {
    showToast('操作失败', 'error')
    console.error('Failed to follow user:', err)
  }
}

const shareProfile = () => {
  // 复制链接到剪贴板
  const url = window.location.href
  navigator.clipboard.writeText(url).then(() => {
    // TODO: 显示成功提示
    console.log('链接已复制到剪贴板')
  })
}

const updateProfile = async () => {
  updating.value = true
  
  try {
    const response = await updateUserProfile(editForm.value)
    
    // 更新本地数据
    Object.assign(profile.value, response)
    
    showEditModal.value = false
    showToast('个人资料更新成功', 'success')
    
  } catch (err) {
    showToast('更新失败', 'error')
    console.error('Failed to update profile:', err)
  } finally {
    updating.value = false
  }
}

// 生命周期
onMounted(() => {
  fetchProfile()
  
  // 如果不是自己的资料，隐藏设置标签
  if (!isOwnProfile.value) {
    const settingsIndex = tabs.findIndex(tab => tab.key === 'settings')
    if (settingsIndex > -1) {
      tabs.splice(settingsIndex, 1)
    }
  }
})
</script>

<style scoped>
.profile-page {
  @apply min-h-screen bg-gray-50 dark:bg-gray-900;
}

.loading-state,
.error-state {
  @apply flex flex-col items-center justify-center py-12 text-center;
}

.loading-spinner {
  @apply w-8 h-8 border-4 border-gray-200 border-t-primary-600 rounded-full animate-spin mb-4;
}

.profile-content {
  @apply max-w-6xl mx-auto;
}

.profile-header {
  @apply relative mb-8;
}

.header-background {
  @apply h-48 bg-gradient-to-r from-primary-500 to-primary-700 rounded-b-2xl;
}

.header-content {
  @apply absolute inset-x-0 top-32 px-6;
}

.avatar-section {
  @apply flex flex-col md:flex-row items-center md:items-end gap-6 mb-6;
}

.avatar-container {
  @apply relative;
}

.user-avatar {
  @apply w-32 h-32 rounded-full border-4 border-white shadow-lg;
}

.avatar-edit-btn {
  @apply absolute bottom-2 right-2 w-8 h-8 bg-primary-600 text-white rounded-full
         flex items-center justify-center hover:bg-primary-700 transition-colors;
}

.user-info {
  @apply text-center md:text-left flex-1;
}

.user-name {
  @apply text-3xl font-bold text-gray-900 dark:text-white mb-2;
}

.user-title {
  @apply text-lg text-gray-600 dark:text-gray-400 mb-3;
}

.user-bio {
  @apply text-gray-700 dark:text-gray-300 max-w-2xl leading-relaxed mb-4;
}

.user-meta {
  @apply flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400;
}

.meta-item {
  @apply flex items-center gap-2;
}

.profile-actions {
  @apply flex gap-3;
}

.stats-section {
  @apply mb-8 px-6;
}

.stats-grid {
  @apply grid grid-cols-2 md:grid-cols-4 gap-4;
}

.stat-card {
  @apply bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700;
}

.stat-icon {
  @apply mb-3;
}

.stat-value {
  @apply text-2xl font-bold text-gray-900 dark:text-white mb-1;
}

.stat-label {
  @apply text-sm text-gray-600 dark:text-gray-400;
}

.main-content {
  @apply px-6;
}

.content-tabs {
  @apply flex border-b border-gray-200 dark:border-gray-700 mb-8;
}

.tab-btn {
  @apply flex items-center gap-2 px-6 py-3 text-gray-600 dark:text-gray-400
         hover:text-gray-900 dark:hover:text-white border-b-2 border-transparent
         hover:border-gray-300 dark:hover:border-gray-600 transition-colors;
}

.tab-btn.active {
  @apply text-primary-600 dark:text-primary-400 border-primary-600 dark:border-primary-400;
}

.tab-content {
  @apply bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8;
}

.section-header {
  @apply flex items-center justify-between mb-6;
}

.section-title {
  @apply text-2xl font-bold text-gray-900 dark:text-white;
}

.subsection-title {
  @apply text-lg font-semibold text-gray-900 dark:text-white mb-4;
}

.achievement-progress {
  @apply flex items-center gap-3;
}

.progress-text {
  @apply text-sm text-gray-600 dark:text-gray-400;
}

.progress-bar {
  @apply w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden;
}

.progress-fill {
  @apply h-full bg-primary-600 transition-all duration-300;
}

.achievements-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6;
}

.achievement-card {
  @apply p-6 border border-gray-200 dark:border-gray-700 rounded-lg
         transition-all duration-200 hover:shadow-md;
}

.achievement-card.unlocked {
  @apply bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800;
}

.achievement-card.featured {
  @apply ring-2 ring-yellow-400 dark:ring-yellow-500;
}

.achievement-icon {
  @apply relative w-16 h-16 mx-auto mb-4 flex items-center justify-center
         bg-gray-100 dark:bg-gray-700 rounded-full;
}

.achievement-card.unlocked .achievement-icon {
  @apply bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-400;
}

.unlock-badge {
  @apply absolute -top-1 -right-1 w-5 h-5 bg-green-500 text-white rounded-full
         flex items-center justify-center;
}

.achievement-info {
  @apply text-center;
}

.achievement-name {
  @apply font-semibold text-gray-900 dark:text-white mb-2;
}

.achievement-description {
  @apply text-sm text-gray-600 dark:text-gray-400 mb-3;
}

.achievement-date {
  @apply flex items-center justify-center gap-1 text-xs text-green-600 dark:text-green-400;
}

.achievement-progress-bar {
  @apply space-y-2;
}

.progress-info {
  @apply flex items-center justify-center gap-1 text-sm text-gray-600 dark:text-gray-400;
}

.progress-current {
  @apply font-semibold text-primary-600 dark:text-primary-400;
}

.progress-separator {
  @apply text-gray-400;
}

.progress-total {
  @apply text-gray-500;
}

.learning-chart {
  @apply mb-8;
}

.chart-placeholder {
  @apply h-64 bg-gray-50 dark:bg-gray-700 rounded-lg flex flex-col items-center justify-center;
}

.learning-timeline {
  @apply space-y-6;
}

.timeline-item {
  @apply flex gap-4;
}

.timeline-marker {
  @apply flex-shrink-0 w-10 h-10 bg-primary-100 dark:bg-primary-900
         text-primary-600 dark:text-primary-400 rounded-full
         flex items-center justify-center;
}

.timeline-content {
  @apply flex-1 pb-6 border-b border-gray-200 dark:border-gray-700 last:border-b-0;
}

.activity-header {
  @apply flex items-center justify-between mb-2;
}

.activity-title {
  @apply font-semibold text-gray-900 dark:text-white;
}

.activity-time {
  @apply text-sm text-gray-500 dark:text-gray-400;
}

.activity-description {
  @apply text-gray-700 dark:text-gray-300 mb-3;
}

.activity-meta {
  @apply flex flex-wrap gap-4 text-sm;
}

.activity-type {
  @apply px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded;
}

.activity-score {
  @apply px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded;
}

.activity-duration {
  @apply px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded;
}

.filter-select {
  @apply px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
         focus:ring-2 focus:ring-primary-500 focus:border-primary-500;
}

.empty-posts {
  @apply flex flex-col items-center justify-center py-12 text-center;
}

.posts-grid {
  @apply grid grid-cols-1 lg:grid-cols-2 gap-6;
}

.post-card {
  @apply p-6 border border-gray-200 dark:border-gray-700 rounded-lg
         hover:shadow-md transition-shadow;
}

.post-header {
  @apply flex items-center justify-between mb-3;
}

.post-category {
  @apply flex items-center gap-2 px-2 py-1 bg-gray-100 dark:bg-gray-700
         text-gray-700 dark:text-gray-300 rounded text-sm;
}

.post-date {
  @apply text-sm text-gray-500 dark:text-gray-400;
}

.post-title {
  @apply text-lg font-semibold mb-3;
}

.post-link {
  @apply text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400
         transition-colors;
}

.post-excerpt {
  @apply text-gray-700 dark:text-gray-300 mb-4 line-clamp-3;
}

.post-tags {
  @apply flex flex-wrap gap-2 mb-4;
}

.post-tag {
  @apply px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300
         rounded text-sm;
}

.post-stats {
  @apply flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400;
}

.stat-item {
  @apply flex items-center gap-1;
}

.settings-groups {
  @apply space-y-8;
}

.settings-group {
  @apply border border-gray-200 dark:border-gray-700 rounded-lg p-6;
}

.settings-group.danger-group {
  @apply border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20;
}

.group-title {
  @apply text-lg font-semibold text-gray-900 dark:text-white mb-4;
}

.settings-items {
  @apply space-y-4;
}

.setting-item {
  @apply flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700
         last:border-b-0;
}

.setting-info {
  @apply flex-1;
}

.setting-name {
  @apply font-medium text-gray-900 dark:text-white mb-1;
}

.setting-description {
  @apply text-sm text-gray-600 dark:text-gray-400;
}

.setting-action {
  @apply px-4 py-2 text-sm font-medium text-primary-600 dark:text-primary-400
         hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors;
}

.setting-action.danger {
  @apply text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20;
}

.setting-toggle {
  @apply relative;
}

.toggle-input {
  @apply sr-only;
}

.toggle-label {
  @apply block w-12 h-6 bg-gray-300 dark:bg-gray-600 rounded-full cursor-pointer
         transition-colors relative;
}

.toggle-label::after {
  @apply content-[''] absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full
         transition-transform;
}

.toggle-input:checked + .toggle-label {
  @apply bg-primary-600;
}

.toggle-input:checked + .toggle-label::after {
  @apply transform translate-x-6;
}

.modal-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[55];
}

.modal-content {
  @apply bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto;
}

.modal-header {
  @apply flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700;
}

.modal-title {
  @apply text-lg font-semibold text-gray-900 dark:text-white;
}

.modal-close {
  @apply p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors;
}

.modal-body {
  @apply p-6 space-y-4;
}

.form-group {
  @apply space-y-2;
}

.form-label {
  @apply block text-sm font-medium text-gray-700 dark:text-gray-300;
}

.form-input {
  @apply w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
         focus:ring-2 focus:ring-primary-500 focus:border-primary-500;
}

.form-textarea {
  @apply w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
         focus:ring-2 focus:ring-primary-500 focus:border-primary-500
         resize-y;
}

.modal-actions {
  @apply flex justify-end gap-3 pt-4;
}

.btn {
  @apply inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors
         focus:outline-none focus:ring-2 focus:ring-offset-2;
}

.btn-primary {
  @apply bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500;
}

.btn-secondary {
  @apply bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500;
}
</style>