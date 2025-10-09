import { ref } from 'vue'
import type { ExportPayload } from '~/types/graph'

export function useExport() {
  const isExporting = ref(false)
  const lastExport = ref<ExportPayload | null>(null)

  async function exportGraph(payload: ExportPayload) {
    if (isExporting.value) {
      return
    }
    isExporting.value = true
    try {
      await new Promise((resolve) => setTimeout(resolve, 800))
      lastExport.value = payload
      return {
        ...payload,
        completedAt: new Date()
      }
    } finally {
      isExporting.value = false
    }
  }

  return {
    isExporting,
    lastExport,
    exportGraph
  }
}
