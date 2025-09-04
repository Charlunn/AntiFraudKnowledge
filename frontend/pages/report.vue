<template>
  <div class="min-h-screen bg-gray-50 dark:bg-dark-bg">
    <div class="container mx-auto px-4 py-8">
      <!-- 页面标题 -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-gray-900 dark:text-dark-text mb-4">
          举报中心
        </h1>
        <p class="text-xl text-gray-600 dark:text-dark-text-secondary max-w-3xl mx-auto">
          发现可疑信息或诈骗行为？立即举报帮助保护更多人的财产安全
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- 举报表单 -->
        <div class="lg:col-span-2">
          <div class="bg-white dark:bg-dark-surface rounded-xl shadow-lg p-6">
            <h2 class="text-2xl font-semibold text-gray-900 dark:text-dark-text mb-6">提交举报</h2>
            
            <form @submit.prevent="submitReport" class="space-y-6">
              <!-- 举报类型 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
                  举报类型 <span class="text-red-500">*</span>
                </label>
                <select 
                  v-model="form.type" 
                  required
                  class="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-dark-bg dark:text-dark-text"
                >
                  <option value="">请选择举报类型</option>
                  <option value="phone">诈骗电话</option>
                  <option value="sms">诈骗短信</option>
                  <option value="website">虚假网站</option>
                  <option value="app">恶意应用</option>
                  <option value="social">社交诈骗</option>
                  <option value="investment">投资诈骗</option>
                  <option value="other">其他</option>
                </select>
              </div>

              <!-- 举报标题 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
                  举报标题 <span class="text-red-500">*</span>
                </label>
                <input 
                  v-model="form.title" 
                  type="text" 
                  required
                  placeholder="请简要描述举报内容"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-dark-bg dark:text-dark-text"
                >
              </div>

              <!-- 详细描述 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
                  详细描述 <span class="text-red-500">*</span>
                </label>
                <textarea 
                  v-model="form.description" 
                  required
                  rows="6"
                  placeholder="请详细描述诈骗行为、手法、涉及的电话号码、网址等信息"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-dark-bg dark:text-dark-text"
                ></textarea>
              </div>

              <!-- 联系信息 -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
                    涉及电话号码
                  </label>
                  <input 
                    v-model="form.phoneNumber" 
                    type="tel" 
                    placeholder="如有涉及的电话号码"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-dark-bg dark:text-dark-text"
                  >
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
                    涉及网址
                  </label>
                  <input 
                    v-model="form.website" 
                    type="url" 
                    placeholder="如有涉及的网址"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-dark-bg dark:text-dark-text"
                  >
                </div>
              </div>

              <!-- 证据上传 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
                  上传证据
                </label>
                <div class="border-2 border-dashed border-gray-300 dark:border-dark-border rounded-lg p-6 text-center">
                  <svg class="w-12 h-12 text-gray-400 dark:text-dark-text-secondary mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p class="text-gray-500 dark:text-dark-text-secondary mb-2">点击上传或拖拽文件到此处</p>
                  <p class="text-sm text-gray-400 dark:text-dark-text-secondary">支持图片、截图、录音等证据文件</p>
                  <input type="file" multiple accept="image/*,audio/*" class="hidden" ref="fileInput">
                  <button 
                    type="button" 
                    @click="$refs.fileInput.click()"
                    class="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                  >
                    选择文件
                  </button>
                </div>
              </div>

              <!-- 联系方式 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
                  您的联系方式
                </label>
                <input 
                  v-model="form.contact" 
                  type="text" 
                  placeholder="电话或邮箱（可选，便于后续联系）"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-dark-bg dark:text-dark-text"
                >
              </div>

              <!-- 匿名举报选项 -->
              <div class="flex items-center">
                <input 
                  v-model="form.anonymous" 
                  type="checkbox" 
                  id="anonymous"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                >
                <label for="anonymous" class="ml-2 block text-sm text-gray-700 dark:text-dark-text">
                  匿名举报（不显示您的个人信息）
                </label>
              </div>

              <!-- 提交按钮 -->
              <div class="flex justify-end space-x-4">
                <button 
                  type="button" 
                  @click="resetForm"
                  class="px-6 py-2 border border-gray-300 dark:border-dark-border text-gray-700 dark:text-dark-text rounded-lg hover:bg-gray-50 dark:hover:bg-dark-bg transition-colors duration-200"
                >
                  重置
                </button>
                <button 
                  type="submit" 
                  :disabled="isSubmitting"
                  class="px-6 py-2 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white rounded-lg font-medium transition-colors duration-200"
                >
                  {{ isSubmitting ? '提交中...' : '提交举报' }}
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- 侧边栏信息 -->
        <div class="space-y-6">
          <!-- 举报须知 -->
          <div class="bg-white dark:bg-dark-surface rounded-xl shadow-lg p-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-dark-text mb-4">举报须知</h3>
            <ul class="space-y-2 text-sm text-gray-600 dark:text-dark-text-secondary">
              <li class="flex items-start">
                <span class="text-blue-500 mr-2">•</span>
                请提供真实、准确的举报信息
              </li>
              <li class="flex items-start">
                <span class="text-blue-500 mr-2">•</span>
                详细描述有助于我们更好地处理
              </li>
              <li class="flex items-start">
                <span class="text-blue-500 mr-2">•</span>
                上传相关证据可提高处理效率
              </li>
              <li class="flex items-start">
                <span class="text-blue-500 mr-2">•</span>
                我们会保护您的隐私信息
              </li>
              <li class="flex items-start">
                <span class="text-blue-500 mr-2">•</span>
                恶意举报将承担相应责任
              </li>
            </ul>
          </div>

          <!-- 紧急联系方式 -->
          <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
            <h3 class="text-lg font-semibold text-red-800 dark:text-red-400 mb-4">紧急联系方式</h3>
            <div class="space-y-3 text-sm">
              <div class="flex items-center text-red-700 dark:text-red-400">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                报警电话：110
              </div>
              <div class="flex items-center text-red-700 dark:text-red-400">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                反诈专线：96110
              </div>
              <div class="flex items-center text-red-700 dark:text-red-400">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                举报邮箱：report@antifraud.com
              </div>
            </div>
          </div>

          <!-- 举报统计 -->
          <div class="bg-white dark:bg-dark-surface rounded-xl shadow-lg p-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-dark-text mb-4">举报统计</h3>
            <div class="space-y-3">
              <div class="flex justify-between items-center">
                <span class="text-gray-600 dark:text-dark-text-secondary">本月举报</span>
                <span class="font-semibold text-gray-900 dark:text-dark-text">1,234</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-600 dark:text-dark-text-secondary">已处理</span>
                <span class="font-semibold text-green-600 dark:text-green-400">1,156</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-600 dark:text-dark-text-secondary">处理中</span>
                <span class="font-semibold text-yellow-600 dark:text-yellow-400">78</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-600 dark:text-dark-text-secondary">成功率</span>
                <span class="font-semibold text-blue-600 dark:text-blue-400">93.7%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// 页面布局
definePageMeta({
  layout: 'default'
})

// 页面元数据
useHead({
  title: '举报中心',
  meta: [
    { name: 'description', content: '发现可疑信息或诈骗行为？立即举报帮助保护更多人的财产安全' }
  ]
})

// 响应式数据
const isSubmitting = ref(false)
const form = ref({
  type: '',
  title: '',
  description: '',
  phoneNumber: '',
  website: '',
  contact: '',
  anonymous: false
})

// 方法
const submitReport = async () => {
  isSubmitting.value = true
  
  try {
    // TODO: 实现举报提交功能
    console.log('提交举报:', form.value)
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 显示成功消息
    alert('举报提交成功！我们会尽快处理您的举报。')
    
    // 重置表单
    resetForm()
  } catch (error) {
    console.error('举报提交失败:', error)
    alert('举报提交失败，请稍后重试。')
  } finally {
    isSubmitting.value = false
  }
}

const resetForm = () => {
  form.value = {
    type: '',
    title: '',
    description: '',
    phoneNumber: '',
    website: '',
    contact: '',
    anonymous: false
  }
}
</script>

<style scoped>
/* 组件特定样式 */
</style>