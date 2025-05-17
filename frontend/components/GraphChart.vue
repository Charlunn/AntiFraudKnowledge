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

    // 从 CSS 变量中获取颜色值 (注意：这里是模拟获取，实际应用中需要通过 JS 获取 CSS 变量或使用一个共享的颜色配置)
    // 为了简单起见，我们继续使用硬编码，但确保它们与 main.css 中的变量一致
    const primaryColor = '#00dc82'; // 与 main.css 中的 --primary-color 一致
    const primaryColorDark = '#00b067'; // 与 main.css 中的 --primary-color-dark 一致
    const surfaceColor = '#ffffff'; // 与 main.css 中的 --surface-color 一致
    const textColor = '#333333'; // 与 main.css 中的 --text-color 一致
    const subtleTextColor = '#666666'; // 与 main.css 中的 --subtle-text-color 一致
    const borderColor = '#eeeeee'; // 与 main.css 中的 --border-color 一致
    const shadowColor = 'rgba(0, 0, 0, 0.05)'; // 与 main.css 中的 --shadow-color 一致
    const hoverShadowColor = 'rgba(0, 0, 0, 0.1)'; // 与 main.css 中的 --hover-shadow-color 一致


    const option = {
        title: {
            text: props.title,
            textStyle: { // 标题样式
                color: textColor, // 使用主题文字颜色
                fontSize: 20, // 稍微增大字号
                fontWeight: 'bold'
            },
            left: 'center',
            top: '15px' // 标题位置
        },
        tooltip: {
            formatter: (params) => {
                if (params.dataType === 'node') {
                    // 显示节点属性信息
                    const props = params.data.properties || {};
                    let tooltipText = `<div style="padding: 10px; border-radius: 8px; background-color: ${surfaceColor}; box-shadow: 0 2px 8px ${shadowColor}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; color: ${textColor};">`;
                    tooltipText += `<b>${params.data.name || params.data.id}</b><br/>`;
                    tooltipText += `Category: ${params.data.category || 'N/A'}<br/>`;
                    // 遍历 properties 对象并显示
                    for (const key in props) {
                        if (Object.hasOwnProperty.call(props, key) && key !== 'name' && key !== 'id' && key !== 'calculated_id') {
                            let value = props[key];
                            if (typeof value === 'string' && (value.startsWith('[') || value.startsWith('{'))) {
                                try {
                                    value = JSON.parse(value.replace(/\'/g, '\"'));
                                    value = JSON.stringify(value, null, 2);
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
                    return `<div style="padding: 8px; border-radius: 6px; background-color: ${surfaceColor}; box-shadow: 0 1px 4px ${shadowColor}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; color: ${textColor};">Relation: <b>${params.data.label?.formatter || params.data.type || 'Unknown'}</b></div>`;
                }
                return '';
            },
            backgroundColor: 'transparent',
            borderWidth: 0,
            extraCssText: 'box-shadow: none;'
        },
        // legend: [{ // 如果需要显示图例
        //   data: categories.map(a => a.name),
        //   orient: 'vertical',
        //   left: 'left',
        //   textStyle: { // 图例文字样式
        //      color: textColor
        //   }
        // }],
        animationDuration: 2000, // 增加动画时长，使入场效果更明显
        animationEasingUpdate: 'cubicInOut', // 更改布局更新动画缓动函数
        series: [
            {
                name: 'Knowledge Graph',
                type: 'graph',
                layout: 'force',
                // layout: 'circular', // 也可以尝试环形布局
                data: props.nodes.map(node => ({
                    ...node,
                    itemStyle: {
                        color: primaryColor, // 默认颜色，使用主题色
                        shadowBlur: 8,
                        shadowColor: shadowColor,
                        borderColor: surfaceColor,
                        borderWidth: 1
                    },
                    label: {
                        show: true,
                        position: 'right',
                        formatter: '{b}',
                        color: textColor, // 标签颜色使用主题文字颜色
                        fontSize: 12,
                        fontWeight: 'normal'
                    },
                    symbol: 'circle',
                    symbolSize: node.symbolSize || 30,
                    emphasis: {
                        label: {
                            // label styles on emphasis
                            show: true,
                            position: 'right',
                            formatter: '{b}',
                            fontWeight: 'bold',
                            fontSize: 14,
                            color: textColor // 高亮时标签颜色使用主题文字颜色
                        },
                        itemStyle: {
                            // itemStyle on emphasis
                            scale: 1.2, // Make node 20% larger on hover
                            shadowBlur: 15, shadowColor: hoverShadowColor
                        }
                    }
                })),
                links: props.links.map(link => ({
                    ...link,
                    label: {
                        ...link.label,
                        formatter: link.label?.formatter || link.type, 
                        show: true,
                        position: 'middle',
                        color: subtleTextColor, // 标签颜色使用中灰色文字颜色
                        fontSize: 10
                    },
                    lineStyle: {
                        // line style
                        color: subtleTextColor, // 默认边的颜色，使用中灰色文字颜色
                        curveness: 0.1,
                        width: 2,
                        opacity: 0.8
                    },
                    emphasis: {
                        // emphasis line style
                        lineStyle: {
                            width: 3,
                            color: link.emphasisColor || primaryColorDark, // 高亮颜色，使用主题深色 
                            shadowBlur: 5,
                            shadowColor: shadowColor
                        },
                        label: {
                            show: true,
                            fontWeight: 'bold',
                            color: textColor // 高亮时标签颜色使用主题文字颜色
                        }
                    }
                })),
                categories: categories,
                roam: true,
                draggable: true,
                force: { // Force layout parameters
                    initLayout: 'circular', // Optional: Initial layout before force simulation
                    repulsion: 500,
                    edgeLength: [120, 300],
                    gravity: 0.1,
                    friction: 0.9,
                    // layoutAnimation: true
                },
                emphasis: {
                    focus: 'adjacency',
                }
            }
        ]
    };

    chartInstance.value.setOption(option, true);
};

// 监听 props 变化，更新图表
watch(() => [props.nodes, props.links], () => {
    nextTick(() => {
        setOptions();
    });
}, { deep: true });

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
/* frontend/components/GraphChart.vue 的样式 - ECharts 容器样式 */

div {
    border-radius: 15px; /* 添加圆角，与主内容区域一致 */
    overflow: hidden; /* 确保圆角生效 */
    box-shadow: 0 8px 24px var(--shadow-color); /* 添加阴影，与主内容区域一致 */
    background-color: var(--surface-color); /* 应用表面色，作为图表背景 */
    /* 确保容器本身不影响布局，flex-grow 由父元素控制 */
    flex-grow: 1; /* 让容器占据父元素的可用空间 */
}

/* ECharts 内部元素的样式主要通过 option 配置控制 */
</style>
