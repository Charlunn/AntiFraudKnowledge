<template>
    <div ref="chartRef" :style="{ height: height, width: width }"></div>
  </template>
  
  <script setup>
  import { ref, onMounted, onBeforeUnmount, watch, shallowRef, nextTick } from 'vue';
  import * as echarts from 'echarts/core';
  import { GraphChart } from 'echarts/charts';
  import {
    TitleComponent,
    TooltipComponent,
    LegendComponent // 如果需要图例
  } from 'echarts/components';
  import { CanvasRenderer } from 'echarts/renderers';
  
  // 注册必须的组件
  echarts.use([
    TitleComponent,
    TooltipComponent,
    LegendComponent,
    GraphChart,
    CanvasRenderer
  ]);
  
  // 定义 props 和 emits
  const props = defineProps({
    nodes: {
      type: Array,
      required: true,
      default: () => []
    },
    links: {
      type: Array,
      required: true,
      default: () => []
    },
    title: {
      type: String,
      default: 'Knowledge Graph'
    },
    width: {
      type: String,
      default: '100%'
    },
    height: {
      type: String,
      default: '600px' // 可以根据需要调整默认高度
    }
  });
  
  const emit = defineEmits(['node-dblclick']); // 定义双击事件
  
  // ECharts 实例和容器引用
  const chartRef = ref(null);
  // 使用 shallowRef 存储 ECharts 实例，避免深度代理带来的性能问题
  const chartInstance = shallowRef(null);
  
  // 初始化 ECharts 图表
  const initChart = () => {
    if (chartRef.value && !chartInstance.value) {
      chartInstance.value = echarts.init(chartRef.value);
      setOptions(); // 初始设置选项
  
      // 监听双击事件
      chartInstance.value.on('dblclick', (params) => {
        // console.log('Double Click Params:', params);
        if (params.dataType === 'node') {
          // console.log('Node double clicked:', params.data);
          // 确保传递的是节点 ID
          if (params.data && params.data.id) {
            emit('node-dblclick', params.data.id);
          } else {
            console.warn("Double-clicked node doesn't have an ID:", params.data);
          }
        }
      });
    }
  };
  
  // 设置或更新 ECharts 选项
  const setOptions = () => {
    if (!chartInstance.value) return;
  
    // 提取所有 category 用于图例 (如果需要)
    const categories = [...new Set(props.nodes.map(node => node.category || 'Default'))]
                        .map(name => ({ name }));
  
  
    const option = {
      title: {
        text: props.title,
        left: 'center'
      },
      tooltip: {
          formatter: (params) => {
              if (params.dataType === 'node') {
                  // 显示节点属性信息
                  const props = params.data.properties || {};
                  let tooltipText = `<b>${params.data.name || params.data.id}</b><br/>`;
                   tooltipText += `Category: ${params.data.category || 'N/A'}<br/>`;
                   // 遍历 properties 对象并显示
                   for (const key in props) {
                       if (Object.hasOwnProperty.call(props, key) && key !== 'name' && key !== 'id' && key !== 'calculated_id') { // 避免重复显示 name/id
                            // 尝试解析 JSON 字符串的属性 (例如 aliases)
                           let value = props[key];
                           if (typeof value === 'string' && (value.startsWith('[') || value.startsWith('{'))) {
                              try {
                                  value = JSON.parse(value.replace(/'/g, '"')); // 处理单引号 JSON
                                  value = JSON.stringify(value, null, 2); // 格式化显示
                              } catch (e) {
                                  // 解析失败，显示原始字符串
                              }
                           }
                           tooltipText += `${key}: ${value}<br/>`;
                       }
                   }
                   return tooltipText;
              } else if (params.dataType === 'edge') {
                  // 显示关系信息
                  return `Relation: ${params.data.label?.formatter || params.data.type || 'Unknown'}`;
              }
              return '';
          }
      },
      // legend: [{ // 如果需要显示图例
      //   data: categories.map(a => a.name),
      //   orient: 'vertical',
      //   left: 'left'
      // }],
      series: [
        {
          name: 'Knowledge Graph',
          type: 'graph',
          layout: 'force', // 或者 'circular'
          data: props.nodes.map(node => ({ // 确保 id, name, category, symbolSize, value 都在顶层
               ...node, // 展开原始节点数据
               itemStyle: { // 可以根据 category 或其他属性设置样式
                  // color: getNodeColor(node.category)
               }
          })),
          links: props.links.map(link => ({ // 确保 source, target, label, lineStyle 都在顶层
              ...link, // 展开原始链接数据
               label: {
                  ...link.label,
                  formatter: link.label?.formatter || link.type // 优先用 formatter，其次用 type
               },
          })),
          categories: categories, // 绑定 categories
          roam: true, // 开启鼠标缩放和平移漫游
          label: { // 节点标签设置
            show: true,
            position: 'right',
            formatter: '{b}' // 显示节点的 name ('{b}')
          },
          force: { // 力引导布局配置
            repulsion: 100, // 节点之间的斥力因子
            edgeLength: [50, 100], // 边的两个节点之间的距离，默认为50
            gravity: 0.05 // 节点受到的向中心的引力因子
          },
          emphasis: { // 高亮状态
              focus: 'adjacency', // 高亮相邻节点和边
               lineStyle: {
                  width: 4
              }
          }
        }
      ]
    };
  
    chartInstance.value.setOption(option, true); // true 表示不合并，替换旧配置
  };
  
  // 监听 props 变化，更新图表
  watch(() => [props.nodes, props.links], () => {
     nextTick(() => { // 确保 DOM 更新后再设置选项
          setOptions();
     });
  }, { deep: true }); // 深度监听，因为 nodes/links 是数组/对象
  
  // 组件挂载时初始化
  onMounted(() => {
    initChart();
  });
  
  // 组件卸载前销毁 ECharts 实例
  onBeforeUnmount(() => {
    if (chartInstance.value) {
      chartInstance.value.dispose();
      chartInstance.value = null;
    }
  });
  
  // (可选) 处理窗口大小变化，调整图表大小
  // 可以添加一个 window resize 事件监听器，并调用 chartInstance.value.resize()
  
  </script>
  
  <style scoped>
  /* 可以添加一些基本的样式 */
  div {
    border: 1px solid #eee;
  }
  </style>