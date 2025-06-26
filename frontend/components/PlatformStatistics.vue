<template>
  <div class="statistics-container">
    <h2 class="section-title">诈骗数据分析</h2>
    
    <div v-if="isLoading" class="loading-indicator">
      <p>正在加载数据分析...</p>
    </div>
    
    <div v-else-if="error" class="error-message">
      <p>{{ error }}</p>
    </div>
    
    <div v-else class="statistics-grid">
      <!-- 诈骗类型分布饼图 -->
      <div class="chart-card">
        <h3>诈骗类型分布</h3>
        <div ref="fraudTypeChartRef" class="chart"></div>
      </div>
      
      <!-- 诈骗手法使用频次饼图 -->
      <div class="chart-card">
        <h3>诈骗手法频次</h3>
        <div ref="tacticFrequencyChartRef" class="chart"></div>
      </div>
      
      <!-- 情感触发点饼图 (原词云) -->
      <div class="chart-card">
        <h3>情感触发点分布</h3>
        <div ref="emotionalTriggersChartRef" class="chart"></div>
      </div>
      
      <!-- 刑事诈骗案件数柱状图 -->
      <div class="chart-card wide">
        <h3>刑事诈骗案件数量趋势 (2015-2023)</h3>
        <div ref="fraudCasesChartRef" class="chart"></div>
      </div>
      
      <!-- 诈骗流程桑基图 -->
      <div class="chart-card wide">
        <h3>诈骗流程分析</h3>
        <div ref="fraudFlowChartRef" class="chart"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue';
import { useStatisticsStore } from '~/stores/statistics';
import { storeToRefs } from 'pinia';
import * as echarts from 'echarts/core';
import { PieChart, BarChart, SankeyChart } from 'echarts/charts';
import { GraphicComponent, TooltipComponent, LegendComponent, GridComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

// 注册必要的组件
echarts.use([PieChart, BarChart, SankeyChart, GraphicComponent, TooltipComponent, LegendComponent, GridComponent, CanvasRenderer]);

const statisticsStore = useStatisticsStore();
const { platformStats, isLoadingPlatform, platformError } = storeToRefs(statisticsStore);

// 图表DOM引用
const fraudTypeChartRef = ref(null);
const tacticFrequencyChartRef = ref(null);
const emotionalTriggersChartRef = ref(null);
const fraudCasesChartRef = ref(null);
const fraudFlowChartRef = ref(null);

// 图表实例
const fraudTypeChart = ref(null);
const tacticFrequencyChart = ref(null);
const emotionalTriggersChart = ref(null);
const fraudCasesChart = ref(null);
const fraudFlowChart = ref(null);

// 简化的访问
const isLoading = isLoadingPlatform;
const error = platformError;

// 初始化图表
onMounted(async () => {
  console.log('PlatformStatistics组件已挂载');
  
  // 获取数据
  await statisticsStore.fetchPlatformStatistics();
  
  // 等待DOM更新
  await nextTick();
  
  // 确保DOM元素存在
  if (!fraudTypeChartRef.value || !tacticFrequencyChartRef.value || 
      !emotionalTriggersChartRef.value || !fraudCasesChartRef.value || 
      !fraudFlowChartRef.value) {
    console.error('图表DOM引用不存在');
    return;
  }
  
  console.log('初始化图表实例');
  // 初始化图表实例
  try {
    fraudTypeChart.value = echarts.init(fraudTypeChartRef.value);
    tacticFrequencyChart.value = echarts.init(tacticFrequencyChartRef.value);
    emotionalTriggersChart.value = echarts.init(emotionalTriggersChartRef.value);
    fraudCasesChart.value = echarts.init(fraudCasesChartRef.value);
    fraudFlowChart.value = echarts.init(fraudFlowChartRef.value);
    
    console.log('图表实例初始化成功');
    
    // 如果数据已经加载，立即渲染图表
    if (platformStats.value && !isLoading.value) {
      console.log('数据已加载，立即渲染图表');
      renderAllCharts();
    }
  } catch (e) {
    console.error('图表初始化失败:', e);
  }
  
  // 窗口大小变化时重新调整图表大小
  window.addEventListener('resize', handleResize);
});

// 监听数据变化，更新图表
watch(() => platformStats.value, (newStats) => {
  console.log('平台统计数据更新:', newStats);
  if (!newStats) {
    console.warn('平台统计数据为空');
    return;
  }
  
  renderAllCharts();
}, { deep: true });

// 渲染所有图表
const renderAllCharts = () => {
  console.log('开始渲染所有图表');
  renderFraudTypeChart();
  renderTacticFrequencyChart();
  renderEmotionalTriggersChart();
  renderFraudCasesChart();
  renderFraudFlowChart();
};

// 处理窗口大小变化
const handleResize = () => {
  fraudTypeChart.value?.resize();
  tacticFrequencyChart.value?.resize();
  emotionalTriggersChart.value?.resize();
  fraudCasesChart.value?.resize();
  fraudFlowChart.value?.resize();
};

// 渲染诈骗类型分布饼图
const renderFraudTypeChart = () => {
  const data = platformStats.value.fraudTypeDistribution;
  if (!data || !data.length || !fraudTypeChart.value) {
    console.warn('诈骗类型数据不完整或图表实例不存在');
    return;
  }
  
  console.log('渲染诈骗类型分布图表:', data);
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      data: data.map(item => item.name)
    },
    series: [
      {
        name: '诈骗类型',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '18',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: data
      }
    ]
  };
  
  try {
    fraudTypeChart.value.setOption(option);
    console.log('诈骗类型分布图表渲染成功');
  } catch (e) {
    console.error('诈骗类型分布图表渲染失败:', e);
  }
};

// 渲染诈骗手法使用频次饼图
const renderTacticFrequencyChart = () => {
  const data = platformStats.value.tacticFrequency;
  if (!data || !data.length || !tacticFrequencyChart.value) {
    console.warn('诈骗手法数据不完整或图表实例不存在');
    return;
  }
  
  console.log('渲染诈骗手法频次图表:', data);
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      data: data.map(item => item.name)
    },
    series: [
      {
        name: '诈骗手法',
        type: 'pie',
        radius: '60%',
        center: ['50%', '50%'],
        data: data,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  };
  
  try {
    tacticFrequencyChart.value.setOption(option);
    console.log('诈骗手法频次图表渲染成功');
  } catch (e) {
    console.error('诈骗手法频次图表渲染失败:', e);
  }
};

// 渲染情感触发点饼图 (原词云)
const renderEmotionalTriggersChart = () => {
  const data = platformStats.value.emotionalTriggers;
  if (!data || !data.length || !emotionalTriggersChart.value) {
    console.warn('情感触发点数据不完整或图表实例不存在');
    return;
  }
  
  console.log('渲染情感触发点图表:', data);
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      data: data.map(item => item.name)
    },
    series: [
      {
        name: '情感触发点',
        type: 'pie',
        radius: '60%',
        center: ['50%', '50%'],
        data: data,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        label: {
          show: true,
          formatter: '{b}: {c}'
        }
      }
    ]
  };
  
  try {
    emotionalTriggersChart.value.setOption(option);
    console.log('情感触发点图表渲染成功');
  } catch (e) {
    console.error('情感触发点图表渲染失败:', e);
  }
};

// 渲染刑事诈骗案件数柱状图
const renderFraudCasesChart = () => {
  const data = platformStats.value.fraudCasesYearly;
  if (!data || !data.length || !fraudCasesChart.value) {
    console.warn('刑事诈骗案件数据不完整或图表实例不存在');
    return;
  }
  
  console.log('渲染刑事诈骗案件数图表:', data);
  
  const years = data.map(item => item.year);
  const reportedCases = data.map(item => item.reported_cases);
  const filedCases = data.map(item => item.filed_cases);
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['报案数量', '立案数量']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: years
    },
    yAxis: {
      type: 'value',
      name: '案件数量',
      axisLabel: {
        formatter: function(value) {
          if (value >= 1000000) {
            return (value / 1000000).toFixed(1) + 'M';
          } else if (value >= 1000) {
            return (value / 1000).toFixed(0) + 'K';
          }
          return value;
        }
      }
    },
    series: [
      {
        name: '报案数量',
        type: 'bar',
        data: reportedCases
      },
      {
        name: '立案数量',
        type: 'bar',
        data: filedCases
      }
    ]
  };
  
  try {
    fraudCasesChart.value.setOption(option);
    console.log('刑事诈骗案件数图表渲染成功');
  } catch (e) {
    console.error('刑事诈骗案件数图表渲染失败:', e);
  }
};

// 渲染诈骗流程桑基图
const renderFraudFlowChart = () => {
  const data = platformStats.value.fraudFlow;
  if (!data || !data.nodes || !data.nodes.length || !fraudFlowChart.value) {
    console.warn('诈骗流程数据不完整或图表实例不存在');
    return;
  }
  
  console.log('渲染诈骗流程桑基图:', data);
  
  const option = {
    tooltip: {
      trigger: 'item',
      triggerOn: 'mousemove'
    },
    series: [
      {
        type: 'sankey',
        data: data.nodes,
        links: data.links,
        emphasis: {
          focus: 'adjacency'
        },
        levels: [
          {
            depth: 0,
            itemStyle: {
              color: '#fbb4ae'
            },
            lineStyle: {
              color: 'source',
              opacity: 0.6
            }
          },
          {
            depth: 1,
            itemStyle: {
              color: '#b3cde3'
            },
            lineStyle: {
              color: 'source',
              opacity: 0.6
            }
          },
          {
            depth: 2,
            itemStyle: {
              color: '#ccebc5'
            },
            lineStyle: {
              color: 'source',
              opacity: 0.6
            }
          }
        ],
        lineStyle: {
          curveness: 0.5
        }
      }
    ]
  };
  
  try {
    fraudFlowChart.value.setOption(option);
    console.log('诈骗流程桑基图渲染成功');
  } catch (e) {
    console.error('诈骗流程桑基图渲染失败:', e);
  }
};
</script>

<style scoped>
.statistics-container {
  padding: 20px;
  background-color: var(--background-color);
  border-radius: 15px;
}

.section-title {
  text-align: center;
  color: var(--primary-color);
  margin-bottom: 20px;
}

.statistics-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.chart-card {
  background-color: var(--surface-color);
  border-radius: 10px;
  padding: 15px;
  box-shadow: 0 4px 12px var(--shadow-color);
}

.chart-card.wide {
  grid-column: span 2;
}

.chart {
  width: 100%;
  height: 300px;
  border: 1px solid #eee; /* 添加边框以便于调试 */
}

.loading-indicator, .error-message {
  text-align: center;
  padding: 40px;
  font-size: 1.2em;
}

.error-message {
  color: #e53e3e;
}

@media (max-width: 768px) {
  .statistics-grid {
    grid-template-columns: 1fr;
  }
  
  .chart-card.wide {
    grid-column: span 1;
  }
}
</style> 