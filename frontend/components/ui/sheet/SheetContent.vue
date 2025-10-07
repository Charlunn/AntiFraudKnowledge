<script setup lang="ts">
import {
  DialogClose,
  DialogContent,
  DialogOverlay,
  DialogPortal,
  type DialogContentEmits,
  type DialogContentProps
} from 'radix-vue'
import { cn } from '~/lib/utils'

const props = withDefaults(defineProps<DialogContentProps & { class?: string; side?: 'top' | 'bottom' | 'left' | 'right' }>(), {
  side: 'right'
})

const emits = defineEmits<DialogContentEmits>()

const sideClasses: Record<'top' | 'bottom' | 'left' | 'right', string> = {
  top: 'inset-x-0 top-0 border-b rounded-b-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:slide-in-from-top data-[state=closed]:slide-out-to-top',
  bottom: 'inset-x-0 bottom-0 border-t rounded-t-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom',
  left: 'inset-y-0 left-0 h-full w-80 border-r rounded-r-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-left',
  right: 'inset-y-0 right-0 h-full w-80 border-l rounded-l-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right'
}
</script>

<template>
  <DialogPortal>
    <DialogOverlay class="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
    <DialogContent
      v-bind="props"
      v-on="emits"
      :class="cn('fixed z-50 grid gap-4 bg-background p-6 shadow-lg transition ease-in-out', sideClasses[props.side], props.class)"
    >
      <slot />
      <DialogClose class="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
        <span class="sr-only">Close</span>
        ✕
      </DialogClose>
    </DialogContent>
  </DialogPortal>
</template>
