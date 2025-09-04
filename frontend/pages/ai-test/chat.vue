<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-dark-bg dark:to-dark-surface">
    <div class="container mx-auto px-4 py-8">
      <!-- 页面标题 -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-dark-text mb-4">
          AI 智能问答
        </h1>
        <p class="text-lg text-gray-600 dark:text-dark-text-secondary">
          与AI助手对话，获取个性化的反欺诈知识解答
        </p>
      </div>

      <!-- 聊天界面 -->
      <div class="max-w-4xl mx-auto">
        <div class="bg-white dark:bg-dark-surface rounded-xl shadow-lg overflow-hidden">
          <!-- 聊天消息区域 -->
          <div class="h-96 overflow-y-auto p-6 space-y-4" ref="chatContainer">
            <div v-for="message in messages" :key="message.id" class="flex" :class="message.sender === 'user' ? 'justify-end' : 'justify-start'">
              <div class="max-w-xs lg:max-w-md px-4 py-2 rounded-lg" :class="message.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-dark-bg text-gray-900 dark:text-dark-text'">
                {{ message.content }}
              </div>
            </div>
            <div v-if="isTyping" class="flex justify-start">
              <div class="bg-gray-200 dark:bg-dark-bg px-4 py-2 rounded-lg">
                <div class="flex space-x-1">
                  <div class="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                  <div class="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
                  <div class="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- 输入区域 -->
          <div class="border-t border-gray-200 dark:border-dark-border p-4">
            <div class="flex space-x-4">
              <input
                v-model="currentMessage"
                @keyup.enter="sendMessage"
                type="text"
                placeholder="输入您的问题..."
                class="flex-1 px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-dark-bg dark:text-dark-text"
                :disabled="isTyping"
              >
              <button
                @click="sendMessage"
                :disabled="!currentMessage.trim() || isTyping"
                class="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                发送
              </button>
            </div>
          </div>
        </div>

        <!-- 快捷问题 -->
        <div class="mt-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-dark-text mb-4">常见问题</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              v-for="question in quickQuestions"
              :key="question"
              @click="askQuickQuestion(question)"
              class="p-3 text-left bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg hover:bg-gray-50 dark:hover:bg-dark-bg transition-colors duration-200"
            >
              {{ question }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted } from 'vue'

// 页面元数据
useHead({
  title: 'AI智能问答 - 反欺诈知识平台'
})

// 响应式数据
const messages = ref([])
const currentMessage = ref('')
const isTyping = ref(false)
const chatContainer = ref(null)

// 快捷问题
const quickQuestions = [
  '如何识别电信诈骗？',
  '网络购物如何防骗？',
  '什么是杀猪盘诈骗？',
  '如何保护个人信息？',
  '遇到诈骗应该怎么办？',
  '如何识别虚假投资平台？'
]

// 发送消息
const sendMessage = async () => {
  if (!currentMessage.value.trim()) return

  const userMessage = {
    id: Date.now(),
    sender: 'user',
    content: currentMessage.value,
    timestamp: new Date()
  }

  messages.value.push(userMessage)
  const question = currentMessage.value
  currentMessage.value = ''

  // 滚动到底部
  await nextTick()
  scrollToBottom()

  // 显示AI正在输入
  isTyping.value = true

  // 模拟AI回复
  setTimeout(() => {
    const aiResponse = generateAIResponse(question)
    const aiMessage = {
      id: Date.now() + 1,
      sender: 'ai',
      content: aiResponse,
      timestamp: new Date()
    }

    messages.value.push(aiMessage)
    isTyping.value = false

    nextTick(() => {
      scrollToBottom()
    })
  }, 1500)
}

// 快捷问题
const askQuickQuestion = (question) => {
  currentMessage.value = question
  sendMessage()
}

// 生成AI回复（模拟）
const generateAIResponse = (question) => {
  const responses = {
    '如何识别电信诈骗？': '电信诈骗通常有以下特征：1. 冒充公检法机关；2. 要求转账到"安全账户"；3. 声称涉嫌洗钱等犯罪；4. 要求保密不能告诉他人。遇到此类电话应立即挂断并报警。',
    '网络购物如何防骗？': '网络购物防骗要点：1. 选择正规电商平台；2. 注意商品价格是否异常低廉；3. 查看商家信誉和评价；4. 使用平台担保交易；5. 不要私下转账。',
    '什么是杀猪盘诈骗？': '杀猪盘是一种网络投资诈骗，骗子通过社交软件建立恋爱关系，然后诱导受害者在虚假投资平台投资，最终卷款跑路。特点是周期长、金额大、情感欺骗。',
    '如何保护个人信息？': '保护个人信息的方法：1. 不随意透露身份证、银行卡等信息；2. 谨慎使用公共WiFi；3. 定期更换密码；4. 注意APP权限设置；5. 不点击可疑链接。',
    '遇到诈骗应该怎么办？': '遇到诈骗应该：1. 立即停止转账等操作；2. 保存相关证据；3. 及时报警（110）；4. 联系银行冻结账户；5. 到反诈中心举报。',
    '如何识别虚假投资平台？': '识别虚假投资平台：1. 查看是否有正规金融牌照；2. 承诺高收益低风险要警惕；3. 无法正常提现；4. 客服联系方式单一；5. 平台信息不透明。'
  }

  // 检查是否有预设回复
  for (const [key, value] of Object.entries(responses)) {
    if (question.includes(key.slice(0, 4))) {
      return value
    }
  }

  // 默认回复
  return '感谢您的提问！这是一个很好的反欺诈相关问题。建议您：1. 提高警惕，不轻信陌生人；2. 保护个人信息安全；3. 遇到可疑情况及时报警。如需更详细的信息，请咨询相关专业机构。'
}

// 滚动到底部
const scrollToBottom = () => {
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
}

// 初始化
onMounted(() => {
  // 添加欢迎消息
  messages.value.push({
    id: 1,
    sender: 'ai',
    content: '您好！我是反欺诈AI助手，可以为您解答各种防诈骗相关问题。请随时向我提问！',
    timestamp: new Date()
  })
})
</script>

<style scoped>
/* 自定义滚动条 */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #a1a1a1;
}
</style>