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

// 模拟资源数据
const mockResources = {
  1: {
    id: 1,
    title: '电信诈骗典型案例分析',
    description: '深入分析近期高发的电信诈骗案例，总结诈骗手法和防范要点',
    type: 'case',
    category: 'case',
    tags: ['电信诈骗', '案例分析', '防范技巧'],
    views: 1250,
    likes: 89,
    createdAt: '2024-01-15',
    content: `
      <h3>案例背景</h3>
      <p>近年来，电信诈骗案件频发，诈骗分子利用各种手段实施诈骗，给人民群众造成了巨大的经济损失。本文通过分析典型案例，帮助大家识别和防范电信诈骗。</p>
      
      <h3>典型案例一：冒充公检法诈骗</h3>
      <p>诈骗分子冒充公安、检察院、法院等执法部门工作人员，以涉嫌洗钱、贩毒等罪名为由，要求受害人配合调查，并要求其将资金转入所谓的"安全账户"。</p>
      
      <h4>诈骗手法：</h4>
      <ul>
        <li>冒充执法部门身份</li>
        <li>编造虚假案件信息</li>
        <li>制造紧张恐慌情绪</li>
        <li>要求转账到"安全账户"</li>
      </ul>
      
      <h4>防范要点：</h4>
      <ul>
        <li>公检法机关不会通过电话办案</li>
        <li>不存在所谓的"安全账户"</li>
        <li>遇到此类电话应立即挂断</li>
        <li>如有疑问可拨打110核实</li>
      </ul>
      
      <h3>典型案例二：网络投资理财诈骗</h3>
      <p>诈骗分子通过网络平台、社交软件等渠道，以高收益、低风险为诱饵，诱导受害人在虚假投资平台进行投资。</p>
      
      <h4>诈骗手法：</h4>
      <ul>
        <li>承诺高收益低风险</li>
        <li>制作虚假投资平台</li>
        <li>安排"托儿"营造盈利假象</li>
        <li>诱导加大投资金额</li>
      </ul>
      
      <h4>防范要点：</h4>
      <ul>
        <li>理性看待投资收益</li>
        <li>选择正规投资渠道</li>
        <li>不轻信网络投资广告</li>
        <li>投资前要充分了解风险</li>
      </ul>
      
      <h3>总结</h3>
      <p>防范电信诈骗需要我们提高警惕，增强防范意识。遇到可疑情况时，要冷静分析，及时求证，不要轻易相信陌生人的话，更不要随意转账汇款。</p>
    `
  },
  2: {
    id: 2,
    title: '网络购物安全防范指南',
    description: '全面介绍网络购物中的常见陷阱和安全防范措施',
    type: 'guide',
    category: 'guide',
    tags: ['网络购物', '安全防范', '消费者保护'],
    views: 980,
    likes: 67,
    createdAt: '2024-01-12',
    content: `
      <h3>网络购物安全指南</h3>
      <p>随着电子商务的快速发展，网络购物已成为人们日常生活的重要组成部分。然而，网络购物中也存在各种安全风险，需要我们提高警惕。</p>
      
      <h3>常见网购陷阱</h3>
      <h4>1. 虚假购物网站</h4>
      <p>诈骗分子制作与知名电商平台相似的虚假网站，诱导消费者在其网站上购物，骗取资金。</p>
      
      <h4>2. 超低价商品诱惑</h4>
      <p>以明显低于市场价的商品吸引消费者，收款后不发货或发送假冒伪劣商品。</p>
      
      <h4>3. 钓鱼链接</h4>
      <p>通过短信、邮件等方式发送虚假购物链接，窃取用户个人信息和银行卡信息。</p>
      
      <h3>安全防范措施</h3>
      <h4>选择正规平台</h4>
      <ul>
        <li>选择知名度高、信誉好的电商平台</li>
        <li>查看网站是否有相关资质认证</li>
        <li>注意网站域名是否正确</li>
      </ul>
      
      <h4>谨慎选择商家</h4>
      <ul>
        <li>查看商家信誉评级和用户评价</li>
        <li>选择有实体店铺的商家</li>
        <li>避免选择评价过少的新店铺</li>
      </ul>
      
      <h4>安全支付</h4>
      <ul>
        <li>使用平台提供的担保交易</li>
        <li>避免直接转账给商家</li>
        <li>不要在公共WiFi下进行支付</li>
      </ul>
    `
  },
  3: {
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
  4: {
    id: 4,
    title: '反诈骗最新动态',
    description: '关注最新的诈骗手法和防范措施更新',
    type: 'article',
    category: 'article',
    tags: ['最新动态', '诈骗手法', '防范更新'],
    views: 750,
    likes: 45,
    createdAt: '2024-01-08',
    content: `
      <h3>2024年反诈骗最新动态</h3>
      <p>随着科技的发展，诈骗手法也在不断更新换代。本文为您介绍2024年出现的新型诈骗手法和相应的防范措施。</p>
      
      <h3>新型诈骗手法</h3>
      <h4>1. AI换脸诈骗</h4>
      <p>诈骗分子利用AI技术制作虚假视频，冒充熟人进行诈骗。</p>
      
      <h4>2. 虚拟货币诈骗</h4>
      <p>以投资虚拟货币为名，诱导受害人投资虚假数字货币项目。</p>
      
      <h4>3. 直播带货诈骗</h4>
      <p>在直播平台销售假冒伪劣商品或进行虚假宣传。</p>
      
      <h3>防范建议</h3>
      <ul>
        <li>提高对新技术的认知</li>
        <li>多渠道验证信息真实性</li>
        <li>保持理性消费观念</li>
        <li>及时关注官方防诈提醒</li>
      </ul>
    `
  },
  5: {
    id: 5,
    title: '诈骗电话识别工具',
    description: '实用的诈骗电话识别和举报工具使用指南',
    type: 'tool',
    category: 'tool',
    tags: ['识别工具', '举报功能', '实用工具'],
    views: 1580,
    likes: 112,
    createdAt: '2024-01-05',
    content: `
      <h3>诈骗电话识别工具使用指南</h3>
      <p>本指南将介绍几款实用的诈骗电话识别工具，帮助您有效防范电信诈骗。</p>
      
      <h3>推荐工具</h3>
      <h4>1. 国家反诈中心APP</h4>
      <p>官方推出的反诈骗应用，具有来电预警、诈骗举报等功能。</p>
      
      <h4>2. 手机安全软件</h4>
      <p>如腾讯手机管家、360手机卫士等，提供骚扰电话拦截功能。</p>
      
      <h4>3. 运营商服务</h4>
      <p>三大运营商都提供了骚扰电话拦截服务。</p>
      
      <h3>使用方法</h3>
      <ul>
        <li>下载并安装相关应用</li>
        <li>开启来电识别功能</li>
        <li>及时更新诈骗号码库</li>
        <li>积极举报可疑电话</li>
      </ul>
    `
  }
}

// 加载资源数据
const loadResource = async () => {
  try {
    loading.value = true
    error.value = null
    
    // 尝试从题目数据生成资源详情
    const questionsData = await fetchQuestions().catch(() => null)
    
    if (questionsData && questionsData.length > 0) {
      // 根据ID查找对应的题目生成资源
      const questionIndex = parseInt(resourceId) - 1
      const question = questionsData[questionIndex] || questionsData[0]
      
      const resourceTypes = ['case', 'guide', 'video', 'article', 'tool']
      const resourceType = resourceTypes[questionIndex % resourceTypes.length]
      
      resource.value = {
        id: parseInt(resourceId),
        title: question.question_text ? 
          `${getTypeName(resourceType)}：${question.question_text.substring(0, 30)}...` :
          `${getTypeName(resourceType)}：反欺诈知识点${resourceId}`,
        description: question.explanation || 
          `深入了解${getTypeName(resourceType)}相关的反欺诈知识和实践经验`,
        type: resourceType,
        category: resourceType,
        tags: [
          question.difficulty === 'easy' ? '基础' : question.difficulty === 'medium' ? '进阶' : '高级',
          '反欺诈',
          resourceType === 'case' ? '案例' : resourceType === 'guide' ? '指南' : '学习'
        ],
        views: Math.floor(Math.random() * 2000) + 100,
        likes: Math.floor(Math.random() * 200) + 10,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        content: question.explanation ? 
          `<h3>知识点详解</h3><p>${question.explanation}</p><h3>相关内容</h3><p>这是关于${question.question_text || '反欺诈知识'}的详细说明。</p>` :
          getDefaultContent()
      }
    } else {
      // 回退到模拟数据
      const mockResource = mockResources[resourceId]
      if (!mockResource) {
        throw new Error('资源不存在')
      }
      resource.value = mockResource
    }
    
    // 加载相关资源
    loadRelatedResources()
    
    // 增加浏览次数
    resource.value.views += 1
    
  } catch (err) {
    error.value = err.message || '加载资源失败'
  } finally {
    loading.value = false
  }
}

// 加载相关资源
const loadRelatedResources = () => {
  const allResources = Object.values(mockResources)
  const currentResource = resource.value
  
  // 筛选相关资源（相同类型或相同标签）
  const related = allResources
    .filter(r => r.id !== currentResource.id)
    .filter(r => 
      r.type === currentResource.type || 
      r.tags.some(tag => currentResource.tags.includes(tag))
    )
    .slice(0, 3)
  
  relatedResources.value = related
}

// 获取默认内容
const getDefaultContent = () => {
  return `
    <h3>资源内容</h3>
    <p>这是一个关于${resource.value?.title}的详细介绍。</p>
    <p>本资源将帮助您了解相关的反欺诈知识，提高防范意识。</p>
    <h4>主要内容包括：</h4>
    <ul>
      <li>基础概念介绍</li>
      <li>实际案例分析</li>
      <li>防范措施建议</li>
      <li>相关法律法规</li>
    </ul>
    <p>通过学习本资源，您将能够更好地识别和防范各种欺诈行为。</p>
  `
}

// 工具方法
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

// 交互方法
const toggleLike = () => {
  isLiked.value = !isLiked.value
  if (isLiked.value) {
    resource.value.likes += 1
  } else {
    resource.value.likes -= 1
  }
}

const shareResource = () => {
  if (navigator.share) {
    navigator.share({
      title: resource.value.title,
      text: resource.value.description,
      url: window.location.href
    })
  } else {
    // 复制链接到剪贴板
    navigator.clipboard.writeText(window.location.href)
    alert('链接已复制到剪贴板')
  }
}

// 生命周期
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