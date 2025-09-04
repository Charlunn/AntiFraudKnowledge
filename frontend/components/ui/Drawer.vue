<template>
  <Teleport to="body">
    <Transition name="drawer-overlay">
      <div
        v-if="modelValue"
        class="drawer-overlay fixed inset-0 z-50"
        @click="handleOverlayClick"
      >
        <Transition name="drawer" :appear="true">
          <div
            v-if="modelValue"
            class="drawer-content fixed bg-white shadow-xl overflow-hidden"
            :class="[positionClass, sizeClass]"
            @click.stop
          >
            <!-- 头部 -->
            <div v-if="$slots.header || title" class="drawer-header px-6 py-4 border-b border-gray-200 flex items-center justify-between">
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

            <!-- 内容 -->
            <div class="drawer-body flex-1 overflow-y-auto px-6 py-4">
              <slot></slot>
            </div>

            <!-- 底部 -->
            <div v-if="$slots.footer" class="drawer-footer px-6 py-4 border-t border-gray-200 bg-gray-50">
              <slot name="footer"></slot>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { XMarkIcon } from '@heroicons/vue/24/outline'

interface Props {
  modelValue: boolean
  title?: string
  position?: 'left' | 'right' | 'top' | 'bottom'
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
  position: 'right',
  size: 'md',
  closable: true,
  closeOnOverlay: true,
  persistent: false
})

const emit = defineEmits<Emits>()

// 计算位置类
const positionClass = computed(() => {
  const positionMap = {
    left: 'top-0 left-0 h-full flex flex-col',
    right: 'top-0 right-0 h-full flex flex-col',
    top: 'top-0 left-0 w-full flex flex-col',
    bottom: 'bottom-0 left-0 w-full flex flex-col'
  }
  return positionMap[props.position]
})

// 计算尺寸类
const sizeClass = computed(() => {
  const isHorizontal = props.position === 'left' || props.position === 'right'
  
  if (isHorizontal) {
    const sizeMap = {
      sm: 'w-80',
      md: 'w-96',
      lg: 'w-[32rem]',
      xl: 'w-[40rem]',
      full: 'w-full'
    }
    return sizeMap[props.size]
  } else {
    const sizeMap = {
      sm: 'h-80',
      md: 'h-96',
      lg: 'h-[32rem]',
      xl: 'h-[40rem]',
      full: 'h-full'
    }
    return sizeMap[props.size]
  }
})

// 关闭抽屉
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

// 监听抽屉状态变化
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
.drawer-overlay {
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.drawer-overlay-enter-active,
.drawer-overlay-leave-active {
  transition: all 0.3s ease;
}

.drawer-overlay-enter-from,
.drawer-overlay-leave-to {
  opacity: 0;
}

/* 左侧抽屉动画 */
.drawer-enter-active,
.drawer-leave-active {
  transition: transform 0.3s ease;
}

.drawer-content.top-0.left-0.h-full .drawer-enter-from,
.drawer-content.top-0.left-0.h-full .drawer-leave-to {
  transform: translateX(-100%);
}

/* 右侧抽屉动画 */
.drawer-content.top-0.right-0.h-full .drawer-enter-from,
.drawer-content.top-0.right-0.h-full .drawer-leave-to {
  transform: translateX(100%);
}

/* 顶部抽屉动画 */
.drawer-content.top-0.left-0.w-full .drawer-enter-from,
.drawer-content.top-0.left-0.w-full .drawer-leave-to {
  transform: translateY(-100%);
}

/* 底部抽屉动画 */
.drawer-content.bottom-0.left-0.w-full .drawer-enter-from,
.drawer-content.bottom-0.left-0.w-full .drawer-leave-to {
  transform: translateY(100%);
}
</style>