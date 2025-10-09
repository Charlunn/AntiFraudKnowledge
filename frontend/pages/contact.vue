<template>
  <div class="min-h-screen bg-muted/40">
    <div class="max-w-4xl mx-auto px-4 py-8">
      <div class="bg-card rounded-lg shadow-sm p-8">
        <h1 class="text-3xl font-bold text-foreground mb-8">联系我们</h1>
        
        <div class="grid md:grid-cols-2 gap-8">
          <!-- 联系表单 -->
          <div>
            <h2 class="text-xl font-semibold text-foreground mb-4">发送消息</h2>
            <form @submit.prevent="submitForm" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-muted-foreground mb-1">姓名</label>
                <input 
                  v-model="form.name"
                  type="text" 
                  required
                  class="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
              </div>
              
              <div>
                <label class="block text-sm font-medium text-muted-foreground mb-1">邮箱</label>
                <input 
                  v-model="form.email"
                  type="email" 
                  required
                  class="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
              </div>
              
              <div>
                <label class="block text-sm font-medium text-muted-foreground mb-1">主题</label>
                <input 
                  v-model="form.subject"
                  type="text" 
                  required
                  class="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
              </div>
              
              <div>
                <label class="block text-sm font-medium text-muted-foreground mb-1">消息内容</label>
                <textarea 
                  v-model="form.message"
                  rows="5" 
                  required
                  class="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                ></textarea>
              </div>
              
              <button 
                type="submit"
                :disabled="loading"
                class="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {{ loading ? '发送中...' : '发送消息' }}
              </button>
            </form>
          </div>
          
          <!-- 联系信息 -->
          <div>
            <h2 class="text-xl font-semibold text-foreground mb-4">联系信息</h2>
            <div class="space-y-4">
              <div class="flex items-start space-x-3">
                <div class="w-5 h-5 text-primary mt-1">
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
                  </svg>
                </div>
                <div>
                  <h3 class="font-medium text-foreground">邮箱</h3>
                  <p class="text-muted-foreground">support@antifraud.com</p>
                </div>
              </div>
              
              <div class="flex items-start space-x-3">
                <div class="w-5 h-5 text-primary mt-1">
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"></path>
                  </svg>
                </div>
                <div>
                  <h3 class="font-medium text-foreground">地址</h3>
                  <p class="text-muted-foreground">北京市朝阳区科技园区</p>
                </div>
              </div>
              
              <div class="flex items-start space-x-3">
                <div class="w-5 h-5 text-primary mt-1">
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path>
                  </svg>
                </div>
                <div>
                  <h3 class="font-medium text-foreground">电话</h3>
                  <p class="text-muted-foreground">400-123-4567</p>
                </div>
              </div>
            </div>
            
            <div class="mt-8">
              <h3 class="font-medium text-foreground mb-2">工作时间</h3>
              <p class="text-muted-foreground">周一至周五：9:00 - 18:00</p>
              <p class="text-muted-foreground">周末：10:00 - 16:00</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  title: '联系我们 - 反诈骗知识平台'
})

const form = ref({
  name: '',
  email: '',
  subject: '',
  message: ''
})

const loading = ref(false)

const submitForm = async () => {
  loading.value = true
  try {
    // 这里可以添加实际的表单提交逻辑
    await new Promise(resolve => setTimeout(resolve, 1000))
    alert('消息发送成功！我们会尽快回复您。')
    
    // 重置表单
    form.value = {
      name: '',
      email: '',
      subject: '',
      message: ''
    }
  } catch (error) {
    alert('发送失败，请稍后重试。')
  } finally {
    loading.value = false
  }
}
</script>