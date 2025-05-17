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

  // 处理窗口大小变化，调整图表大小
  const handleResize = () => {
    chartInstance.value?.resize();
  };

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
      // 销毁旧的事件监听器，防止重复绑定
      chartInstance.value.off('dblclick');
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
        textStyle: { // 标题样式
          color: '#333', // 使用深色文字
          fontSize: 18,
          fontWeight: 'bold'
        },
        left: 'center',
        top: '10px' // 标题位置
      },
      tooltip: {
          formatter: (params) => {
              if (params.dataType === 'node') {
                  // 显示节点属性信息
                  const props = params.data.properties || {};
                  let tooltipText = `<div style="padding: 10px; border-radius: 8px; background-color: rgba(255, 255, 255, 0.9); box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">`; // 添加圆角和阴影
                  tooltipText += `<b>${params.data.name || params.data.id}</b><br/>`;
                  tooltipText += `Category: ${params.data.category || 'N/A'}<br/>`;
                   // 遍历 properties 对象并显示
                   for (const key in props) {
                       if (Object.hasOwnProperty.call(props, key) && key !== 'name' && key !== 'id' && key !== 'calculated_id') { // 避免重复显示 name/id
                            // 尝试解析 JSON 字符串的属性 (例如 aliases)
                           let value = props[key];
                           if (typeof value === 'string' && (value.startsWith('[') || value.startsWith('{'))) {
                              try {
                                  value = JSON.parse(value.replace(/\'/g, '\"')); // 处理单引号 JSON
                                  value = JSON.stringify(value, null, 2); // 格式化显示
                                  // 对于 JSON 格式化后的内容，可能需要预标签来保留格式
                                  value = `<pre style="margin: 0; white-space: pre-wrap;">${value}</pre>`;
                              } catch (e) {
                                  // 解析失败，显示原始字符串
                              }
                           }
                           tooltipText += `${key}: ${value}<br/>`;
                       }
                   }
                   tooltipText += `</div>`;
                   return tooltipText;
              } else if (params.dataType === 'edge') {
                  // 显示关系信息
                  return `<div style="padding: 8px; border-radius: 6px; background-color: rgba(255, 255, 255, 0.9); box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);">Relation: <b>${params.data.label?.formatter || params.data.type || 'Unknown'}</b></div>`; // 添加圆角和阴影
              }
              return '';
          },
          backgroundColor: 'transparent', // 将 tooltip 背景设为透明，使用 formatter 内部的 div 背景
          borderWidth: 0, // 移除 tooltip 边框
          extraCssText: 'box-shadow: none;' // 确保 tooltip 容器没有额外的阴影
      },
      // legend: [{ // 如果需要显示图例
      //   data: categories.map(a => a.name),
      //   orient: 'vertical',
      //   left: 'left',
      //   textStyle: { // 图例文字样式
      //      color: '#666'
      //   }
      // }],
       animationDuration: 1500, // 初始动画时长
       animationEasingUpdate: 'quinticInOut', // 数据更新动画效果
      series: [
        {
          name: 'Knowledge Graph',
          type: 'graph',
          layout: 'force',
          // layout: 'circular', // 也可以尝试环形布局
          data: props.nodes.map(node => ({ // 确保 id, name, category, symbolSize, value 都在顶层
               ...node, // 展开原始节点数据
               itemStyle: { // 可以根据 category 或其他属性设置样式
                  color: node.color || '#4a90e2', // 默认颜色，可以使用变量或具体颜色值
                  shadowBlur: 8, // 节点阴影
                  shadowColor: 'rgba(0, 0, 0, 0.3)',
                  borderColor: '#ffffff', // 节点边框
                  borderWidth: 1
               },
               label: { // 节点标签设置 (优先级高于 series 顶层 label)
                show: true,
                position: 'right',
                formatter: '{b}', // 显示节点的 name ('{b}')
                color: '#333', // 标签颜色
                fontSize: 12,
                fontWeight: 'normal'
               },
               symbol: 'circle', // 节点形状，设置为圆形
               symbolSize: node.symbolSize || 25, // 节点大小略微增大
               emphasis: { // 节点高亮状态
                 label: {
                   show: true,
                   position: 'right',
                   formatter: '{b}',
                   fontWeight: 'bold',
                   fontSize: 14, // 高亮时字体更大
                   color: '#000'
                 },
                 itemStyle: { ...node.itemStyle, shadowBlur: 15, shadowColor: 'rgba(0, 0, 0, 0.6)' } // 高亮时阴影更明显
               }
          })),
          links: props.links.map(link => ({ // 确保 source, target, label, lineStyle 都在顶层
              ...link, // 展开原始链接数据
               label: {
                  ...link.label,
                  formatter: link.label?.formatter || link.type, // 优先用 formatter，其次用 type
                  show: true, // 默认显示边的标签
                  position: 'middle', // 标签位置
                  color: '#666', // 标签颜色
                  fontSize: 10
               },
               lineStyle: { // 边的样式
                 color: link.color || '#999999', // 默认边的颜色，使用浅灰色
                 curveness: 0.1, // 边的弯曲度
                 width: 1.5, // 边的粗细
                 opacity: 0.8 // 边的透明度
               },
               emphasis: { // 边高亮状态
                 lineStyle: {
                   width: 2.5, // 高亮时边更粗
                   color: link.emphasisColor || '#4a90e2', // 高亮颜色，使用主题色
                   shadowBlur: 5,
                   shadowColor: 'rgba(0, 0, 0, 0.5)'
                 },
                 label: { // 边高亮时的标签样式
                     show: true,
                     fontWeight: 'bold',
                     color: '#000'
                 }
               }
          })),
          categories: categories, // 绑定 categories
          roam: true, // 开启鼠标缩放和平移漫游
          force: { // 力引导布局配置
            repulsion: 300, // 节点之间的斥力因子，增大可以使节点更分散
            edgeLength: [100, 200], // 边的两个节点之间的距离范围
            gravity: 0.15, // 节点受到的向中心的引力因子，增大可以使节点更聚拢
            // layoutAnimation: true // 是否开启布局动画
          },
          emphasis: { // 高亮状态
              focus: 'adjacency', // 高亮相邻节点和边 // 或者 'series' 高亮整个系列
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
    window.addEventListener('resize', handleResize);
    initChart();
  });

  // 组件卸载前销毁 ECharts 实例
  onBeforeUnmount(() => {
    window.removeEventListener('resize', handleResize);
    if (chartInstance.value) {
      chartInstance.value.dispose();
      chartInstance.value = null;
    }
  });
  </script>

  <style scoped>
  /* 容器样式 */
  div {
    border-radius: 15px; /* 添加圆角，与主内容区域一致 */
    overflow: hidden; /* 确保圆角生效 */
    /* border: none; /* 移除或调整边框 */
    box-shadow: 0 4px 12px var(--shadow-color); /* 添加阴影，与主内容区域一致 */
    background-color: var(--surface-color); /* 应用表面色，作为图表背景 */
  }

  /* ECharts 内部元素的样式主要通过 option 配置控制 */
  /* 如果需要更细粒度的控制，可能需要自定义渲染或使用 ECharts 提供的事件 */

  </style>
