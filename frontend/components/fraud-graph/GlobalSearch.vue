<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import Input from '~/components/ui/input.vue'
import Button from '~/components/ui/button.vue'
import { Search, Command } from 'lucide-vue-next'

const props = defineProps<{
  modelValue: string
  suggestions: string[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'submit'): void
  (e: 'open-command'): void
}>()

const isFocused = ref(false)
const internalValue = ref(props.modelValue)

watch(
  () => props.modelValue,
  (value) => {
    internalValue.value = value
  }
)

watch(internalValue, (value) => {
  emit('update:modelValue', value)
})

const filteredSuggestions = computed(() => {
  if (!internalValue.value) return props.suggestions.slice(0, 5)
  return props.suggestions.filter((item) => item.includes(internalValue.value)).slice(0, 5)
})

function handleSubmit() {
  emit('submit')
  isFocused.value = false
}

function applySuggestion(value: string) {
  internalValue.value = value
  handleSubmit()
}
</script>

<template>
  <div class="relative w-full max-w-xl">
    <div
      class="group flex items-center gap-2 rounded-full border border-border bg-card/90 px-3 py-2 shadow-sm transition focus-within:ring-2 focus-within:ring-primary/60"
    >
      <Search class="size-4 text-muted-foreground" aria-hidden="true" />
      <Input
        :value="internalValue"
        class="h-9 w-full border-0 bg-transparent px-0 text-sm focus-visible:ring-0"
        :placeholder="$t('graph.appBar.searchPlaceholder')"
        aria-label="Global search"
        @focus="isFocused = true"
        @blur="isFocused = false"
        @keydown.enter.prevent="handleSubmit"
        @input="(event: Event) => (internalValue = (event.target as HTMLInputElement).value)"
      />
      <Button
        variant="ghost"
        size="sm"
        class="hidden items-center gap-1 rounded-full border border-border/60 px-2 py-1 text-xs text-muted-foreground hover:border-primary/60 hover:text-primary sm:flex"
        @click="emit('open-command')"
      >
        <Command class="size-3" aria-hidden="true" />
        <span>/</span>
      </Button>
    </div>
    <transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0 translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-1"
    >
      <div
        v-if="isFocused && filteredSuggestions.length"
        class="absolute left-0 right-0 top-full z-10 mt-2 overflow-hidden rounded-xl border border-border/80 bg-popover/90 shadow-lg backdrop-blur-md"
      >
        <ul class="divide-y divide-border/60 text-sm">
          <li
            v-for="item in filteredSuggestions"
            :key="item"
            class="flex cursor-pointer items-center justify-between px-4 py-2 hover:bg-muted/60"
            @mousedown.prevent="applySuggestion(item)"
          >
            <span>{{ item }}</span>
            <span class="text-xs text-muted-foreground">Enter</span>
          </li>
        </ul>
      </div>
    </transition>
  </div>
</template>

