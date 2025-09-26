<template>
  <div class="graph-visualization">
    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <button @click="resetLayout" class="btn btn-primary">重置布局</button>
        <button @click="toggleLegend" class="btn btn-secondary">{{ showLegend ? '隐藏' : '显示' }}图例</button>
        <button @click="exportImage" class="btn btn-secondary">导出图片</button>
      </div>
      <div class="toolbar-right">
        <input 
          v-model="searchQuery" 
          @input="handleSearch" 
          placeholder="搜索节点..." 
          class="search-input"
        />
        <select v-model="layoutType" @change="updateLayout" class="layout-select">
          <option value="force">力导向布局</option>
          <option value="circular">环形布局</option>
          <option value="grid">网格布局</option>
        </select>
      </div>
    </div>

    <!-- 配置面板 -->
    <div v-if="showConfig" class="config-panel">
      <div class="config-section">
        <h4>节点配置</h4>
        <div class="config-item">
          <label>节点大小映射:</label>
          <select v-model="nodeSizeMapping" @change="updateVisualization">
            <option value="fixed">固定大小</option>
            <option value="degree">按度数</option>
            <option value="betweenness">按介数中心性</option>
            <option value="pagerank">按PageRank</option>
            <option value="value">按节点值</option>
          </select>
        </div>
        <div class="config-item" v-if="nodeSizeMapping === 'fixed'">
          <label>节点大小:</label>
          <input type="range" v-model="fixedNodeSize" min="5" max="50" @input="updateVisualization">
          <span>{{ fixedNodeSize }}</span>
        </div>
        <div class="config-item">
          <label>节点颜色映射:</label>
          <select v-model="nodeColorMapping" @change="updateVisualization">
            <option value="type">按类型</option>
            <option value="community">按社区</option>
            <option value="centrality">按中心性</option>
            <option value="custom">自定义颜色</option>
          </select>
        </div>
        <div class="config-item" v-if="nodeColorMapping === 'custom'">
          <label>自定义颜色:</label>
          <input type="color" v-model="customNodeColor" @change="updateVisualization">
        </div>
        <div class="config-item">
          <label>显示标签:</label>
          <input type="checkbox" v-model="showLabels" @change="updateVisualization" />
        </div>
        <div class="config-item">
          <label>标签字体大小:</label>
          <input type="range" v-model="labelFontSize" min="8" max="24" @input="updateVisualization">
          <span>{{ labelFontSize }}px</span>
        </div>
        <div class="config-item">
          <label>节点透明度:</label>
          <input type="range" v-model="nodeOpacity" min="0.1" max="1" step="0.1" @input="updateVisualization">
          <span>{{ nodeOpacity }}</span>
        </div>
      </div>
      
      <div class="config-section">
        <h4>关系配置</h4>
        <div class="config-item">
          <label>关系粗细映射:</label>
          <select v-model="edgeWidthMapping" @change="updateVisualization">
            <option value="fixed">固定粗细</option>
            <option value="weight">按权重</option>
            <option value="frequency">按频次</option>
          </select>
        </div>
        <div class="config-item" v-if="edgeWidthMapping === 'fixed'">
          <label>边宽度:</label>
          <input type="range" v-model="fixedEdgeWidth" min="1" max="10" @input="updateVisualization">
          <span>{{ fixedEdgeWidth }}px</span>
        </div>
        <div class="config-item">
          <label>边颜色:</label>
          <select v-model="edgeColorMapping" @change="updateVisualization">
            <option value="default">默认</option>
            <option value="type">关系类型</option>
            <option value="weight">权重渐变</option>
            <option value="custom">自定义</option>
          </select>
        </div>
        <div class="config-item" v-if="edgeColorMapping === 'custom'">
          <label>自定义边颜色:</label>
          <input type="color" v-model="customEdgeColor" @change="updateVisualization">
        </div>
        <div class="config-item">
          <label>边透明度:</label>
          <input type="range" v-model="edgeOpacity" min="0.1" max="1" step="0.1" @input="updateVisualization">
          <span>{{ edgeOpacity }}</span>
        </div>
        <div class="config-item">
          <label>边曲率:</label>
          <input type="range" v-model="edgeCurveness" min="0" max="0.5" step="0.1" @input="updateVisualization">
          <span>{{ edgeCurveness }}</span>
        </div>
      </div>
      
      <div class="config-section">
        <h4>布局配置</h4>
        <div class="config-item" v-if="layoutType === 'force'">
          <label>斥力强度:</label>
          <input type="range" v-model="repulsion" min="50" max="500" @input="updateVisualization">
          <span>{{ repulsion }}</span>
        </div>
        <div class="config-item" v-if="layoutType === 'force'">
          <label>边长度:</label>
          <input type="range" v-model="edgeLength" min="50" max="300" @input="updateVisualization">
          <span>{{ edgeLength }}</span>
        </div>
        <div class="config-item" v-if="layoutType === 'force'">
          <label>重力:</label>
          <input type="range" v-model="gravity" min="0" max="1" step="0.1" @input="updateVisualization">
          <span>{{ gravity }}</span>
        </div>
      </div>
    </div>

    <!-- 图表容器 -->
    <div ref="chartContainer" class="chart-container"></div>

    <!-- 图例 -->
    <div v-if="showLegend" class="legend">
      <div class="legend-title">节点类型</div>
      <div v-for="(color, type) in nodeTypeColors" :key="type" class="legend-item">
        <div class="legend-color" :style="{ backgroundColor: color }"></div>
        <span>{{ type }}</span>
      </div>
    </div>

    <!-- 统计信息 -->
    <div class="stats-panel">
      <div class="stat-item">
        <span class="stat-label">节点数:</span>
        <span class="stat-value">{{ nodeCount }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">边数:</span>
        <span class="stat-value">{{ edgeCount }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">平均度数:</span>
        <span class="stat-value">{{ averageDegree.toFixed(2) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed, nextTick } from 'vue'
import * as echarts from 'echarts'

// Props
const props = defineProps({
  graphData: {
    type: Object,
    default: () => ({ nodes: [], links: [] })
  },
  width: {
    type: [String, Number],
    default: '100%'
  },
  height: {
    type: [String, Number],
    default: '600px'
  }
})

// Emits
const emit = defineEmits(['nodeClick', 'edgeClick', 'nodeHover'])

// Refs
const chartContainer = ref(null)
let chartInstance = null

// 响应式数据
const showConfig = ref(false)
const showLegend = ref(true)
const searchQuery = ref('')
const layoutType = ref('force')

// 节点配置
const nodeSizeMapping = ref('degree')
const fixedNodeSize = ref(20)
const nodeColorMapping = ref('type')
const customNodeColor = ref('#5470c6')
const showLabels = ref(true)
const labelFontSize = ref(12)
const nodeOpacity = ref(1)

// 新增：响应式和性能优化配置
const currentZoomLevel = ref(1)
const zoomThreshold = ref(0.8) // 缩放阈值，低于此值隐藏文字
const isMobile = ref(false)
const coreNodesOnly = ref(true) // 初始只显示核心节点文字
const minNodeSizeForLabel = ref(30) // 最小节点大小才显示标签
const dynamicLabelThreshold = ref(50) // 节点数量超过此值时启用动态标签

// 边配置
const edgeWidthMapping = ref('fixed')
const fixedEdgeWidth = ref(2)
const edgeColorMapping = ref('default')
const customEdgeColor = ref('#999')
const edgeOpacity = ref(0.6)
const edgeCurveness = ref(0.3)

// 布局配置 - 增强节点互斥效果
const repulsion = ref(500) // 增加斥力
const edgeLength = ref(150) // 减少边长度让布局更紧凑
const gravity = ref(0.1)    // 减少重力

// 节点类型颜色映射
const nodeTypeColors = ref({})

// 悬停动画相关
let hoverInterval = null
let originalLabel = ''

// 计算属性
const nodeCount = computed(() => props.graphData.nodes?.length || 0)
const edgeCount = computed(() => props.graphData.links?.length || 0)
const averageDegree = computed(() => {
  if (nodeCount.value === 0) return 0
  return (edgeCount.value * 2) / nodeCount.value
})

// 处理图数据
const processGraphData = (data) => {
  if (!data || !data.nodes || !data.links) {
    return { nodes: [], links: [] }
  }

  // 计算节点度数
  const degreeMap = new Map()
  data.links.forEach(link => {
    const source = typeof link.source === 'object' ? link.source.id : link.source
    const target = typeof link.target === 'object' ? link.target.id : link.target
    
    degreeMap.set(source, (degreeMap.get(source) || 0) + 1)
    degreeMap.set(target, (degreeMap.get(target) || 0) + 1)
  })

  // 处理节点
  const processedNodes = data.nodes.map(node => {
    const nodeId = node.id || node.name
    const degree = degreeMap.get(nodeId) || 0
    const nodeName = node.name || nodeId
    
    return {
      ...node,
      id: nodeId,
      name: nodeName,
      category: node.category || '未分类',
      degree: degree,
      symbolSize: calculateNodeSize({ ...node, degree }),
      itemStyle: {
        opacity: nodeOpacity.value,
        color: getNodeColor(node.category || '未分类'),
        borderColor: 'rgba(255, 255, 255, 0.8)',
        borderWidth: 1,
        shadowBlur: 6,
        shadowColor: 'rgba(0, 0, 0, 0.2)',
        shadowOffsetX: 2,
        shadowOffsetY: 2
      },
      label: {
        show: shouldShowLabel({ ...node, degree }, currentZoomLevel.value),
        position: 'inside',
        fontSize: calculateFontSize(calculateNodeSize({ ...node, degree }), currentZoomLevel.value),
        color: '#fff',
        fontWeight: 'bold',
        textShadowColor: 'rgba(0, 0, 0, 0.7)',
        textShadowBlur: isMobile.value ? 2 : 3,
        formatter: (params) => {
          const name = params.data.name || ''
          const nodeSize = params.data.symbolSize
          const zoomLevel = currentZoomLevel.value
          
          // 根据缩放级别和节点大小动态调整显示字符数
          const padding = isMobile.value ? 20 : 24
          const charWidth = isMobile.value ? 14 : 16
          const availableWidth = (nodeSize * zoomLevel) - padding
          const maxChars = Math.floor(availableWidth / charWidth)
          
          if (name.length <= maxChars || maxChars < 2) {
            return name
          }
          return name.substring(0, Math.max(1, maxChars - 1)) + '...'
        }
      }
    }
  })

  // 处理边
  const processedLinks = data.links.map(link => ({
    ...link,
    source: typeof link.source === 'object' ? link.source.id : link.source,
    target: typeof link.target === 'object' ? link.target.id : link.target,
    lineStyle: {
      opacity: edgeOpacity.value,
      curveness: edgeCurveness.value,
      width: calculateEdgeWidth(link),
      color: 'rgba(108, 117, 125, 0.6)' // 更柔和的边颜色
    }
  }))

  // 更新节点类型颜色
  updateNodeTypeColors(processedNodes)

  return {
    nodes: processedNodes,
    links: processedLinks
  }
}

// 检测移动端设备
const detectMobile = () => {
  isMobile.value = window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

// 强化节点大小与关联数量的对应关系
const calculateNodeSize = (node) => {
  const degree = node.degree || 0
  const minTextSize = 3 // 最少显示3个汉字
  const charWidth = isMobile.value ? 14 : 16 // 移动端字符更小
  const padding = isMobile.value ? 20 : 24 // 移动端减少内边距
  const minSize = minTextSize * charWidth + padding
  
  // 根据关联数量动态调整大小范围
  const maxSize = isMobile.value ? 80 : 120
  const sizeMultiplier = isMobile.value ? 3 : 4
  
  switch (nodeSizeMapping.value) {
    case 'degree':
      // 强化度数与大小的对应关系
      const baseSize = minSize + Math.sqrt(degree) * sizeMultiplier
      return Math.max(minSize, Math.min(maxSize, baseSize))
    case 'fixed':
      return Math.max(minSize, fixedNodeSize.value)
    case 'value':
      return Math.max(minSize, Math.min(maxSize, (node.value || 1) * 25))
    default:
      return minSize
  }
}

// 判断是否为核心节点（高度数节点）
const isCoreNode = (node) => {
  const degree = node.degree || 0
  const totalNodes = props.graphData.nodes?.length || 0
  const threshold = Math.max(3, Math.floor(totalNodes * 0.1)) // 前10%的节点或至少度数为3
  return degree >= threshold
}

// 动态计算字体大小（随缩放变化）
const calculateFontSize = (nodeSize, zoomLevel = 1) => {
  const baseSize = Math.max(10, Math.min(16, nodeSize / 5))
  const scaledSize = baseSize * Math.max(0.8, Math.min(1.5, zoomLevel))
  return isMobile.value ? Math.max(9, scaledSize - 1) : scaledSize
}

// 判断是否应该显示标签
const shouldShowLabel = (node, zoomLevel = 1) => {
  // 缩放级别过低时隐藏所有标签
  if (zoomLevel < zoomThreshold.value) {
    return false
  }
  
  // 节点数量过多时的性能优化策略
  const totalNodes = props.graphData.nodes?.length || 0
  if (totalNodes > dynamicLabelThreshold.value) {
    // 只显示核心节点或当前悬停的节点
    return coreNodesOnly.value ? isCoreNode(node) : node.symbolSize >= minNodeSizeForLabel.value
  }
  
  return showLabels.value
}

// 计算悬停时的放大尺寸 - 包含充足的安全余量
const calculateHoverSize = (node) => {
  const name = node.name || ''
  const baseSize = calculateNodeSize(node)
  
  if (name.length <= 3) {
    return baseSize
  }
  
  // 根据文字长度动态计算需要的尺寸，包含安全余量
  const charWidth = 16 // 每个汉字的宽度
  const charHeight = 18 // 字体高度
  const padding = 32 // 增加安全余量（上下左右各8px）
  
  const textWidth = name.length * charWidth
  const neededWidth = textWidth + padding
  const neededHeight = charHeight + padding
  
  const neededSize = Math.max(neededWidth, neededHeight)
  return Math.min(150, Math.max(baseSize, neededSize))
}

// 计算边宽度
const calculateEdgeWidth = (edge) => {
  switch (edgeWidthMapping.value) {
    case 'weight':
      return Math.max(1, Math.min(10, (edge.weight || 1) * 2))
    case 'frequency':
      return Math.max(1, Math.min(10, (edge.frequency || 1) * 2))
    case 'fixed':
      return fixedEdgeWidth.value
    default:
      return 2
  }
}

// 更新节点类型颜色 - 使用更柔和的配色方案
const updateNodeTypeColors = (nodes) => {
  const colors = [
    '#4F46E5', // 靛蓝
    '#059669', // 翠绿
    '#DC2626', // 红色
    '#7C3AED', // 紫色
    '#EA580C', // 橙色
    '#0891B2', // 青色
    '#BE185D', // 粉红
    '#65A30D', // 石灰绿
    '#1F2937'  // 灰色
  ]
  const types = [...new Set(nodes.map(node => node.category))]
  
  const colorMap = {}
  types.forEach((type, index) => {
    colorMap[type] = colors[index % colors.length]
  })
  
  nodeTypeColors.value = colorMap
}

// 获取节点颜色
const getNodeColor = (category) => {
  return nodeTypeColors.value[category] || '#6B7280'
}

// 获取ECharts配置
const getEChartsOption = () => {
  const processedData = processGraphData(props.graphData)
  
  return {
    title: {
      text: '知识图谱',
      left: 'center',
      textStyle: {
        color: '#333',
        fontSize: 18
      }
    },
    tooltip: {
      trigger: 'item',
      confine: true,
      formatter: (params) => {
        if (params.dataType === 'node') {
          const data = params.data
          return `
            <div style="font-family: sans-serif; font-size: 14px; color: #333;">
              <strong style="color: #000;">节点: ${data.name}</strong><br>
              <strong>类型:</strong> ${data.category}<br>
              <strong>关联数:</strong> ${data.degree || 0}<br>
              <strong>大小:</strong> ${data.symbolSize.toFixed(2)}
            </div>
          `
        } else if (params.dataType === 'edge') {
          const data = params.data
          return `
            <div style="font-family: sans-serif; font-size: 14px; color: #333;">
              <strong>关系: ${data.name}</strong><br>
              ${data.source} → ${data.target}
            </div>
          `
        }
        return ''
      }
    },
    legend: {
      show: false
    },
    series: [{
      type: 'graph',
      layout: layoutType.value,
      data: processedData.nodes,
      links: processedData.links,
      categories: Object.keys(nodeTypeColors.value).map(name => ({ name })),
      roam: true,
      focusNodeAdjacency: true,
      itemStyle: {
        borderColor: '#fff',
        borderWidth: 1,
        shadowBlur: 10,
        shadowColor: 'rgba(0, 0, 0, 0.3)'
      },
      lineStyle: {
        color: 'source',
        curveness: edgeCurveness.value,
        opacity: edgeOpacity.value
      },
      emphasis: {
        focus: 'adjacency',
        lineStyle: {
          width: 10
        }
      },
      force: layoutType.value === 'force' ? {
        repulsion: repulsion.value,
        edgeLength: edgeLength.value,
        gravity: gravity.value,
        layoutAnimation: true,
        friction: 0.6
      } : undefined,
      draggable: true,
      focusNodeAdjacency: false,
      silent: false
    }]
  }
}

// 初始化图表
const initChart = () => {
  if (!chartContainer.value) return
  
  // 检测设备类型
  detectMobile()
  
  chartInstance = echarts.init(chartContainer.value)
  updateVisualization()
  
  // 添加缩放监听器
  chartInstance.on('dataZoom', (params) => {
    // 更新当前缩放级别
    const option = chartInstance.getOption()
    if (option && option.series && option.series[0]) {
      currentZoomLevel.value = params.zoom || 1
      updateLabelsBasedOnZoom()
    }
  })
  
  // 添加鼠标滚轮缩放监听
  chartInstance.getZr().on('mousewheel', (params) => {
    // 获取当前缩放级别并更新标签显示
    setTimeout(() => {
      updateLabelsBasedOnZoom()
    }, 100)
  })
  
  // 添加触摸缩放监听（移动端）
  if (isMobile.value) {
    chartInstance.getZr().on('pinch', (params) => {
      setTimeout(() => {
        updateLabelsBasedOnZoom()
      }, 100)
    })
  }
  
  // 添加事件监听
  chartInstance.on('click', (params) => {
    if (params.dataType === 'node') {
      emit('nodeClick', params.data)
    } else if (params.dataType === 'edge') {
      emit('edgeClick', params.data)
    }
  })

  // 添加鼠标悬停事件 - 放大节点显示完整文字
  chartInstance.on('mouseover', (params) => {
    if (params.dataType === 'node') {
      const nodeData = params.data
      const hoverSize = calculateHoverSize(nodeData)
      
      // 放大节点并显示完整文字
      chartInstance.setOption({
        series: [{
          data: chartInstance.getOption().series[0].data.map(node => {
            if (node.id === params.data.id) {
              return {
                ...node,
                symbolSize: hoverSize,
                label: {
                  ...node.label,
                  fontSize: Math.max(12, Math.min(16, hoverSize / 6)),
                  formatter: nodeData.name // 显示完整文字
                },
                itemStyle: {
                  ...node.itemStyle,
                  shadowBlur: 12,
                  shadowColor: 'rgba(0, 0, 0, 0.4)',
                  borderWidth: 2,
                  borderColor: 'rgba(255, 255, 255, 0.9)'
                }
              }
            }
            return node
          })
        }]
      })
      
      emit('nodeHover', params.data)
    }
  })

  // 添加鼠标离开事件 - 恢复原始大小
  chartInstance.on('mouseout', (params) => {
    if (params.dataType === 'node') {
      const nodeData = params.data
      const originalSize = calculateNodeSize(nodeData)
      
      // 恢复原始大小和标签
      chartInstance.setOption({
        series: [{
          data: chartInstance.getOption().series[0].data.map(node => {
            if (node.id === params.data.id) {
              return {
                ...node,
                symbolSize: originalSize,
                label: {
                  ...node.label,
                  fontSize: Math.max(10, Math.min(14, originalSize / 4)),
                  formatter: (params) => {
                    const name = params.data.name || ''
                    const nodeSize = originalSize
                    const maxChars = Math.floor(nodeSize / 15)
                    
                    if (name.length <= maxChars) {
                      return name
                    }
                    return name.substring(0, Math.max(2, maxChars - 1)) + '...'
                  }
                },
                itemStyle: {
                  ...node.itemStyle,
                  shadowBlur: 6,
                  shadowColor: 'rgba(0, 0, 0, 0.2)',
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.8)'
                }
              }
            }
            return node
          })
        }]
      })
    }
  })
}

// 更新可视化
const updateVisualization = () => {
  if (!chartInstance) return
  
  const option = getEChartsOption()
  chartInstance.setOption(option, true)
}

// 重置布局
const resetLayout = () => {
  if (chartInstance) {
    chartInstance.setOption(getEChartsOption(), true)
  }
}

// 切换图例
const toggleLegend = () => {
  showLegend.value = !showLegend.value
}

// 导出图片
const exportImage = () => {
  if (chartInstance) {
    const url = chartInstance.getDataURL({
      type: 'png',
      pixelRatio: 2,
      backgroundColor: '#fff'
    })
    
    const link = document.createElement('a')
    link.download = 'knowledge-graph.png'
    link.href = url
    link.click()
  }
}

// 搜索处理
const handleSearch = () => {
  if (!chartInstance || !searchQuery.value.trim()) {
    updateVisualization()
    return
  }
  
  const query = searchQuery.value.toLowerCase()
  const option = chartInstance.getOption()
  
  // 高亮匹配的节点
  option.series[0].data = option.series[0].data.map(node => {
    const isMatch = node.name.toLowerCase().includes(query)
    return {
      ...node,
      itemStyle: {
        ...node.itemStyle,
        opacity: isMatch ? 1 : 0.3
      }
    }
  })
  
  chartInstance.setOption(option)
}

// 更新布局
const updateLayout = () => {
  updateVisualization()
}

// 监听数据变化
watch(() => props.graphData, () => {
  updateVisualization()
}, { deep: true })

// 根据缩放级别更新标签显示
const updateLabelsBasedOnZoom = () => {
  if (!chartInstance) return
  
  const option = chartInstance.getOption()
  if (!option || !option.series || !option.series[0]) return
  
  // 估算当前缩放级别
  const viewBox = chartInstance.getModel().getComponent('grid').coordinateSystem
  if (viewBox) {
    const currentZoom = viewBox.getZoom ? viewBox.getZoom() : 1
    currentZoomLevel.value = currentZoom
  }
  
  // 更新节点标签显示
  const updatedData = option.series[0].data.map(node => {
    const shouldShow = shouldShowLabel(node, currentZoomLevel.value)
    const fontSize = calculateFontSize(node.symbolSize, currentZoomLevel.value)
    
    return {
      ...node,
      label: {
        ...node.label,
        show: shouldShow,
        fontSize: fontSize
      }
    }
  })
  
  chartInstance.setOption({
    series: [{
      ...option.series[0],
      data: updatedData
    }]
  })
}

// 窗口大小变化监听
const handleResize = () => {
  detectMobile()
  if (chartInstance) {
    chartInstance.resize()
    updateVisualization()
  }
}

// 组件挂载
onMounted(() => {
  nextTick(() => {
    initChart()
    
    // 添加窗口大小变化监听
    window.addEventListener('resize', handleResize)
  })
})

// 组件卸载时清理
onUnmounted(() => {
  if (hoverInterval) {
    clearInterval(hoverInterval)
  }
  if (chartInstance) {
    chartInstance.dispose()
  }
  
  // 移除事件监听器
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.graph-visualization {
  position: relative;
  width: 100%;
  height: 100%;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
  border-radius: 8px 8px 0 0;
}

.toolbar-left {
  display: flex;
  gap: 8px;
}

.toolbar-right {
  display: flex;
  gap: 12px;
  align-items: center;
}

.btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
}

.btn-secondary {
  background: #6b7280;
  color: white;
}

.btn-secondary:hover {
  background: #4b5563;
}

.search-input {
  padding: 6px 12px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 14px;
  width: 200px;
}

.layout-select {
  padding: 6px 12px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 14px;
  background: white;
}

.config-panel {
  position: absolute;
  top: 60px;
  right: 16px;
  width: 280px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  max-height: 500px;
  overflow-y: auto;
}

.config-section {
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.config-section:last-child {
  border-bottom: none;
}

.config-section h4 {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: #374151;
}

.config-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  gap: 8px;
}

.config-item:last-child {
  margin-bottom: 0;
}

.config-item label {
  font-size: 14px;
  color: #374151;
  white-space: nowrap;
}

.config-item input,
.config-item select {
  flex: 1;
  padding: 4px 8px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 14px;
}

.config-item span {
  font-size: 12px;
  color: #6b7280;
  min-width: 40px;
  text-align: right;
}

.chart-container {
  width: 100%;
  height: 600px;
  touch-action: manipulation; /* 优化移动端触摸体验 */
}

/* 移动端适配 */
@media (max-width: 768px) {
  .toolbar {
    flex-direction: column;
    gap: 8px;
    padding: 8px 12px;
  }
  
  .toolbar-left,
  .toolbar-right {
    width: 100%;
    justify-content: center;
  }
  
  .search-input {
    width: 150px;
    font-size: 12px;
  }
  
  .btn {
    padding: 4px 8px;
    font-size: 12px;
  }
  
  .config-panel {
    width: 90%;
    right: 5%;
    max-height: 400px;
  }
  
  .legend {
    font-size: 11px;
    padding: 8px;
  }
  
  .stats-panel {
    flex-direction: column;
    gap: 8px;
    padding: 8px;
  }
  
  .stat-item {
    flex-direction: row;
    justify-content: space-between;
  }
  
  .chart-container {
    height: 500px; /* 移动端减少高度 */
  }
}

/* 高DPI屏幕优化 */
@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
  .chart-container {
    image-rendering: -webkit-optimize-contrast;
    image-rendering: crisp-edges;
  }
}

.legend {
  position: absolute;
  top: 80px;
  left: 16px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.legend-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #374151;
}

.legend-item {
  display: flex;
  align-items: center;
  margin-bottom: 6px;
  font-size: 12px;
  color: #6b7280;
}

.legend-item:last-child {
  margin-bottom: 0;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  margin-right: 8px;
}

.stats-panel {
  position: absolute;
  bottom: 16px;
  left: 16px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  gap: 16px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-label {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
}
</style>