<template>
  <div class="min-h-screen bg-muted/40 dark:bg-muted/40">
    <div class="container mx-auto px-4 py-8">
      <!-- 页面标题 -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-foreground dark:text-foreground mb-4">
          我的成就
        </h1>
        <p class="text-xl text-muted-foreground dark:text-muted-foreground max-w-3xl mx-auto">
          记录您在反欺诈学习路上的每一个里程碑
        </p>
      </div>

      <!-- 成就统计概览 -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-card dark:bg-card rounded-xl shadow-lg p-6 text-center">
          <div class="w-12 h-12 bg-primary/20 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg class="w-6 h-6 text-primary dark:text-primary" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
          <div class="text-2xl font-bold text-foreground dark:text-foreground">{{ stats.totalAchievements }}</div>
          <div class="text-sm text-muted-foreground dark:text-muted-foreground">总成就数</div>
        </div>
        
        <div class="bg-card dark:bg-card rounded-xl shadow-lg p-6 text-center">
          <div class="w-12 h-12 bg-primary/20 dark:bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg class="w-6 h-6 text-primary dark:text-primary" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="text-2xl font-bold text-foreground dark:text-foreground">{{ stats.unlockedAchievements }}</div>
          <div class="text-sm text-muted-foreground dark:text-muted-foreground">已解锁</div>
        </div>
        
        <div class="bg-card dark:bg-card rounded-xl shadow-lg p-6 text-center">
          <div class="w-12 h-12 bg-primary/20 dark:bg-success-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg class="w-6 h-6 text-primary dark:text-success-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div class="text-2xl font-bold text-foreground dark:text-foreground">{{ stats.totalPoints }}</div>
          <div class="text-sm text-muted-foreground dark:text-muted-foreground">总积分</div>
        </div>
        
        <div class="bg-card dark:bg-card rounded-xl shadow-lg p-6 text-center">
          <div class="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg class="w-6 h-6 text-primary dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div class="text-2xl font-bold text-foreground dark:text-foreground">{{ stats.currentLevel }}</div>
          <div class="text-sm text-muted-foreground dark:text-muted-foreground">当前等级</div>
        </div>
      </div>

      <!-- 成就分类标签 -->
      <div class="flex flex-wrap justify-center gap-4 mb-8">
        <button 
          v-for="category in categories" 
          :key="category.id"
          @click="activeCategory = category.id"
          class="px-6 py-2 rounded-full font-medium transition-colors duration-200"
          :class="activeCategory === category.id 
            ? 'bg-primary/100 text-white' 
            : 'bg-card dark:bg-card text-muted-foreground dark:text-foreground hover:bg-primary/10 dark:hover:bg-muted/30'"
        >
          {{ category.name }}
        </button>
      </div>

      <!-- 成就列表 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          v-for="achievement in filteredAchievements" 
          :key="achievement.id"
          class="bg-card dark:bg-card rounded-xl shadow-lg p-6 transition-all duration-300"
          :class="achievement.unlocked ? 'hover:shadow-xl' : 'opacity-60'"
        >
          <!-- 成就图标和状态 -->
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center space-x-3">
              <div 
                class="w-12 h-12 rounded-full flex items-center justify-center"
                :class="achievement.unlocked ? getRarityClass(achievement.rarity) : 'bg-muted/60 dark:bg-card'"
              >
                <component 
                  :is="achievement.icon" 
                  class="w-6 h-6"
                  :class="achievement.unlocked ? 'text-white' : 'text-muted-foreground dark:text-muted-foreground'"
                />
              </div>
              <div>
                <h3 class="font-semibold text-foreground dark:text-foreground">{{ achievement.name }}</h3>
                <span 
                  class="text-xs px-2 py-1 rounded-full font-medium"
                  :class="getRarityTextClass(achievement.rarity)"
                >
                  {{ getRarityName(achievement.rarity) }}
                </span>
              </div>
            </div>
            <div v-if="achievement.unlocked" class="text-success-500">
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
            </div>
          </div>

          <!-- 成就描述 -->
          <p class="text-muted-foreground dark:text-muted-foreground mb-4">{{ achievement.description }}</p>

          <!-- 进度条（如果未解锁） -->
          <div v-if="!achievement.unlocked && achievement.progress" class="mb-4">
            <div class="flex justify-between text-sm text-muted-foreground dark:text-muted-foreground mb-1">
              <span>进度</span>
              <span>{{ achievement.progress.current }}/{{ achievement.progress.total }}</span>
            </div>
            <div class="w-full bg-muted/60 dark:bg-muted/40 rounded-full h-2">
              <div 
                class="bg-primary/100 h-2 rounded-full transition-all duration-300"
                :style="{ width: `${(achievement.progress.current / achievement.progress.total) * 100}%` }"
              ></div>
            </div>
          </div>

          <!-- 奖励信息 -->
          <div class="flex items-center justify-between text-sm">
            <div class="flex items-center space-x-2">
              <svg class="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span class="text-muted-foreground dark:text-muted-foreground">{{ achievement.points }} 积分</span>
            </div>
            <div v-if="achievement.unlocked" class="text-xs text-muted-foreground dark:text-muted-foreground">
              {{ formatDate(achievement.unlockedAt) }}
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="filteredAchievements.length === 0" class="text-center py-12">
        <svg class="w-16 h-16 text-muted-foreground dark:text-muted-foreground mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        <p class="text-muted-foreground dark:text-muted-foreground text-lg">暂无相关成就</p>
        <p class="text-sm text-muted-foreground dark:text-muted-foreground mt-2">继续学习解锁更多成就吧！</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// 页面布局和认证中间件
definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

// 页面元数据
useHead({
  title: '我的成就',
  meta: [
    { name: 'description', content: '记录您在反欺诈学习路上的每一个里程碑' }
  ]
})

// 响应式数据
const activeCategory = ref('all')

// 成就统计
const stats = ref({
  totalAchievements: 24,
  unlockedAchievements: 8,
  totalPoints: 1250,
  currentLevel: 5
})

// 成就分类
const categories = [
  { id: 'all', name: '全部' },
  { id: 'learning', name: '学习成就' },
  { id: 'quiz', name: '测验成就' },
  { id: 'community', name: '社区成就' },
  { id: 'special', name: '特殊成就' }
]

// 模拟成就数据
const achievements = ref([
  {
    id: 1,
    name: '初学者',
    description: '完成第一次测验',
    category: 'quiz',
    rarity: 'common',
    points: 50,
    unlocked: true,
    unlockedAt: '2024-01-15',
    icon: 'div' // 这里应该是实际的图标组件
  },
  {
    id: 2,
    name: '知识探索者',
    description: '浏览50个知识图谱节点',
    category: 'learning',
    rarity: 'uncommon',
    points: 100,
    unlocked: true,
    unlockedAt: '2024-01-18',
    icon: 'div'
  },
  {
    id: 3,
    name: '测验达人',
    description: '完成10次测验',
    category: 'quiz',
    rarity: 'rare',
    points: 200,
    unlocked: true,
    unlockedAt: '2024-01-22',
    icon: 'div'
  },
  {
    id: 4,
    name: '社区贡献者',
    description: '发布第一个帖子',
    category: 'community',
    rarity: 'common',
    points: 75,
    unlocked: true,
    unlockedAt: '2024-01-20',
    icon: 'div'
  },
  {
    id: 5,
    name: '防范专家',
    description: '在测验中获得90%以上的正确率',
    category: 'quiz',
    rarity: 'epic',
    points: 300,
    unlocked: false,
    progress: { current: 7, total: 10 },
    icon: 'div'
  },
  {
    id: 6,
    name: '连续学习者',
    description: '连续7天登录学习',
    category: 'learning',
    rarity: 'uncommon',
    points: 150,
    unlocked: false,
    progress: { current: 4, total: 7 },
    icon: 'div'
  },
  {
    id: 7,
    name: '助人为乐',
    description: '帮助其他用户解答问题10次',
    category: 'community',
    rarity: 'rare',
    points: 250,
    unlocked: false,
    progress: { current: 3, total: 10 },
    icon: 'div'
  },
  {
    id: 8,
    name: '传奇学者',
    description: '完成所有基础课程',
    category: 'special',
    rarity: 'legendary',
    points: 500,
    unlocked: false,
    progress: { current: 15, total: 20 },
    icon: 'div'
  }
])

// 计算属性
const filteredAchievements = computed(() => {
  if (activeCategory.value === 'all') {
    return achievements.value
  }
  return achievements.value.filter(achievement => achievement.category === activeCategory.value)
})

// 方法
const getRarityClass = (rarity) => {
  const classes = {
    'common': 'bg-muted/400',
    'uncommon': 'bg-primary/100',
    'rare': 'bg-primary/100',
    'epic': 'bg-primary/100',
    'legendary': 'bg-yellow-500'
  }
  return classes[rarity] || 'bg-muted/400'
}

const getRarityTextClass = (rarity) => {
  const classes = {
    'common': 'bg-muted/60 text-foreground dark:bg-card dark:text-muted-foreground',
    'uncommon': 'bg-primary/20 text-success-700 dark:bg-success-800 dark:text-success-300',
    'rare': 'bg-primary/20 text-primary dark:bg-primary/30 dark:text-primary',
    'epic': 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-300',
    'legendary': 'bg-primary/20 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-300'
  }
  return classes[rarity] || 'bg-muted/60 text-foreground'
}

const getRarityName = (rarity) => {
  const names = {
    'common': '普通',
    'uncommon': '稀有',
    'rare': '珍贵',
    'epic': '史诗',
    'legendary': '传奇'
  }
  return names[rarity] || '普通'
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// 生命周期
onMounted(() => {
  // TODO: 从API加载成就数据
  // loadAchievements()
})
</script>

<style scoped>
/* 组件特定样式 */
</style>