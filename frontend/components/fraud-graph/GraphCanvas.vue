<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  shallowRef,
  watch,
} from "vue";
import type {
  EChartsOption,
  GraphNodeItemOption,
  GraphEdgeItemOption,
  SeriesGraph,
} from "echarts";
import { use } from "echarts/core";
import { GraphChart } from "echarts/charts";
import {
  TooltipComponent,
  LegendComponent,
  GridComponent,
  ToolboxComponent,
  DataZoomComponent,
  BrushComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import VChart from "vue-echarts";
import Button from "~/components/ui/button.vue";
import type { GraphElement, LayoutType, TimelineConfig } from "~/types/graph";

use([
  GraphChart,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  ToolboxComponent,
  DataZoomComponent,
  BrushComponent,
  CanvasRenderer,
]);

const props = withDefaults(
  defineProps<{
    elements: GraphElement[];
    layout: LayoutType;
    selectedId?: string | null;
    loading?: boolean;
    error?: string | null;
    timeline?: TimelineConfig;
  }>(),
  {
    selectedId: null,
    loading: false,
    error: null,
    timeline: () => ({
      enabled: false,
      range: [
        new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
        new Date().toISOString(),
      ],
    }),
  },
);

const emit = defineEmits<{
  (e: "select", id: string | null): void;
  (e: "expand", nodeId: string): void;
  (e: "subgraph", nodeId: string): void;
  (e: "retry"): void;
  (e: "focus-node", nodeId: string): void;
}>();

type EChartsInstance = ReturnType<
  InstanceType<typeof VChart>["getEchartsInstance"]
>;

const chartRef = ref<InstanceType<typeof VChart> | null>(null);
const chartInstance = shallowRef<EChartsInstance | null>(null);
const chartOption = ref<EChartsOption>({ series: [] });
const pendingOption = shallowRef<EChartsOption | null>(null);
const boxSelectEnabled = ref(false);
const shouldAutoFit = ref(true);
const containerRef = ref<HTMLElement | null>(null);
const containerWidth = ref(0);
const containerHeight = ref(0);
const hasRenderableArea = ref(false);
let resizeObserver: ResizeObserver | null = null;
let isFlushingPending = false;
const MIN_CANVAS_HEIGHT = 320;
const canvasHeight = computed(() =>
  Math.max(containerHeight.value, MIN_CANVAS_HEIGHT),
);
const canvasStyle = computed(() => ({
  width: containerWidth.value > 0 ? `${containerWidth.value}px` : "100%",
  height: `${canvasHeight.value}px`,
  minHeight: `${MIN_CANVAS_HEIGHT}px`,
}));

const riskColorMap: Record<string, string> = {
  high: "#ef4444",
  medium: "#f59e0b",
  low: "#22c55e",
};
const SERIES_ID = "fraud-graph";

function evaluateContainerSize(entry?: ResizeObserverEntry): boolean {
  if (entry) {
    const width = Math.max(0, entry.contentRect.width);
    const height = Math.max(0, entry.contentRect.height);
    containerWidth.value = width;
    containerHeight.value = height;
    const ready = width > 0 && height > 0;
    hasRenderableArea.value = ready;
    return ready;
  }
  const element = containerRef.value;
  if (!element) {
    containerWidth.value = 0;
    containerHeight.value = 0;
    hasRenderableArea.value = false;
    return false;
  }
  const rect = element.getBoundingClientRect();
  const width = Math.max(0, rect.width ?? 0);
  const height = Math.max(0, rect.height ?? 0);
  containerWidth.value = width;
  containerHeight.value = height;
  const ready = width > 0 && height > 0;
  hasRenderableArea.value = ready;
  return ready;
}

function computeTimelineOpacity(updatedAt: string | undefined): number {
  if (!props.timeline?.enabled) return 1;
  const [startIso, endIso] = props.timeline.range;
  const start = Date.parse(startIso);
  const end = Date.parse(endIso);
  const value = updatedAt ? Date.parse(updatedAt) : NaN;
  if (Number.isNaN(start) || Number.isNaN(end) || Number.isNaN(value)) {
    return 0.45;
  }
  return value >= start && value <= end ? 1 : 0.18;
}

function buildOption(): EChartsOption {
  const nodeElements = props.elements.filter((item) => item.group === "nodes");
  const edgeElements = props.elements.filter((item) => item.group === "edges");

  const degreeMap: Record<string, number> = {};
  edgeElements.forEach((element) => {
    const data = element.data;
    const source = data.source;
    const target = data.target;
    if (typeof source === "string") {
      degreeMap[source] = (degreeMap[source] ?? 0) + 1;
    }
    if (typeof target === "string") {
      degreeMap[target] = (degreeMap[target] ?? 0) + 1;
    }
  });

  const nodes: GraphNodeItemOption[] = [];
  const edges: GraphEdgeItemOption[] = [];
  nodeElements.forEach((element) => {
    const data = element.data;
    const risk = typeof data.riskLevel === "string" ? data.riskLevel : "medium";
    const isSelected = props.selectedId === data.id;
    const opacity = computeTimelineOpacity(data.updatedAt);
    const degree = degreeMap[data.id] ?? 0;
    const baseSize =
      typeof data.size === "number" && Number.isFinite(data.size)
        ? data.size
        : 26;
    const weightedSize =
      baseSize + Math.min(degree, 12) * 4 + (degree > 0 ? 6 : 0);
    const size = Math.max(22, Math.min(weightedSize, 96));

    nodes.push({
      id: data.id,
      name: data.label,
      category: data.type ?? "unknown",
      value: data,
      symbolSize: size,
      draggable: true,
      itemStyle: {
        color: riskColorMap[risk] ?? "#2563eb",
        opacity,
        borderColor: isSelected ? "#22d3ee" : "#bfdbfe",
        borderWidth: isSelected ? 3 : 1,
        shadowBlur: isSelected ? 12 : 4,
        shadowColor: isSelected
          ? "rgba(34,211,238,0.35)"
          : "rgba(15,23,42,0.12)",
      },
      label: {
        show: true,
        formatter: data.label,
        color: "#0f172a",
        position: "inside",
        fontSize: 12,
      },
    });
  });

  edgeElements.forEach((element) => {
    const data = element.data;
    const isSelected = props.selectedId === data.id;
    const opacity = computeTimelineOpacity(data.updatedAt);
    edges.push({
      id: data.id,
      source: data.source,
      target: data.target,
      value: data.label,
      lineStyle: {
        width: isSelected ? 3 : 1.4,
        color: isSelected ? "#22d3ee" : "#cbd5f5",
        opacity,
      },
      emphasis: {
        lineStyle: {
          width: 3,
          color: "#38bdf8",
        },
      },
      label: {
        show: Boolean(data.label),
        formatter: data.label,
        color: "#475569",
        fontSize: 11,
      },
    });
  });

  const categories = Array.from(
    new Set(
      nodes
        .map((node) => node.category)
        .filter((value): value is string => Boolean(value)),
    ),
  ).map((name) => ({ name }));

  const baseForce: SeriesGraph["force"] = {
    repulsion: 3200,
    edgeLength: [80, 160],
    gravity: 0.06,
  };

  const forceByLayout: Record<LayoutType, SeriesGraph["force"]> = {
    force: {
      repulsion: 3800,
      gravity: 0.05,
      edgeLength: [100, 200],
      friction: 0.2,
    },
    hierarchy: {
      repulsion: 4200,
      gravity: 0.18,
      edgeLength: [90, 180],
      friction: 0.12,
    },
    timeline: {
      repulsion: 3600,
      gravity: 0.04,
      edgeLength: [80, 200],
      friction: 0.25,
    },
  };

  const option: EChartsOption = {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "item",
      formatter: (params) => {
        if (params.dataType === "edge") {
          return `<div class="text-xs">
            <div><strong>${params.data?.label ?? ""}</strong></div>
            <div>${params.data?.source ?? ""} → ${params.data?.target ?? ""}</div>
          </div>`;
        }
        const value = params.data?.value ?? {};
        const risk = value.riskLevel ?? "unknown";
        const source = value.source ? `<div>来源：${value.source}</div>` : "";
        return `<div class="text-xs">
          <div><strong>${params.name}</strong></div>
          <div>风险：${risk}</div>
          ${source}
        </div>`;
      },
    },
    legend: categories.length
      ? {
          data: categories.map((item) => item.name),
          orient: "horizontal",
          bottom: 8,
          textStyle: {
            color: "#475569",
            fontSize: 11,
          },
        }
      : undefined,
    toolbox: {
      show: false,
      feature: {
        restore: {},
      },
    },
    series: [
      {
        id: SERIES_ID,
        type: "graph",
        layout: "force",
        data: nodes,
        links: edges,
        categories,
        roam: true,
        focusNodeAdjacency: true,
        force: forceByLayout[props.layout] ?? baseForce,
        label: { position: "inside", color: "#0f172a" },
        edgeLabel: { show: false },
        lineStyle: {
          color: "#cbd5f5",
          width: 1.4,
          curveness: 0.1,
        },
        emphasis: {
          focus: "adjacency",
          lineStyle: { width: 3 },
        },
        draggable: true,
        animation: true,
        animationDuration: 600,
        animationEasing: "cubicOut",
      },
    ],
  };

  return option;
}

function resolveChartInstance(): EChartsInstance | null {
  if (!chartRef.value) return null;
  if (typeof chartRef.value.getEchartsInstance === "function") {
    return chartRef.value.getEchartsInstance();
  }
  // @ts-expect-error vue-echarts legacy API fallback
  return chartRef.value.chart ?? null;
}

async function waitForRenderableArea(
  instance: EChartsInstance,
  retries = 60,
  delay = 80,
) {
  for (let attempt = 0; attempt < retries; attempt += 1) {
    if (evaluateContainerSize()) {
      return true;
    }
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
  const dom = instance.getDom?.();
  if (!dom) {
    return false;
  }
  const ready = (dom.clientWidth ?? 0) > 0 && (dom.clientHeight ?? 0) > 0;
  hasRenderableArea.value = ready;
  return ready;
}

async function applyOption(option: EChartsOption, instance: EChartsInstance) {
  const ready =
    hasRenderableArea.value || (await waitForRenderableArea(instance));
  if (!ready) {
    return false;
  }
  instance.setOption(option, true);
  instance.resize();
  return true;
}

async function fitGraphToViewport(instance: EChartsInstance) {
  await nextTick();
  const model = instance.getModel?.();
  const seriesModel =
    typeof model?.getSeriesByIndex === "function"
      ? (model.getSeriesByIndex(0) as any)
      : undefined;
  const graph = seriesModel?.getGraph?.();
  if (!graph) {
    return;
  }

  let minX = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;

  graph.eachNode((node) => {
    const layout = typeof node.getLayout === "function" ? node.getLayout() : null;
    if (!layout || layout.length < 2) return;
    const [x, y] = layout as [number, number];
    if (!Number.isFinite(x) || !Number.isFinite(y)) return;
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
  });

  if (
    !Number.isFinite(minX) ||
    !Number.isFinite(maxX) ||
    !Number.isFinite(minY) ||
    !Number.isFinite(maxY)
  ) {
    return;
  }

  const width = containerWidth.value || instance.getWidth?.() || 0;
  const height = containerHeight.value || instance.getHeight?.() || 0;
  if (width <= 0 || height <= 0) {
    return;
  }

  const padding = Math.min(Math.min(width, height) * 0.2, 120);
  const effectiveWidth = Math.max(width - padding, width * 0.6);
  const effectiveHeight = Math.max(height - padding, height * 0.6);
  const graphWidth = Math.max(maxX - minX, 1);
  const graphHeight = Math.max(maxY - minY, 1);
  const scaleX = effectiveWidth / graphWidth;
  const scaleY = effectiveHeight / graphHeight;
  const minZoom = 0.25;
  const maxZoom = 2.5;
  const desiredZoom = Math.min(Math.max(Math.min(scaleX, scaleY), minZoom), maxZoom);

  const option = instance.getOption?.();
  const seriesOption = Array.isArray(option?.series) ? option?.series?.[0] ?? {} : {};
  const currentZoom =
    typeof seriesOption?.zoom === "number" && Number.isFinite(seriesOption.zoom)
      ? Math.max(seriesOption.zoom, minZoom)
      : 1;
  const zoomDelta = desiredZoom / currentZoom;

  if (Number.isFinite(zoomDelta) && zoomDelta > 0) {
    instance.dispatchAction({
      type: "graphRoam",
      seriesIndex: 0,
      zoom: zoomDelta,
    });
  }

  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  const dx = width / 2 - centerX * desiredZoom;
  const dy = height / 2 - centerY * desiredZoom;

  instance.dispatchAction({
    type: "graphRoam",
    seriesIndex: 0,
    dx,
    dy,
  });
}

async function updateOption() {
  const option = buildOption();
  chartOption.value = option;
  pendingOption.value = option;
  await nextTick();
  const instance = chartInstance.value ?? resolveChartInstance();
  if (!instance) return;
  chartInstance.value = instance;
  attachEvents();
  if (boxSelectEnabled.value) {
    enableBrush(true);
  }
  const applied = await applyOption(option, instance);
  if (applied) {
    if (shouldAutoFit.value) {
      await fitGraphToViewport(instance);
      shouldAutoFit.value = false;
    }
    pendingOption.value = null;
  }
}

function handleClick(params: any) {
  if (!params) return;
  if (params.dataType === "node") {
    const nodeId = params.data?.id as string | undefined;
    if (!nodeId) return;
    if (params.event?.event?.shiftKey) {
      emit("subgraph", nodeId);
    } else {
      emit("select", nodeId);
    }
  } else if (params.dataType === "edge") {
    const edgeId = params.data?.id as string | undefined;
    if (!edgeId) return;
    emit("select", edgeId);
  } else {
    emit("select", null);
  }
}

function handleDoubleClick(params: any) {
  if (params.dataType === "node") {
    const nodeId = params.data?.id as string | undefined;
    if (nodeId) {
      emit("focus-node", nodeId);
    }
  }
}

function handleContextMenu(params: any) {
  if (params.dataType === "node") {
    params.event?.event?.preventDefault?.();
    const nodeId = params.data?.id as string | undefined;
    if (nodeId) {
      emit("expand", nodeId);
    }
  }
}

function handleRoam() {
  shouldAutoFit.value = false;
}

function attachEvents() {
  if (!chartInstance.value) return;
  chartInstance.value.on("click", handleClick);
  chartInstance.value.on("dblclick", handleDoubleClick);
  chartInstance.value.on("contextmenu", handleContextMenu);
  chartInstance.value.on("graphRoam", handleRoam);
}

function detachEvents() {
  if (!chartInstance.value) return;
  chartInstance.value.off("click", handleClick);
  chartInstance.value.off("dblclick", handleDoubleClick);
  chartInstance.value.off("contextmenu", handleContextMenu);
  chartInstance.value.off("graphRoam", handleRoam);
}

function enableBrush(enabled: boolean) {
  if (!chartInstance.value) return;
  chartInstance.value.dispatchAction({
    type: "takeGlobalCursor",
    key: "brush",
    brushOption: enabled
      ? {
          brushType: "rect",
          brushMode: "multiple",
          throttleType: "debounce",
          throttleDelay: 100,
        }
      : {
          brushType: false,
        },
  });
  if (!enabled) {
    chartInstance.value.dispatchAction({ type: "brush", areas: [] });
  }
}

function ensureChartInstance(): EChartsInstance | null {
  const existing = chartInstance.value;
  const instance = existing ?? resolveChartInstance();
  if (!instance) return null;
  if (chartInstance.value !== instance) {
    detachEvents();
    chartInstance.value = instance;
    attachEvents();
    if (boxSelectEnabled.value) {
      enableBrush(true);
    }
  }
  return instance;
}

async function flushPendingOption(force = false) {
  if (isFlushingPending) return;
  const instance = ensureChartInstance();
  if (!instance) return;
  const option = pendingOption.value ?? (force ? chartOption.value : null);
  if (!option) {
    instance.resize();
    return;
  }
  isFlushingPending = true;
  try {
    const applied = await applyOption(option, instance);
    if (applied) {
      pendingOption.value = null;
    }
  } finally {
    isFlushingPending = false;
  }
}

watch(
  () => props.elements,
  () => {
    shouldAutoFit.value = true;
    updateOption();
  },
  { deep: true },
);

watch(
  () => props.layout,
  () => {
    shouldAutoFit.value = true;
    updateOption();
  },
);

watch(
  () => props.selectedId,
  () => updateOption(),
);

watch(
  () => props.timeline,
  () => {
    shouldAutoFit.value = true;
    updateOption();
  },
  { deep: true },
);

watch(canvasHeight, () => {
  flushPendingOption(true);
});

watch(containerWidth, () => {
  flushPendingOption(true);
});

function handleChartReady(instance: EChartsInstance) {
  chartInstance.value = instance;
  attachEvents();
  if (boxSelectEnabled.value) {
    enableBrush(true);
  }
  evaluateContainerSize();
  flushPendingOption(true);
}

onMounted(async () => {
  await nextTick();
  evaluateContainerSize();
  if (process.client && typeof ResizeObserver !== "undefined") {
    resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[entries.length - 1];
      const ready = evaluateContainerSize(entry);
      if (ready) {
        flushPendingOption(true);
      }
    });
    if (containerRef.value) {
      resizeObserver.observe(containerRef.value);
    }
  }
  await updateOption();
});

onBeforeUnmount(() => {
  detachEvents();
  chartInstance.value = null;
  if (resizeObserver) {
    resizeObserver.disconnect();
    resizeObserver = null;
  }
});

function setBoxSelection(value: boolean) {
  boxSelectEnabled.value = value;
  ensureChartInstance();
  enableBrush(value);
}

function zoomIn() {
  shouldAutoFit.value = false;
  ensureChartInstance();
  chartInstance.value?.dispatchAction({
    type: "graphRoam",
    seriesIndex: 0,
    zoom: 1.2,
  });
}

function zoomOut() {
  shouldAutoFit.value = false;
  ensureChartInstance();
  chartInstance.value?.dispatchAction({
    type: "graphRoam",
    seriesIndex: 0,
    zoom: 0.8,
  });
}

function resetView() {
  shouldAutoFit.value = true;
  ensureChartInstance();
  updateOption();
}

function focusTimeline() {
  shouldAutoFit.value = true;
  updateOption();
}

defineExpose({
  zoomIn,
  zoomOut,
  resetView,
  setBoxSelection,
  focusTimeline,
});
</script>

<template>
  <div
    ref="containerRef"
    class="relative flex-1 h-full min-h-[320px] w-full overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-slate-50 via-white/90 to-slate-100 shadow-inner sm:min-h-[420px] lg:min-h-[520px]"
  >
    <div
      v-if="loading"
      class="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-background/80 backdrop-blur"
      role="status"
    >
      <div
        class="h-12 w-12 animate-spin rounded-full border-4 border-primary/40 border-t-primary"
      />
      <p class="text-sm text-muted-foreground">
        {{ $t("graph.graphStage.loading.title") }}
      </p>
      <p class="text-xs text-muted-foreground/80">
        {{ $t("graph.graphStage.loading.tip") }}
      </p>
    </div>

    <div
      v-else-if="error && !elements.length"
      class="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-background/80 backdrop-blur"
      role="alert"
    >
      <p class="text-sm font-medium text-destructive">{{ error }}</p>
      <Button size="sm" class="rounded-full px-4" @click="emit('retry')">
        {{ $t("graph.graphStage.error.retry") }}
      </Button>
    </div>

    <VChart
      v-else
      ref="chartRef"
      class="w-full"
      :style="canvasStyle"
      :option="chartOption"
      autoresize
      @ready="handleChartReady"
    />
  </div>
</template>
