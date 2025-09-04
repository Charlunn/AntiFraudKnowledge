<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <!-- Hero Section -->
    <section class="relative overflow-hidden bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div class="text-center">
          <h1 class="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
            <span class="block">反诈骗知识平台</span>
            <span class="block text-indigo-600">守护您的财产安全</span>
          </h1>
          <p class="mt-6 max-w-2xl mx-auto text-xl text-gray-500">
            通过互动学习、知识图谱和社区交流，提升您的反诈骗意识和防范能力
          </p>
          <div class="mt-8 flex justify-center space-x-4">
            <NuxtLink to="/quiz" class="bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors">
              开始学习
            </NuxtLink>
            <NuxtLink to="/graph" class="bg-white text-indigo-600 border-2 border-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition-colors">
              探索知识图谱
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats Section -->
    <section class="py-16 bg-indigo-600">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
          <div class="text-white">
            <div class="text-3xl font-bold">{{ stats.totalUsers }}+</div>
            <div class="text-indigo-200 mt-2">注册用户</div>
          </div>
          <div class="text-white">
            <div class="text-3xl font-bold">{{ stats.totalQuestions }}+</div>
            <div class="text-indigo-200 mt-2">题目数量</div>
          </div>
          <div class="text-white">
            <div class="text-3xl font-bold">{{ stats.totalKnowledge }}+</div>
            <div class="text-indigo-200 mt-2">知识点</div>
          </div>
          <div class="text-white">
            <div class="text-3xl font-bold">{{ stats.preventedCases }}+</div>
            <div class="text-indigo-200 mt-2">成功防范案例</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-gray-900">平台功能</h2>
          <p class="mt-4 text-xl text-gray-600">多维度提升您的反诈骗能力</p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <!-- 知识测验 -->
          <div class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">知识测验</h3>
            <p class="text-gray-600 mb-4">通过互动测验检验和提升反诈骗知识水平</p>
            <NuxtLink to="/quiz" class="text-blue-600 font-semibold hover:text-blue-700">开始测验 →</NuxtLink>
          </div>

          <!-- 知识图谱 -->
          <div class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">知识图谱</h3>
            <p class="text-gray-600 mb-4">可视化展示诈骗类型和防范策略的关联关系</p>
            <NuxtLink to="/graph" class="text-green-600 font-semibold hover:text-green-700">探索图谱 →</NuxtLink>
          </div>

          <!-- 社区交流 -->
          <div class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2v-6a2 2 0 012-2h8z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">社区交流</h3>
            <p class="text-gray-600 mb-4">与其他用户分享经验，共同提升防范意识</p>
            <NuxtLink to="/community" class="text-purple-600 font-semibold hover:text-purple-700">加入社区 →</NuxtLink>
          </div>

          <!-- 个人中心 -->
          <div class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">个人中心</h3>
            <p class="text-gray-600 mb-4">查看学习进度、成就徽章和个人设置</p>
            <NuxtLink to="/profile" class="text-yellow-600 font-semibold hover:text-yellow-700">个人中心 →</NuxtLink>
          </div>

          <!-- 学习资源 -->
          <div class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">学习资源</h3>
            <p class="text-gray-600 mb-4">丰富的反诈骗案例和防范指南</p>
            <NuxtLink to="/resources" class="text-red-600 font-semibold hover:text-red-700">查看资源 →</NuxtLink>
          </div>

          <!-- AI智能测试 -->
          <div class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div class="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">AI智能测试</h3>
            <p class="text-gray-600 mb-4">AI驱动的智能问答和个性化评估</p>
            <NuxtLink to="/ai-test" class="text-indigo-600 font-semibold hover:text-indigo-700">开始测试 →</NuxtLink>
          </div>

          <!-- 举报中心 -->
          <div class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">举报中心</h3>
            <p class="text-gray-600 mb-4">发现可疑信息？立即举报帮助他人</p>
            <NuxtLink to="/report" class="text-orange-600 font-semibold hover:text-orange-700">立即举报 →</NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- Recent Activity -->
    <section class="py-16 bg-gray-50" v-if="auth.accessToken">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-gray-900">最近活动</h2>
          <p class="mt-4 text-xl text-gray-600">继续您的学习之旅</p>
        </div>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- 学习进度 -->
          <div class="bg-white rounded-xl shadow-lg p-6">
            <h3 class="text-xl font-semibold text-gray-900 mb-4">学习进度</h3>
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <span class="text-gray-600">基础防范知识</span>
                <span class="text-green-600 font-semibold">85%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div class="bg-green-600 h-2 rounded-full" style="width: 85%"></div>
              </div>
              
              <div class="flex items-center justify-between">
                <span class="text-gray-600">网络诈骗识别</span>
                <span class="text-blue-600 font-semibold">72%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div class="bg-blue-600 h-2 rounded-full" style="width: 72%"></div>
              </div>
              
              <div class="flex items-center justify-between">
                <span class="text-gray-600">电信诈骗防范</span>
                <span class="text-yellow-600 font-semibold">58%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div class="bg-yellow-600 h-2 rounded-full" style="width: 58%"></div>
              </div>
            </div>
          </div>
          
          <!-- 最近成就 -->
          <div class="bg-white rounded-xl shadow-lg p-6">
            <h3 class="text-xl font-semibold text-gray-900 mb-4">最近成就</h3>
            <div class="space-y-4">
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <svg class="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                </div>
                <div>
                  <div class="font-semibold text-gray-900">初级防范专家</div>
                  <div class="text-sm text-gray-500">完成10道基础题目</div>
                </div>
              </div>
              
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg class="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                  </svg>
                </div>
                <div>
                  <div class="font-semibold text-gray-900">知识图谱探索者</div>
                  <div class="text-sm text-gray-500">浏览50个知识节点</div>
                </div>
              </div>
              
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clip-rule="evenodd"></path>
                  </svg>
                </div>
                <div>
                  <div class="font-semibold text-gray-900">社区贡献者</div>
                  <div class="text-sm text-gray-500">发布首个帖子</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-16 bg-indigo-600" v-if="!auth.accessToken">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-3xl font-bold text-white mb-4">立即加入我们</h2>
        <p class="text-xl text-indigo-200 mb-8">开始您的反诈骗学习之旅，保护自己和家人的财产安全</p>
        <div class="space-x-4">
          <NuxtLink to="/register" class="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            立即注册
          </NuxtLink>
          <NuxtLink to="/login" class="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-indigo-600 transition-colors">
            已有账号？登录
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'

// 页面元数据
useHead({
  title: '反诈骗知识平台 - 守护您的财产安全',
  meta: [
    { name: 'description', content: '通过互动学习、知识图谱和社区交流，提升您的反诈骗意识和防范能力' },
    { name: 'keywords', content: '反诈骗,防诈骗,网络安全,财产安全,诈骗防范' }
  ]
})

// 状态管理
const auth = useAuthStore()

// 统计数据
const stats = ref({
  totalUsers: 15420,
  totalQuestions: 2580,
  totalKnowledge: 1200,
  preventedCases: 8960
})

// 组件挂载时初始化认证状态
onMounted(() => {
  auth.initialize()
})
</script>

<style scoped>
/* 自定义样式 */
.hero-pattern {
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f0f9ff' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}
</style>
