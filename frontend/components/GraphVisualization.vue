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
          <label>显示边标签:</label>
          <input type="checkbox" v-model="showEdgeLabels" @change="updateVisualization">
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
        
        <div class="config-section">
          <h4>布局设置</h4>
          <div class="config-item">
            <label>布局算法:</label>
            <select v-model="layoutType" @change="updateLayout">
              <option value="force">力导向布局</option>
              <option value="circular">环形布局</option>
              <option value="grid">网格布局</option>
              <option value="radial">径向布局</option>
            </select>
          </div>
          <div class="config-item" v-if="layoutType === 'force'">
            <label>引力强度:</label>
            <input type="range" v-model="forceGravity" min="0.1" max="2" step="0.1" @input="updateVisualization">
            <span>{{ forceGravity }}</span>
          </div>
          <div class="config-item" v-if="layoutType === 'force'">
            <label>斥力强度:</label>
            <input type="range" v-model="forceRepulsion" min="50" max="500" @input="updateVisualization">
            <span>{{ forceRepulsion }}</span>
          </div>
          <div class="config-item" v-if="layoutType === 'force'">
            <label>边长度:</label>
            <input type="range" v-model="forceEdgeLength" min="50" max="300" @input="updateVisualization">
            <span>{{ forceEdgeLength }}</span>
          </div>
          <div class="config-item">
            <label>动画时长:</label>
            <input type="range" v-model="animationDuration" min="0" max="3000" step="100" @input="updateVisualization">
            <span>{{ animationDuration }}ms</span>
          </div>
        </div>
        
        <div class="config-section">
           <h4>显示设置</h4>
           <div class="config-item">
             <label>显示网格:</label>
             <input type="checkbox" v-model="showGrid" @change="updateVisualization">
           </div>
           <div class="config-item">
             <label>显示坐标轴:</label>
             <input type="checkbox" v-model="showAxis" @change="updateVisualization">
           </div>
           <div class="config-item">
             <label>背景颜色:</label>
             <input type="color" v-model="backgroundColor" @change="updateVisualization">
           </div>
           <div class="config-item">
             <label>缩放限制:</label>
             <div class="range-group">
               <label>最小:</label>
               <input type="range" v-model="minZoom" min="0.1" max="1" step="0.1" @input="updateVisualization">
               <span>{{ minZoom }}</span>
             </div>
             <div class="range-group">
               <label>最大:</label>
               <input type="range" v-model="maxZoom" min="1" max="10" step="0.5" @input="updateVisualization">
               <span>{{ maxZoom }}</span>
             </div>
           </div>
         </div>
      </div>
    </div>

    <!-- ECharts图表容器 -->
    <div ref="chartContainer" class="chart-container"></div>

    <!-- 节点详情面板 -->
    <div v-if="selectedNode" class="detail-panel">
      <div class="detail-header">
        <h3>{{ selectedNode.name }}</h3>
        <button @click="closeDetail" class="close-btn">×</button>
      </div>
      <div class="detail-content">
        <div class="detail-item">
          <strong>类型:</strong> {{ selectedNode.category }}
        </div>
        <div class="detail-item">
          <strong>ID:</strong> {{ selectedNode.id }}
        </div>
        <div class="detail-item" v-if="selectedNode.properties">
          <strong>属性:</strong>
          <ul>
            <li v-for="(value, key) in selectedNode.properties" :key="key">
              {{ key }}: {{ value }}
            </li>
          </ul>
        </div>
        <div class="detail-item">
          <strong>邻居节点:</strong> {{ selectedNode.neighbors?.length || 0 }}
        </div>
        <div class="detail-actions">
          <button @click="expandNode" class="btn btn-primary">展开邻居</button>
          <button @click="collapseNode" class="btn btn-secondary">折叠</button>
        </div>
      </div>
    </div>

    <!-- 右键菜单 -->
    <div v-if="contextMenu.show" 
         class="context-menu" 
         :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }"
         @click.stop>
      <div class="context-menu-item" @click="viewNodeDetails(contextMenu.node)">
        <i class="icon">👁️</i> 查看详情
      </div>
      <div class="context-menu-item" @click="expandNodeNeighbors(contextMenu.node)">
        <i class="icon">🔍</i> 展开邻居
      </div>
      <div class="context-menu-item" @click="collapseNodeNeighbors(contextMenu.node)">
        <i class="icon">📁</i> 折叠节点
      </div>
      <div class="context-menu-item" @click="highlightNodePath(contextMenu.node)">
        <i class="icon">🛤️</i> 高亮路径
      </div>
      <div class="context-menu-item" @click="hideNode(contextMenu.node)">
        <i class="icon">👻</i> 隐藏节点
      </div>
      <div class="context-menu-divider"></div>
      <div class="context-menu-item" @click="copyNodeInfo(contextMenu.node)">
        <i class="icon">📋</i> 复制信息
      </div>
    </div>

    <!-- 配置按钮 -->
    <button @click="toggleConfig" class="config-toggle-btn">
      ⚙️
    </button>

    <!-- 全局点击遮罩 -->
    <div v-if="contextMenu.show" 
         class="context-menu-overlay" 
         @click="contextMenu.show = false"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
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
  },
  interactive: {
    type: Boolean,
    default: true
  }
})

// Emits
const emit = defineEmits(['node-click', 'node-expand', 'node-collapse', 'layout-change'])

// 响应式数据
const chartContainer = ref(null)
const chart = ref(null)
const selectedNode = ref(null)
const showConfig = ref(false)
const showLegend = ref(true)
const searchQuery = ref('')
const layoutType = ref('force')

// 配置选项
const nodeSizeMapping = ref('degree')
const fixedNodeSize = ref(20)
const nodeColorMapping = ref('type')
const customNodeColor = ref('#1890ff')
const showLabels = ref(true)
const labelFontSize = ref(12)
const nodeOpacity = ref(1)
const edgeWidthMapping = ref('weight')
const edgeColorMapping = ref('default')
const showEdgeLabels = ref(false)
const fixedEdgeWidth = ref(2)
const customEdgeColor = ref('#999999')
const edgeOpacity = ref(0.6)
const edgeCurveness = ref(0.1)

// 布局配置
const forceGravity = ref(0.8)
const forceRepulsion = ref(120)
const forceEdgeLength = ref(150)
const animationDuration = ref(1000)

// 显示配置
const showGrid = ref(false)
const showAxis = ref(false)
const backgroundColor = ref('#ffffff')
const minZoom = ref(0.2)
const maxZoom = ref(5)

// 颜色配置
const colorScheme = {
  type: {
    'Person': '#ff7f0e',
    'Company': '#2ca02c',
    'Account': '#d62728',
    'Transaction': '#9467bd',
    'Device': '#8c564b',
    'Location': '#e377c2',
    'default': '#1f77b4'
  },
  community: [
    '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b',
    '#e377c2', '#7f7f7f', '#bcbd22', '#17becf', '#aec7e8'
  ]
}

// 生命周期
onMounted(() => {
  initChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  if (chart.value) {
    chart.value.dispose()
  }
  window.removeEventListener('resize', handleResize)
})

// 监听数据变化
watch(() => props.graphData, (newData) => {
  if (newData && chart.value) {
    updateChart(newData)
  }
}, { deep: true })

// 初始化图表
const initChart = () => {
  if (!chartContainer.value) return
  
  chart.value = echarts.init(chartContainer.value)
  
  // 设置初始配置
  const option = getChartOption(props.graphData)
  chart.value.setOption(option)
  
  // 绑定事件
  chart.value.on('click', handleNodeClick)
  chart.value.on('contextmenu', handleNodeRightClick)
  chart.value.on('mousedown', handleMouseDown)
  chart.value.on('mousemove', handleMouseMove)
  chart.value.on('mouseup', handleMouseUp)
  chart.value.on('globalout', () => {
    contextMenu.value.show = false
  })
}

// 获取图表配置
const getChartOption = (data) => {
  const processedData = processGraphData(data)
  
  return {
    backgroundColor: backgroundColor.value,
    title: {
      text: '知识图谱可视化',
      left: 'center',
      textStyle: {
        fontSize: 18,
        fontWeight: 'bold'
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: (params) => {
        if (params.dataType === 'node') {
          const node = params.data
          return `
            <div style="padding: 8px;">
              <strong>${node.name}</strong><br/>
              类型: ${node.category}<br/>
              度数: ${node.value || 0}<br/>
              ${node.properties ? Object.entries(node.properties).map(([k, v]) => `${k}: ${v}`).join('<br/>') : ''}
            </div>
          `
        } else if (params.dataType === 'edge') {
          const edge = params.data
          return `
            <div style="padding: 8px;">
              <strong>${edge.source} → ${edge.target}</strong><br/>
              关系: ${edge.label || '未知'}<br/>
              权重: ${edge.value || 1}
            </div>
          `
        }
      }
    },
    legend: {
      show: showLegend.value,
      data: processedData.categories.map(cat => cat.name),
      top: 30
    },
    grid: {
       show: showGrid.value,
       left: '10%',
       right: '10%',
       top: '10%',
       bottom: '10%'
     },
     xAxis: {
       show: showAxis.value,
       type: 'value'
     },
     yAxis: {
       show: showAxis.value,
       type: 'value'
     },
     legend: showLegend.value ? {
       show: true,
       orient: 'vertical',
       left: 'right',
       top: 'center',
       data: processedData.categories?.map(cat => cat.name) || [],
       textStyle: {
         fontSize: 12
       },
       itemWidth: 14,
       itemHeight: 14
     } : {
       show: false
     },
     series: [{
      type: 'graph',
      layout: layoutType.value,
      data: processedData.nodes.map(node => ({
        ...node,
        itemStyle: {
          ...node.itemStyle,
          opacity: nodeOpacity.value
        }
      })),
      links: processedData.links.map(link => ({
        ...link,
        lineStyle: {
          ...link.lineStyle,
          opacity: edgeOpacity.value,
          curveness: edgeCurveness.value,
          color: getEdgeColor(link)
        }
      })),
      categories: processedData.categories,
      roam: {
         scale: [minZoom.value, maxZoom.value],
         move: true
       },
      focusNodeAdjacency: true,
      draggable: props.interactive,
      symbol: 'circle',
      symbolSize: (value, params) => {
        return calculateNodeSize(params.data)
      },
      label: {
        show: showLabels.value,
        position: 'right',
        formatter: '{b}',
        fontSize: labelFontSize.value
      },
      edgeLabel: {
        show: showEdgeLabels.value,
        formatter: '{c}'
      },
      lineStyle: {
        color: 'source',
        curveness: edgeCurveness.value,
        opacity: edgeOpacity.value,
        width: (params) => {
          return calculateEdgeWidth(params)
        }
      },
      emphasis: {
        focus: 'adjacency',
        lineStyle: {
          width: 3
        }
      },
      force: layoutType.value === 'force' ? {
         repulsion: forceRepulsion.value,
         gravity: forceGravity.value,
         edgeLength: forceEdgeLength.value,
         layoutAnimation: true
       } : undefined,
       animationDuration: animationDuration.value,
      animationEasing: 'cubicOut'
    }]
  }
}

// 处理图数据
const processGraphData = (data) => {
  if (!data || !data.nodes || !data.links) {
    return { nodes: [], links: [], categories: [] }
  }
  
  // 处理节点
  const nodes = data.nodes.map(node => ({
    id: node.id,
    name: node.name || node.id,
    category: node.category || node.type || 'default',
    value: node.value || node.degree || 1,
    properties: node.properties || {},
    x: node.x,
    y: node.y,
    itemStyle: {
      color: getNodeColor(node)
    }
  }))
  
  // 处理边
  const links = data.links.map(link => ({
    source: link.source,
    target: link.target,
    value: link.value || link.weight || 1,
    label: link.label || link.type || '',
    lineStyle: {
      width: calculateEdgeWidth(link)
    }
  }))
  
  // 生成分类
  const categorySet = new Set(nodes.map(node => node.category))
  const categories = Array.from(categorySet).map(cat => ({
    name: cat,
    itemStyle: {
      color: colorScheme.type[cat] || colorScheme.type.default
    }
  }))
  
  return { nodes, links, categories }
}

// 计算节点大小
const calculateNodeSize = (node) => {
  const baseSize = 20
  const maxSize = 60
  const minSize = 10
  
  switch (nodeSizeMapping.value) {
    case 'fixed':
      return fixedNodeSize.value
    case 'degree':
      return Math.max(minSize, Math.min(maxSize, baseSize + (node.value || 1) * 2))
    case 'betweenness':
      return Math.max(minSize, Math.min(maxSize, baseSize + (node.betweenness || 0) * 100))
    case 'pagerank':
      return Math.max(minSize, Math.min(maxSize, baseSize + (node.pagerank || 0) * 1000))
    case 'value':
      return Math.max(minSize, Math.min(maxSize, baseSize + (node.value || 1) * 2))
    default:
      return baseSize
  }
}

// 计算边宽度
const calculateEdgeWidth = (edge) => {
  const baseWidth = 1
  const maxWidth = 5
  
  switch (edgeWidthMapping.value) {
    case 'fixed':
      return fixedEdgeWidth.value
    case 'weight':
      return Math.max(baseWidth, Math.min(maxWidth, (edge.value || 1) * 2))
    case 'frequency':
      return Math.max(baseWidth, Math.min(maxWidth, (edge.frequency || 1)))
    default:
      return baseWidth
  }
}

// 获取节点颜色
const getNodeColor = (node) => {
  switch (nodeColorMapping.value) {
    case 'type':
      return colorScheme.type[node.category] || colorScheme.type.default
    case 'community':
      const communityIndex = node.community || 0
      return colorScheme.community[communityIndex % colorScheme.community.length]
    case 'centrality':
      const centrality = node.betweenness || node.pagerank || 0
      const intensity = Math.min(1, centrality * 10)
      return `rgba(255, ${Math.floor(127 * (1 - intensity))}, 0, 0.8)`
    case 'custom':
      return customNodeColor.value
    default:
      return colorScheme.type.default
  }
}

// 获取边颜色
const getEdgeColor = (edge) => {
  switch (edgeColorMapping.value) {
    case 'default':
      return '#999999'
    case 'type':
      return colorScheme.type[edge.type] || '#999999'
    case 'weight':
      const weight = edge.value || 1
      const intensity = Math.min(1, weight / 10)
      return `rgba(25, 118, 210, ${0.3 + intensity * 0.7})`
    case 'custom':
      return customEdgeColor.value
    default:
      return '#999999'
  }
}

// 右键菜单状态
const contextMenu = ref({
  show: false,
  x: 0,
  y: 0,
  node: null
})

// 拖拽状态
const isDragging = ref(false)
const dragStartPos = ref({ x: 0, y: 0 })

// 事件处理
const handleNodeClick = (params) => {
  if (params.dataType === 'node') {
    selectedNode.value = params.data
    emit('node-click', params.data)
    // 隐藏右键菜单
    contextMenu.value.show = false
  }
}

const handleNodeRightClick = (params) => {
  if (params.dataType === 'node') {
    params.event.event.preventDefault()
    contextMenu.value = {
      show: true,
      x: params.event.event.clientX,
      y: params.event.event.clientY,
      node: params.data
    }
  }
}

// 拖拽事件处理
const handleMouseDown = (params) => {
  if (params.dataType === 'node') {
    isDragging.value = true
    dragStartPos.value = { x: params.event.event.clientX, y: params.event.event.clientY }
  }
}

const handleMouseMove = (params) => {
  if (isDragging.value && params.dataType === 'node') {
    // ECharts 内置拖拽处理
  }
}

const handleMouseUp = () => {
  isDragging.value = false
}

const handleResize = () => {
  if (chart.value) {
    chart.value.resize()
  }
}

const handleSearch = () => {
  if (!chart.value || !searchQuery.value.trim()) {
    // 清除高亮
    chart.value.dispatchAction({
      type: 'downplay',
      seriesIndex: 0
    })
    return
  }
  
  // 搜索并高亮节点
  const option = chart.value.getOption()
  const nodes = option.series[0].data
  const matchedNodes = nodes.filter(node => 
    node.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    (node.category && node.category.toLowerCase().includes(searchQuery.value.toLowerCase()))
  )
  
  if (matchedNodes.length > 0) {
    // 高亮所有匹配的节点
    matchedNodes.forEach(matchedNode => {
      const dataIndex = nodes.findIndex(node => node.id === matchedNode.id)
      if (dataIndex !== -1) {
        chart.value.dispatchAction({
          type: 'highlight',
          seriesIndex: 0,
          dataIndex: dataIndex
        })
      }
    })
    
    // 聚焦到第一个匹配的节点
    const firstMatch = matchedNodes[0]
    chart.value.dispatchAction({
      type: 'focusNodeAdjacency',
      seriesIndex: 0,
      dataIndex: nodes.findIndex(node => node.id === firstMatch.id)
    })
  }
}

// 工具栏功能
const resetLayout = () => {
  if (chart.value) {
    chart.value.dispatchAction({
      type: 'graphRoam',
      zoom: 1,
      x: 0,
      y: 0
    })
  }
}

const toggleLegend = () => {
  showLegend.value = !showLegend.value
  
  if (!chart.value) return
  
  const option = chart.value.getOption()
  option.legend = showLegend.value ? {
    show: true,
    orient: 'vertical',
    left: 'right',
    top: 'center',
    data: option.series[0].categories?.map(cat => cat.name) || [],
    textStyle: {
      fontSize: 12
    },
    itemWidth: 14,
    itemHeight: 14
  } : {
    show: false
  }
  
  chart.value.setOption(option, false)
}

const exportImage = () => {
  if (!chart.value) return
  
  try {
    const url = chart.value.getDataURL({
      type: 'png',
      pixelRatio: 2,
      backgroundColor: backgroundColor.value || '#ffffff'
    })
    
    const link = document.createElement('a')
    link.download = `knowledge-graph-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.png`
    link.href = url
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    // 显示成功提示
    console.log('图片导出成功')
  } catch (error) {
    console.error('导出图片失败:', error)
  }
}

const updateLayout = () => {
  emit('layout-change', layoutType.value)
  updateVisualization()
}

const updateVisualization = () => {
  if (!chart.value) return
  
  // 重新计算图表选项
  const option = getChartOption(props.graphData)
  chart.value.setOption(option, true)
}

const updateChart = (data) => {
  const option = getChartOption(data)
  chart.value.setOption(option, true)
}

// 节点操作
const expandNode = () => {
  if (selectedNode.value) {
    emit('node-expand', selectedNode.value)
  }
}

const collapseNode = () => {
  if (selectedNode.value) {
    emit('node-collapse', selectedNode.value)
  }
}

const closeDetail = () => {
  selectedNode.value = null
}

const toggleConfig = () => {
  showConfig.value = !showConfig.value
}

// 右键菜单功能
const viewNodeDetails = (node) => {
  selectedNode.value = node
  contextMenu.value.show = false
  emit('node-click', node)
}

const expandNodeNeighbors = (node) => {
  contextMenu.value.show = false
  emit('node-expand', node)
}

const collapseNodeNeighbors = (node) => {
  contextMenu.value.show = false
  emit('node-collapse', node)
}

const highlightNodePath = (node) => {
  if (!chart.value) return
  
  // 高亮节点及其邻居
  chart.value.dispatchAction({
    type: 'highlight',
    seriesIndex: 0,
    dataIndex: node.dataIndex
  })
  
  // 高亮相关边
  const option = chart.value.getOption()
  const links = option.series[0].links
  const relatedLinks = links.filter(link => 
    link.source === node.id || link.target === node.id
  )
  
  contextMenu.value.show = false
}

const hideNode = (node) => {
  if (!chart.value) return
  
  const option = chart.value.getOption()
  const nodes = option.series[0].data
  const nodeIndex = nodes.findIndex(n => n.id === node.id)
  
  if (nodeIndex !== -1) {
    nodes[nodeIndex].itemStyle = {
      ...nodes[nodeIndex].itemStyle,
      opacity: 0.1
    }
    chart.value.setOption(option)
  }
  
  contextMenu.value.show = false
}

const copyNodeInfo = (node) => {
  const info = {
    id: node.id,
    name: node.name,
    category: node.category,
    properties: node.properties
  }
  
  navigator.clipboard.writeText(JSON.stringify(info, null, 2)).then(() => {
    // 可以添加提示信息
    console.log('节点信息已复制到剪贴板')
  })
  
  contextMenu.value.show = false
}

// 增强的节点展开功能
const expandNodeWithAnimation = (node) => {
  if (!chart.value) return
  
  // 模拟获取邻居节点数据
  const neighborNodes = generateNeighborNodes(node)
  const neighborLinks = generateNeighborLinks(node, neighborNodes)
  
  const option = chart.value.getOption()
  const currentNodes = option.series[0].data
  const currentLinks = option.series[0].links
  
  // 添加新节点和边
  const newNodes = [...currentNodes, ...neighborNodes]
  const newLinks = [...currentLinks, ...neighborLinks]
  
  option.series[0].data = newNodes
  option.series[0].links = newLinks
  
  chart.value.setOption(option, true)
}

// 生成邻居节点（示例数据）
const generateNeighborNodes = (centerNode) => {
  const neighbors = []
  const neighborCount = Math.floor(Math.random() * 5) + 2
  
  for (let i = 0; i < neighborCount; i++) {
    neighbors.push({
      id: `${centerNode.id}_neighbor_${i}`,
      name: `邻居节点 ${i + 1}`,
      category: centerNode.category,
      value: Math.floor(Math.random() * 10) + 1,
      x: centerNode.x + (Math.random() - 0.5) * 200,
      y: centerNode.y + (Math.random() - 0.5) * 200,
      itemStyle: {
        color: getNodeColor({ category: centerNode.category })
      }
    })
  }
  
  return neighbors
}

// 生成邻居连接
const generateNeighborLinks = (centerNode, neighbors) => {
  return neighbors.map(neighbor => ({
    source: centerNode.id,
    target: neighbor.id,
    value: Math.floor(Math.random() * 5) + 1,
    label: '关联'
  }))
}
</script>

<style scoped>
.graph-visualization {
  position: relative;
  width: 100%;
  height: 100%;
  background: #f5f5f5;
  border-radius: 8px;
  overflow: hidden;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: white;
  border-bottom: 1px solid #e0e0e0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.toolbar-left {
  display: flex;
  gap: 8px;
}

.toolbar-right {
  display: flex;
  gap: 8px;
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
  background: #007bff;
  color: white;
}

.btn-primary:hover {
  background: #0056b3;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #545b62;
}

.search-input {
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  width: 200px;
}

.layout-select {
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.config-panel {
  position: absolute;
  top: 60px;
  right: 16px;
  width: 280px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  z-index: 1000;
  padding: 16px;
}

.config-section {
  margin-bottom: 16px;
}

.config-section h4 {
  margin: 0 0 12px 0;
  font-size: 16px;
  color: #333;
}

.config-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.config-item label {
  font-size: 14px;
  color: #666;
}

.config-item select,
.config-item input {
  padding: 4px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 12px;
}

.config-item input[type="range"] {
  flex: 1;
  margin: 0 8px;
}

.config-item span {
  min-width: 40px;
  text-align: right;
  font-size: 12px;
  color: #666;
}

.config-item input[type="color"] {
  width: 40px;
  height: 30px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.range-group {
  display: flex;
  align-items: center;
  margin: 4px 0;
  gap: 8px;
}

.range-group label {
  min-width: 40px;
  font-size: 12px;
  color: #666;
}

.range-group input[type="range"] {
  flex: 1;
}

.range-group span {
  min-width: 30px;
  font-size: 11px;
  color: #999;
}

.chart-container {
  width: 100%;
  height: calc(100% - 60px);
  min-height: 400px;
}

.detail-panel {
  position: absolute;
  top: 60px;
  left: 16px;
  width: 300px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  z-index: 1000;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
  background: #f8f9fa;
  border-radius: 8px 8px 0 0;
}

.detail-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #333;
  background: #e9ecef;
  border-radius: 50%;
}

.detail-content {
  padding: 16px;
}

.detail-item {
  margin-bottom: 12px;
}

.detail-item strong {
  color: #333;
  font-weight: 600;
}

.detail-item ul {
  margin: 8px 0 0 0;
  padding-left: 20px;
}

.detail-item li {
  margin-bottom: 4px;
  font-size: 14px;
  color: #666;
}

.detail-actions {
  display: flex;
  gap: 8px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e0e0e0;
}

.config-toggle-btn {
  position: absolute;
  top: 70px;
  right: 16px;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  cursor: pointer;
  font-size: 18px;
  z-index: 999;
  transition: all 0.2s;
}

.config-toggle-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

/* 右键菜单样式 */
.context-menu {
  position: fixed;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  z-index: 2000;
  min-width: 160px;
  padding: 8px 0;
  border: 1px solid #e0e0e0;
}

.context-menu-item {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
  color: #333;
  transition: background-color 0.2s;
}

.context-menu-item:hover {
  background-color: #f5f5f5;
}

.context-menu-item .icon {
  margin-right: 8px;
  font-size: 16px;
  width: 20px;
  text-align: center;
}

.context-menu-divider {
  height: 1px;
  background-color: #e0e0e0;
  margin: 4px 0;
}

.context-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1999;
  background: transparent;
}

/* 拖拽状态样式 */
.graph-visualization.dragging {
  cursor: grabbing;
}

.graph-visualization.dragging .chart-container {
  pointer-events: none;
}

/* 节点高亮动画 */
@keyframes nodeHighlight {
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

.node-highlighted {
  animation: nodeHighlight 0.6s ease-in-out;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .toolbar {
    flex-direction: column;
    gap: 8px;
  }
  
  .toolbar-left,
  .toolbar-right {
    justify-content: center;
  }
  
  .config-panel {
    width: calc(100% - 32px);
    right: 16px;
    left: 16px;
  }
  
  .detail-panel {
    width: calc(100% - 32px);
    left: 16px;
  }
  
  .search-input {
    width: 150px;
  }
}

@media (max-width: 480px) {
  .toolbar {
    padding: 8px;
  }
  
  .btn {
    padding: 4px 8px;
    font-size: 12px;
  }
  
  .search-input {
    width: 120px;
    font-size: 12px;
  }
  
  .context-menu {
    min-width: 140px;
  }
  
  .context-menu-item {
    padding: 6px 12px;
    font-size: 12px;
  }
}
</style>