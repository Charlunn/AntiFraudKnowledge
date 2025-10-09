import { computed, ref } from 'vue'
import type { TimelineConfig } from '~/types/graph'

export function useTimeline(initial?: TimelineConfig) {
  const timeline = ref<TimelineConfig>(
    initial ?? {
      enabled: false,
      range: [new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(), new Date().toISOString()]
    }
  )
  const isPlaying = ref(false)

  function toggle(enabled?: boolean) {
    timeline.value.enabled = enabled ?? !timeline.value.enabled
  }

  function setRange(range: TimelineConfig['range']) {
    timeline.value.range = range
  }

  function play() {
    isPlaying.value = true
  }

  function pause() {
    isPlaying.value = false
  }

  const humanReadable = computed(() => {
    const [start, end] = timeline.value.range.map((value) => new Date(value))
    return `${start.toLocaleDateString()} ~ ${end.toLocaleDateString()}`
  })

  return {
    timeline,
    isPlaying,
    toggle,
    setRange,
    play,
    pause,
    humanReadable
  }
}
