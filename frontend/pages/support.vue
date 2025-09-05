<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-6xl mx-auto px-4 py-8">
      <div class="bg-white rounded-lg shadow-sm p-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-8">帮助与支持</h1>
        
        <!-- 搜索框 -->
        <div class="mb-8">
          <div class="relative max-w-md">
            <input 
              v-model="searchQuery"
              type="text" 
              placeholder="搜索帮助内容..."
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
          </div>
        </div>
        
        <div class="grid lg:grid-cols-3 gap-8">
          <!-- 左侧分类导航 -->
          <div class="lg:col-span-1">
            <h2 class="text-lg font-semibold text-gray-800 mb-4">帮助分类</h2>
            <nav class="space-y-2">
              <button 
                v-for="category in categories"
                :key="category.id"
                @click="selectedCategory = category.id"
                :class="[
                  'w-full text-left px-4 py-2 rounded-lg transition-colors',
                  selectedCategory === category.id 
                    ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                    : 'text-gray-600 hover:bg-gray-100'
                ]"
              >
                <div class="flex items-center space-x-3">
                  <span v-html="category.icon" class="w-5 h-5"></span>
                  <span>{{ category.name }}</span>
                  <span class="ml-auto text-sm text-gray-400">({{ category.count }})</span>
                </div>
              </button>
            </nav>
          </div>
          
          <!-- 右侧内容区域 -->
          <div class="lg:col-span-2">
            <div class="space-y-6">
              <div 
                v-for="item in filteredItems"
                :key="item.id"
                class="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div class="flex items-start justify-between mb-3">
                  <h3 class="text-lg font-semibold text-gray-900">{{ item.title }}</h3>
                  <span :class="[
                    'px-2 py-1 text-xs rounded-full',
                    item.priority === 'high' ? 'bg-red-100 text-red-700' :
                    item.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  ]">
                    {{ item.priority === 'high' ? '重要' : item.priority === 'medium' ? '一般' : '基础' }}
                  </span>
                </div>
                
                <p class="text-gray-600 mb-4">{{ item.description }}</p>
                
                <div class="flex items-center justify-between text-sm text-gray-500">
                  <span>更新时间：{{ item.updatedAt }}</span>
                  <button 
                    @click="toggleExpand(item.id)"
                    class="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {{ expandedItems.includes(item.id) ? '收起' : '查看详情' }}
                  </button>
                </div>
                
                <!-- 展开的详细内容 -->
                <div v-if="expandedItems.includes(item.id)" class="mt-4 pt-4 border-t border-gray-200">
                  <div class="prose prose-sm max-w-none">
                    <div v-html="item.content"></div>
                  </div>
                  
                  <div class="mt-4 flex items-center space-x-4">
                    <button 
                      @click="likeItem(item.id)"
                      :class="[
                        'flex items-center space-x-1 text-sm',
                        likedItems.includes(item.id) ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'
                      ]"
                    >
                      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z"></path>
                      </svg>
                      <span>有用 ({{ item.likes }})</span>
                    </button>
                    
                    <button class="text-sm text-gray-500 hover:text-gray-700">
                      分享
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 没有找到内容 -->
            <div v-if="filteredItems.length === 0" class="text-center py-12">
              <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33"></path>
              </svg>
              <h3 class="mt-2 text-sm font-medium text-gray-900">没有找到相关内容</h3>
              <p class="mt-1 text-sm text-gray-500">尝试调整搜索关键词或选择其他分类</p>
            </div>
          </div>
        </div>
        
        <!-- 底部联系信息 -->
        <div class="mt-12 pt-8 border-t border-gray-200">
          <div class="bg-blue-50 rounded-lg p-6">
            <h3 class="text-lg font-semibold text-blue-900 mb-2">还没找到答案？</h3>
            <p class="text-blue-700 mb-4">我们的客服团队随时为您提供帮助</p>
            <div class="flex flex-wrap gap-4">
              <NuxtLink 
                to="/contact"
                class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                联系客服
              </NuxtLink>
              <NuxtLink 
                to="/feedback"
                class="bg-white text-blue-600 border border-blue-600 px-4 py-2 rounded-md hover:bg-blue-50 transition-colors"
              >
                提交反馈
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  title: '帮助与支持 - 反诈骗知识平台'
})

const searchQuery = ref('')
const selectedCategory = ref('all')
const expandedItems = ref([])
const likedItems = ref([])

const categories = ref([
  { id: 'all', name: '全部', icon: '📋', count: 12 },
  { id: 'account', name: '账户管理', icon: '👤', count: 4 },
  { id: 'learning', name: '学习功能', icon: '📚', count: 3 },
  { id: 'technical', name: '技术问题', icon: '🔧', count: 3 },
  { id: 'security', name: '安全相关', icon: '🔒', count: 2 }
])

const helpItems = ref([
  {
    id: 1,
    category: 'account',
    title: '如何修改个人资料？',
    description: '了解如何更新您的个人信息、头像和联系方式',
    content: '<p>您可以通过以下步骤修改个人资料：</p><ol><li>登录您的账户</li><li>点击右上角的用户头像</li><li>选择"个人设置"</li><li>在个人资料页面进行修改</li><li>点击"保存"按钮</li></ol>',
    priority: 'medium',
    updatedAt: '2024-01-15',
    likes: 23
  },
  {
    id: 2,
    category: 'learning',
    title: 'AI聊天功能如何使用？',
    description: '学习如何与AI助手进行有效对话，获取个性化建议',
    content: '<p>AI聊天功能使用指南：</p><ul><li>访问AI测试页面</li><li>在对话框中输入您的问题</li><li>AI会根据您的问题提供相关的防诈骗知识</li><li>您可以继续追问获取更详细的信息</li></ul>',
    priority: 'high',
    updatedAt: '2024-01-14',
    likes: 45
  },
  {
    id: 3,
    category: 'technical',
    title: '页面加载缓慢怎么办？',
    description: '解决网站访问速度慢的常见问题',
    content: '<p>如果遇到页面加载缓慢的问题，请尝试：</p><ul><li>刷新页面</li><li>清除浏览器缓存</li><li>检查网络连接</li><li>尝试使用其他浏览器</li><li>如问题持续，请联系技术支持</li></ul>',
    priority: 'low',
    updatedAt: '2024-01-13',
    likes: 12
  }
])

const filteredItems = computed(() => {
  let items = helpItems.value
  
  // 按分类筛选
  if (selectedCategory.value !== 'all') {
    items = items.filter(item => item.category === selectedCategory.value)
  }
  
  // 按搜索关键词筛选
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    items = items.filter(item => 
      item.title.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query)
    )
  }
  
  return items
})

const toggleExpand = (itemId) => {
  const index = expandedItems.value.indexOf(itemId)
  if (index > -1) {
    expandedItems.value.splice(index, 1)
  } else {
    expandedItems.value.push(itemId)
  }
}

const likeItem = (itemId) => {
  const index = likedItems.value.indexOf(itemId)
  if (index > -1) {
    likedItems.value.splice(index, 1)
    // 减少点赞数
    const item = helpItems.value.find(item => item.id === itemId)
    if (item) item.likes--
  } else {
    likedItems.value.push(itemId)
    // 增加点赞数
    const item = helpItems.value.find(item => item.id === itemId)
    if (item) item.likes++
  }
}
</script>