<template>
  <div class="min-h-screen bg-muted/40">
    <div class="max-w-4xl mx-auto px-4 py-8">
      <div class="bg-card rounded-lg shadow-sm p-8">
        <h1 class="text-3xl font-bold text-foreground mb-8">用户反馈</h1>
        
        <div class="mb-6">
          <p class="text-muted-foreground leading-relaxed">
            您的反馈对我们非常重要！请告诉我们您在使用平台过程中的体验、建议或遇到的问题。
          </p>
        </div>
        
        <form @submit.prevent="submitFeedback" class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-muted-foreground mb-2">反馈类型</label>
            <select 
              v-model="feedback.type"
              required
              class="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">请选择反馈类型</option>
              <option value="bug">错误报告</option>
              <option value="feature">功能建议</option>
              <option value="improvement">改进建议</option>
              <option value="content">内容反馈</option>
              <option value="other">其他</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-muted-foreground mb-2">标题</label>
            <input 
              v-model="feedback.title"
              type="text" 
              required
              placeholder="请简要描述您的反馈"
              class="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
          </div>
          
          <div>
            <label class="block text-sm font-medium text-muted-foreground mb-2">详细描述</label>
            <textarea 
              v-model="feedback.description"
              rows="6" 
              required
              placeholder="请详细描述您的反馈内容..."
              class="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            ></textarea>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-muted-foreground mb-2">优先级</label>
            <div class="flex space-x-4">
              <label class="flex items-center">
                <input 
                  v-model="feedback.priority"
                  type="radio" 
                  value="low"
                  class="mr-2 text-primary"
                >
                <span class="text-sm text-muted-foreground">低</span>
              </label>
              <label class="flex items-center">
                <input 
                  v-model="feedback.priority"
                  type="radio" 
                  value="medium"
                  class="mr-2 text-primary"
                >
                <span class="text-sm text-muted-foreground">中</span>
              </label>
              <label class="flex items-center">
                <input 
                  v-model="feedback.priority"
                  type="radio" 
                  value="high"
                  class="mr-2 text-primary"
                >
                <span class="text-sm text-muted-foreground">高</span>
              </label>
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-muted-foreground mb-2">联系邮箱（可选）</label>
            <input 
              v-model="feedback.email"
              type="email" 
              placeholder="如需回复，请留下您的邮箱"
              class="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
          </div>
          
          <div class="flex items-center">
            <input 
              v-model="feedback.anonymous"
              type="checkbox" 
              id="anonymous"
              class="mr-2 text-primary"
            >
            <label for="anonymous" class="text-sm text-muted-foreground">
              匿名提交（不记录用户信息）
            </label>
          </div>
          
          <div class="flex justify-end space-x-4">
            <button 
              type="button"
              @click="resetForm"
              class="px-6 py-2 border border-border text-muted-foreground rounded-md hover:bg-muted/40 transition-colors"
            >
              重置
            </button>
            <button 
              type="submit"
              :disabled="loading"
              class="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {{ loading ? '提交中...' : '提交反馈' }}
            </button>
          </div>
        </form>
        
        <!-- 反馈统计 -->
        <div class="mt-12 pt-8 border-t border-border">
          <h2 class="text-xl font-semibold text-foreground mb-4">反馈统计</h2>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="text-center p-4 bg-primary/10 rounded-lg">
              <div class="text-2xl font-bold text-primary">156</div>
              <div class="text-sm text-muted-foreground">总反馈数</div>
            </div>
            <div class="text-center p-4 bg-primary/10 rounded-lg">
              <div class="text-2xl font-bold text-primary">89</div>
              <div class="text-sm text-muted-foreground">已处理</div>
            </div>
            <div class="text-center p-4 bg-yellow-50 rounded-lg">
              <div class="text-2xl font-bold text-primary">45</div>
              <div class="text-sm text-muted-foreground">处理中</div>
            </div>
            <div class="text-center p-4 bg-primary/10 rounded-lg">
              <div class="text-2xl font-bold text-primary">22</div>
              <div class="text-sm text-muted-foreground">待处理</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  title: '用户反馈 - 反诈骗知识平台'
})

const feedback = ref({
  type: '',
  title: '',
  description: '',
  priority: 'medium',
  email: '',
  anonymous: false
})

const loading = ref(false)

const submitFeedback = async () => {
  loading.value = true
  try {
    // 这里可以添加实际的反馈提交逻辑
    await new Promise(resolve => setTimeout(resolve, 1000))
    alert('反馈提交成功！感谢您的宝贵意见。')
    resetForm()
  } catch (error) {
    alert('提交失败，请稍后重试。')
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  feedback.value = {
    type: '',
    title: '',
    description: '',
    priority: 'medium',
    email: '',
    anonymous: false
  }
}
</script>