<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="modelValue"
        class="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4"
        @click="handleOverlayClick"
      >
        <div
          class="modal-content bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden"
          :class="sizeClass"
          @click.stop
        >
          <!-- 头部 -->
          <div v-if="$slots.header || title" class="modal-header px-6 py-4 border-b border-gray-200">
            <div class="flex items-center justify-between">
              <slot name="header">
                <h3 class="text-lg font-semibold text-gray-900">
                  {{ title }}
                </h3>
              </slot>
              <button
                v-if="closable"
                @click="close"
                class="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100"
              >
                <XMarkIcon class="w-5 h-5" />
              </button>
            </div>
          </div>

          <!-- 内容 -->
          <div class="modal-body px-6 py-4 overflow-y-auto">
            <slot></slot>
          </div>

          <!-- 底部 -->
          <div v-if="$slots.footer" class="modal-footer px-6 py-4 border-t border-gray-200 bg-gray-50">
            <slot name="footer"></slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { XMarkIcon } from '@heroicons/vue/24/outline'

interface Props {
  modelValue: boolean
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  closable?: boolean
  closeOnOverlay?: boolean
  persistent?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'close'): void
  (e: 'open'): void
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  closable: true,
  closeOnOverlay: true,
  persistent: false
})

const emit = defineEmits<Emits>()

// 计算尺寸类
const sizeClass = computed(() => {
  const sizeMap = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full mx-4'
  }
  return sizeMap[props.size]
})

// 关闭模态框
const close = () => {
  if (!props.persistent) {
    emit('update:modelValue', false)
    emit('close')
  }
}

// 处理遮罩层点击
const handleOverlayClick = () => {
  if (props.closeOnOverlay) {
    close()
  }
}

// 监听键盘事件
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.closable) {
    close()
  }
}

// 监听模态框状态变化
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    emit('open')
    document.addEventListener('keydown', handleKeydown)
    document.body.style.overflow = 'hidden'
  } else {
    document.removeEventListener('keydown', handleKeydown)
    document.body.style.overflow = ''
  }
})

// 组件卸载时清理
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
})
</script>

<style scoped>
.modal-overlay {
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: scale(0.9) translateY(-20px);
}

.modal-content {
  transition: transform 0.3s ease;
}
</style>