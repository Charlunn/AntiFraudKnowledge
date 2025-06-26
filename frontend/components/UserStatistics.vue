<template>
  <div class="user-statistics-container">
    <h2 class="section-title">个人防骗能力分析</h2>
    
    <div v-if="isLoading" class="loading-indicator">
      <p>正在加载数据分析...</p>
    </div>
    
    <div v-else-if="error" class="error-message">
      <p>{{ error }}</p>
    </div>
    
    <div v-else class="statistics-grid">
      <!-- 用户成就完成度横向柱状图 -->
      <div class="chart-card">
        <h3>成就完成度</h3>
        <div ref="achievementsChartRef" class="chart"></div>
      </div>
      
      <!-- 用户防骗能力雷达图 -->
      <div class="chart-card">
        <h3>防骗能力分析</h3>
        <div ref="skillsChartRef" class="chart"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useStatisticsStore } from '~/stores/statistics';
import { storeToRefs } from 'pinia';
import * as echarts from 'echarts/core';
import { BarChart, RadarChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

// 注册必要的组件
echarts.use([BarChart, RadarChart, GridComponent, TooltipComponent, LegendComponent, CanvasRenderer]);

const statisticsStore = useStatisticsStore();
const { userStats, isLoadingUser, userError } = storeToRefs(statisticsStore);

// 图表DOM引用
const achievementsChartRef = ref(null);
const skillsChartRef = ref(null);

// 图表实例
const achievementsChart = ref(null);
const skillsChart = ref(null);

// 简化的访问
const isLoading = isLoadingUser;
const error = userError;

// 初始化图表
onMounted(() => {
  // 获取数据
  statisticsStore.fetchUserStatistics();
  
  // 初始化图表实例
  achievementsChart.value = echarts.init(achievementsChartRef.value);
  skillsChart.value = echarts.init(skillsChartRef.value);
  
  // 窗口大小变化时重新调整图表大小
  window.addEventListener('resize', handleResize);
});

// 监听数据变化，更新图表
watch(() => userStats.value, (newStats) => {
  if (!newStats) return;
  
  renderAchievementsChart();
  renderSkillsChart();
}, { deep: true });

// 处理窗口大小变化
const handleResize = () => {
  achievementsChart.value?.resize();
  skillsChart.value?.resize();
};

// 渲染用户成就完成度横向柱状图
const renderAchievementsChart = () => {
  const achievements = userStats.value.achievements;
  if (!achievements || !achievements.length || !achievementsChart.value) return;
  
  // 排序数据，从高到低
  const sortedData = [...achievements].sort((a, b) => b.progress - a.progress);
  
  const achievementTypes = sortedData.map(item => item.achievement_type);
  const progressValues = sortedData.map(item => item.progress);
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: '{b}: {c}%'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      max: 100,
      axisLabel: {
        formatter: '{value}%'
      }
    },
    yAxis: {
      type: 'category',
      data: achievementTypes,
      axisLabel: {
        interval: 0,
        rotate: 30
      }
    },
    series: [
      {
        name: '完成度',
        type: 'bar',
        data: progressValues,
        itemStyle: {
          color: function(params) {
            // 根据完成度设置不同的颜色
            const value = params.value;
            if (value >= 80) {
              return '#5cb85c'; // 绿色
            } else if (value >= 60) {
              return '#5bc0de'; // 蓝色
            } else if (value >= 40) {
              return '#f0ad4e'; // 黄色
            } else {
              return '#d9534f'; // 红色
            }
          }
        },
        label: {
          show: true,
          position: 'right',
          formatter: '{c}%'
        }
      }
    ]
  };
  
  achievementsChart.value.setOption(option);
};

// 渲染用户防骗能力雷达图
const renderSkillsChart = () => {
  const skills = userStats.value.skills;
  if (!skills || !skills.length || !skillsChart.value) return;
  
  const indicator = skills.map(item => ({
    name: item.skill_type,
    max: 100
  }));
  
  const skillValues = skills.map(item => item.score);
  
  const option = {
    tooltip: {
      trigger: 'item'
    },
    radar: {
      indicator: indicator,
      radius: '70%'
    },
    series: [
      {
        type: 'radar',
        data: [
          {
            value: skillValues,
            name: '能力评分',
            areaStyle: {
              color: 'rgba(0, 220, 130, 0.3)'
            },
            lineStyle: {
              color: '#00dc82'
            },
            itemStyle: {
              color: '#00dc82'
            }
          }
        ]
      }
    ]
  };
  
  skillsChart.value.setOption(option);
};
</script>

<style scoped>
.user-statistics-container {
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

.chart {
  width: 100%;
  height: 300px;
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
}
</style> 