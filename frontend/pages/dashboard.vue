<template>
  <div>
    <h1>数据可视化总览</h1>
    <div class="grid-container">
      <div class="chart-container">
        <h2>知识图谱 (力导向图)</h2>
        <GraphChart :nodes="graphData.nodes" :links="graphData.links" @node-dblclick="handleNodeDblClick" />
      </div>
      <div class="chart-container">
        <h2>诈骗类型分布 (饼图)</h2>
        <div id="pie-chart-scam-types"></div>
      </div>
      <div class="chart-container">
        <h2>诈骗手法使用频次 (饼图)</h2>
        <div id="pie-chart-scam-methods"></div>
      </div>
      <div class="chart-container">
        <h2>情感触发点 (词云)</h2>
        <div id="wordcloud-chart"></div>
      </div>
      <div class="chart-container">
        <h2>诈骗流程 (桑基图)</h2>
        <div id="sankey-chart"></div>
      </div>
      <div class="chart-container">
        <h2>近年诈骗案件数 (柱状图)</h2>
        <div id="bar-chart-case-numbers"></div>
      </div>
      <div class="chart-container">
        <h2>用户成就完成度 (横向柱状图)</h2>
        <div id="horizontal-bar-chart-achievement"></div>
      </div>
      <div class="chart-container">
        <h2>用户防骗能力 (雷达图)</h2>
        <div id="radar-chart-user-ability"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import * as echarts from 'echarts';
import 'echarts-wordcloud';
import GraphChart from '~/components/GraphChart.vue';

// --- Force-Directed Graph Data ---
const graphData = ref({
  nodes: [
    { id: '1', name: '网络诈骗', category: '诈骗类型' },
    { id: '2', name: '电信诈骗', category: '诈骗类型' },
    { id: '3', name: '钓鱼邮件', category: '诈骗手法' },
    { id: '4', name: '假冒公检法', category: '诈骗手法' },
    { id: '5', name: '刷单', category: '诈骗手法' },
    { id: '6', name: '受害者', category: '角色' },
    { id: '7', name: '诈骗团伙', category: '角色' },
  ],
  links: [
    { source: '1', target: '3', label: { formatter: '包含' } },
    { source: '1', target: '5', label: { formatter: '包含' } },
    { source: '2', target: '4', label: { formatter: '包含' } },
    { source: '3', target: '6', label: { formatter: '针对' } },
    { source: '4', target: '6', label: { formatter: '针对' } },
    { source: '7', target: '1', label: { formatter: '实施' } },
    { source: '7', target: '2', label: { formatter: '实施' } },
  ]
});

const handleNodeDblClick = (nodeId) => {
  console.log(`Node ${nodeId} double-clicked`);
};

// --- Pie Chart Data ---
const scamTypeData = ref([
  { value: 335, name: '网络钓鱼' },
  { value: 310, name: '冒充公检法' },
  { value: 234, name: '刷单诈骗' },
  { value: 135, name: '投资理财' },
  { value: 1548, name: '其他' }
]);

const scamMethodData = ref([
  { value: 400, name: '虚假链接' },
  { value: 350, name: '电话恐吓' },
  { value: 300, name: '高回报承诺' },
  { value: 250, name: '索要验证码' },
  { value: 200, name: '其他' }
]);

// --- Word Cloud Data ---
const wordCloudData = ref([
    { name: '银行', value: 100 },
    { name: '验证码', value: 95 },
    { name: '投资', value: 90 },
    { name: '紧急', value: 85 },
    { name: '亲人', value: 80 },
    { name: '中奖', value: 75 },
    { name: '官方', value: 70 },
    { name: '客服', value: 65 },
    { name: '退款', value: 60 },
    { name: '链接', value: 55 },
    { name: '涉案', value: 50 },
]);

// --- Sankey Chart Data ---
const sankeyData = ref({
    nodes: [
        { name: '短信' }, { name: '电话' },
        { name: '刷单' }, { name: '投资' },
        { name: '高回报' }, { name: '假冒身份' }
    ],
    links: [
        { source: '短信', target: '刷单', value: 8 },
        { source: '短信', target: '投资', value: 5 },
        { source: '电话', target: '投资', value: 7 },
        { source: '电话', target: '假冒身份', value: 10 },
        { source: '刷单', target: '高回报', value: 8 },
        { source: '投资', target: '高回报', value: 12 },
    ]
});

// --- Bar Chart Data ---
const barChartData = ref({
    categories: ['2019', '2020', '2021', '2022', '2023'],
    series: [
        { name: '立案数', data: [210, 250, 280, 320, 350] },
        { name: '受理数', data: [300, 340, 380, 410, 450] }
    ]
});

onMounted(() => {
  // --- Initialize Pie Chart: Scam Types ---
  const pieChartScamTypes = echarts.init(document.getElementById('pie-chart-scam-types'));
  pieChartScamTypes.setOption({
    tooltip: { trigger: 'item' },
    legend: { top: '5%', left: 'center' },
    series: [{
      name: '诈骗类型',
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: { show: false, position: 'center' },
      emphasis: {
        label: { show: true, fontSize: '20', fontWeight: 'bold' }
      },
      labelLine: { show: false },
      data: scamTypeData.value
    }]
  });

  // --- Initialize Pie Chart: Scam Methods ---
  const pieChartScamMethods = echarts.init(document.getElementById('pie-chart-scam-methods'));
  pieChartScamMethods.setOption({
    tooltip: { trigger: 'item' },
    legend: { top: '5%', left: 'center' },
    series: [{
      name: '诈骗手法',
      type: 'pie',
      radius: '50%',
      data: scamMethodData.value,
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  });

  // --- Initialize Word Cloud ---
  const wordCloudChart = echarts.init(document.getElementById('wordcloud-chart'));
  wordCloudChart.setOption({
    series: [{
        type: 'wordCloud',
        shape: 'circle',
        data: wordCloudData.value,
        textStyle: {
            fontFamily: 'sans-serif',
            fontWeight: 'bold',
            color: function () {
                return 'rgb(' + [
                    Math.round(Math.random() * 160),
                    Math.round(Math.random() * 160),
                    Math.round(Math.random() * 160)
                ].join(',') + ')';
            }
        },
    }]
  });

  // --- Initialize Sankey Chart ---
  const sankeyChart = echarts.init(document.getElementById('sankey-chart'));
  sankeyChart.setOption({
    tooltip: { trigger: 'item', triggerOn: 'mousemove' },
    series: [{
        type: 'sankey',
        data: sankeyData.value.nodes,
        links: sankeyData.value.links,
        emphasis: { focus: 'adjacency' },
        lineStyle: { color: 'gradient', curveness: 0.5 }
    }]
  });

  // --- Initialize Bar Chart ---
  const barChart = echarts.init(document.getElementById('bar-chart-case-numbers'));
  barChart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['立案数', '受理数'] },
    xAxis: { type: 'category', data: barChartData.value.categories },
    yAxis: { type: 'value' },
    series: barChartData.value.series.map(s => ({ ...s, type: 'bar' }))
  });
});
</script>
