<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import Card from '~/components/ui/card.vue'
import CardHeader from '~/components/ui/card-header.vue'
import CardTitle from '~/components/ui/card-title.vue'
import CardContent from '~/components/ui/card-content.vue'
import Button from '~/components/ui/button.vue'
import Badge from '~/components/ui/badge.vue'
import DropdownMenu from '~/components/ui/dropdown-menu/DropdownMenu.vue'
import DropdownMenuTrigger from '~/components/ui/dropdown-menu/DropdownMenuTrigger.vue'
import DropdownMenuContent from '~/components/ui/dropdown-menu/DropdownMenuContent.vue'
import DropdownMenuItem from '~/components/ui/dropdown-menu/DropdownMenuItem.vue'
import Tooltip from '~/components/ui/Tooltip.vue'
import NodeMiniCard from './NodeMiniCard.vue'
import type { AIExplainSection, EvidenceItem, GraphEdgeElement, GraphNodeElement } from '~/types/graph'
import { useUIStore } from '~/stores/useUIStore'
import { BookOpen, ExternalLink, Share2, Volume2 } from 'lucide-vue-next'

const props = defineProps<{
  selected: GraphNodeElement | GraphEdgeElement | null
  aiSummary: AIExplainSection[]
  evidenceList: EvidenceItem[]
  redactionMessage: string
  embedded?: boolean
}>()

const emit = defineEmits<{
  (e: 'save'): void
  (e: 'share', format: 'h5' | 'png'): void
  (e: 'help'): void
  (e: 'read'): void
}>()

const uiStore = useUIStore()
const { rightPanelTab } = storeToRefs(uiStore)
const { tm } = useI18n()
const emptySteps = computed(() => (tm('graph.graphStage.empty.steps') as string[]) || [])
const panelClass = computed(() =>
  props.embedded
    ? 'flex h-full flex-col gap-4 rounded-2xl border border-border/40 bg-background/80 p-3 shadow-sm'
    : 'flex h-full flex-col gap-4 rounded-3xl border border-border/60 bg-card/80 p-4 shadow-md backdrop-blur'
)

const isNode = computed(() => props.selected && 'data' in props.selected && 'badges' in props.selected.data)

const badgeMap: Record<string, string> = {
  official: 'graph.badges.official',
  media: 'graph.badges.media',
  report: 'graph.badges.report',
  'multi-source': 'graph.badges.multiSource',
  'model-infer': 'graph.badges.modelInfer',
  multiSource: 'graph.badges.multiSource',
  modelInfer: 'graph.badges.modelInfer'
}

const shareOptions = [
  { id: 'h5', label: 'graph.share.h5' },
  { id: 'png', label: 'graph.share.png' }
]
</script>

<template>
  <aside :class="panelClass">
    <div class="sticky top-4 z-10 flex items-center justify-between rounded-2xl border border-border/60 bg-background/70 px-3 py-2">
      <div class="flex items-center gap-2">
        <BookOpen class="size-4 text-primary" aria-hidden="true" />
        <span class="text-sm font-semibold">{{ $t('graph.rightPanel.title') }}</span>
      </div>
      <div class="flex items-center gap-2">
        <Button size="sm" variant="ghost" class="rounded-full px-3" @click="emit('save')">
          {{ $t('graph.rightPanel.actions.save') }}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button size="sm" variant="ghost" class="rounded-full px-3">
              <Share2 class="mr-1 size-4" aria-hidden="true" />
              {{ $t('graph.rightPanel.actions.share') }}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              v-for="option in shareOptions"
              :key="option.id"
              @select="emit('share', option.id as 'h5' | 'png')"
            >
              {{ $t(option.label) }}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Tooltip :content="$t('graph.appBar.help')">
          <Button size="sm" variant="ghost" class="rounded-full px-3" @click="emit('help')">
            <ExternalLink class="size-4" aria-hidden="true" />
          </Button>
        </Tooltip>
      </div>
    </div>

    <div class="flex items-center justify-between text-xs text-muted-foreground">
      <span>{{ $t(props.redactionMessage) }}</span>
      <Badge variant="outline" class="rounded-full border-border/60">{{ $t('graph.rightPanel.redaction') }}</Badge>
    </div>

    <div class="flex rounded-full bg-muted/40 p-1 text-xs font-medium">
      <button
        v-for="tab in ['overview', 'aiExplain', 'evidence']"
        :key="tab"
        type="button"
        class="flex-1 rounded-full px-3 py-1 transition"
        :class="tab === rightPanelTab ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'"
        @click="uiStore.setRightPanelTab(tab as 'overview' | 'aiExplain' | 'evidence')"
      >
        {{ $t(`graph.rightPanel.tabs.${tab}`) }}
      </button>
    </div>

    <Card v-if="!selected" class="flex-1 rounded-2xl border-dashed border-border/60 bg-background/60 p-6 text-center">
      <p class="text-sm font-medium text-muted-foreground">{{ $t('graph.rightPanel.empty') }}</p>
      <ol class="mt-3 list-decimal space-y-1 text-left text-xs text-muted-foreground/80">
        <li v-for="step in emptySteps" :key="step">
          {{ step }}
        </li>
      </ol>
    </Card>

    <template v-else>
      <Card v-if="rightPanelTab === 'overview'" class="flex-1 space-y-3 rounded-2xl border-border/60 bg-background/80 p-4">
        <header class="flex items-center justify-between">
          <h3 class="text-base font-semibold text-foreground">{{ $t('graph.rightPanel.tabs.overview') }}</h3>
          <Button size="sm" variant="ghost" class="rounded-full px-3 text-xs" @click="emit('read')">
            <Volume2 class="mr-1 size-4" aria-hidden="true" />
            {{ $t('graph.appBar.readAloud') }}
          </Button>
        </header>
        <NodeMiniCard
          v-if="isNode"
          :title="(selected as GraphNodeElement).data.label"
          :type="(selected as GraphNodeElement).data.type"
          :badges="(selected as GraphNodeElement).data.badges.map((badge) => $t(badgeMap[badge] ?? badge))"
          :updated-at="(selected as GraphNodeElement).data.updatedAt"
          :risk-level="(selected as GraphNodeElement).data.riskLevel"
          :source-label="$t(`graph.sources.${(selected as GraphNodeElement).data.source}`)"
        />
        <div v-else class="rounded-2xl border border-border/60 bg-card/70 p-4 text-sm text-muted-foreground">
          <p class="text-sm font-semibold text-foreground">
            {{ (selected as GraphEdgeElement).data.label }}
          </p>
          <p class="mt-2 leading-relaxed">
            {{ (selected as GraphEdgeElement).data.type }} · {{ (selected as GraphEdgeElement).data.weight ?? '--' }}
          </p>
          <p class="mt-2 text-xs text-muted-foreground">
            {{ $t('graph.bottomBar.updatedAt') }}:
            {{ new Date((selected as GraphEdgeElement).data.updatedAt).toLocaleString() }}
          </p>
        </div>
      </Card>

      <Card
        v-else-if="rightPanelTab === 'aiExplain'"
        class="flex-1 space-y-4 overflow-y-auto rounded-2xl border-border/60 bg-background/80 p-4"
      >
        <article
          v-for="section in aiSummary"
          :key="section.id"
          class="rounded-xl border border-border/60 bg-card/70 p-4"
        >
          <h3 class="text-sm font-semibold text-foreground">
            {{ $t(section.title) }}
          </h3>
          <ul class="mt-2 list-disc space-y-1 pl-5 text-xs leading-relaxed text-muted-foreground">
            <li v-for="bullet in section.bullets" :key="bullet">{{ $t(bullet) }}</li>
          </ul>
        </article>
      </Card>

      <Card
        v-else
        class="flex-1 space-y-3 overflow-y-auto rounded-2xl border-border/60 bg-background/80 p-4"
      >
        <article
          v-for="item in evidenceList"
          :key="item.id"
          class="rounded-xl border border-border/60 bg-card/70 p-4 text-sm"
        >
          <header class="flex items-center justify-between text-xs text-muted-foreground">
            <span>{{ item.source }}</span>
            <time :datetime="item.timestamp">{{ new Date(item.timestamp).toLocaleString() }}</time>
          </header>
          <h3 class="mt-2 text-sm font-semibold text-foreground">{{ $t(item.title) }}</h3>
          <p class="mt-1 text-xs leading-relaxed text-muted-foreground">{{ $t(item.description) }}</p>
          <Button
            v-if="item.url"
            size="sm"
            variant="ghost"
            class="mt-2 rounded-full px-3 text-xs text-primary"
            @click="emit('help')"
          >
            <ExternalLink class="mr-1 size-4" aria-hidden="true" />
            {{ item.url }}
          </Button>
        </article>
      </Card>
    </template>
  </aside>
</template>
