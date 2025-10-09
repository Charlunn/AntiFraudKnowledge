<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto" @click="closeModal">
    <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <!-- 背景遮罩 -->
      <div class="fixed inset-0 bg-muted/400 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
      
      <!-- 模态框内容 -->
      <div 
        class="inline-block align-bottom bg-card dark:bg-card rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full"
        @click.stop
      >
        <!-- 头部 -->
        <div class="bg-card dark:bg-card px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="flex items-center justify-between">
            <h3 class="text-lg leading-6 font-medium text-foreground dark:text-foreground">
              {{ title }}
            </h3>
            <button
              @click="closeModal"
              class="bg-card dark:bg-card rounded-md text-muted-foreground hover:text-muted-foreground dark:hover:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              <span class="sr-only">关闭</span>
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <!-- 内容区域 -->
        <div class="bg-card dark:bg-card px-4 pt-0 pb-4 sm:p-6 sm:pt-0">
          <div class="max-h-96 overflow-y-auto">
            <div v-if="type === 'terms'" class="prose dark:prose-invert max-w-none">
              <TermsContent />
            </div>
            <div v-else-if="type === 'privacy'" class="prose dark:prose-invert max-w-none">
              <PrivacyContent />
            </div>
          </div>
        </div>
        
        <!-- 底部按钮 -->
        <div class="bg-muted/40 dark:bg-muted/40 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button
            @click="closeModal"
            type="button"
            class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:ml-3 sm:w-auto sm:text-sm"
          >
            我已阅读
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    required: true,
    validator: (value) => ['terms', 'privacy'].includes(value)
  }
})

const emit = defineEmits(['close'])

const title = computed(() => {
  return props.type === 'terms' ? '服务条款' : '隐私政策'
})

const closeModal = () => {
  emit('close')
}

// 阻止背景滚动
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

// 组件卸载时恢复滚动
onUnmounted(() => {
  document.body.style.overflow = ''
})
</script>

<style scoped>
.prose {
  @apply text-muted-foreground dark:text-foreground;
}

.prose h1,
.prose h2,
.prose h3,
.prose h4,
.prose h5,
.prose h6 {
  @apply text-foreground dark:text-foreground;
}

.prose a {
  @apply text-primary dark:text-primary hover:text-primary dark:hover:text-primary/80;
}
</style>