import { ref } from 'vue'
import type { ShareOption } from '~/types/graph'

export function useShare() {
  const isSharing = ref(false)
  const lastShared = ref<Date | null>(null)

  const options: ShareOption[] = [
    { id: 'h5', label: 'H5 页面', description: '生成可转发的小程序样式链接' },
    { id: 'png', label: 'PNG 图片', description: '导出关键节点关系图快照' }
  ]

  async function share(option: ShareOption['id']) {
    if (isSharing.value) {
      return
    }
    isSharing.value = true
    try {
      await new Promise((resolve) => setTimeout(resolve, 600))
      lastShared.value = new Date()
      return { option, timestamp: lastShared.value }
    } finally {
      isSharing.value = false
    }
  }

  return {
    isSharing,
    lastShared,
    options,
    share
  }
}
