# 反诈知识图谱前端

本目录包含基于 **Nuxt 3 + Vite + TypeScript + TailwindCSS** 的反诈知识图谱界面。页面采用 shadcn-vue 风格组件与 Cytoscape.js 图谱渲染，默认提供中文与英文双语。

## 环境要求

- Node.js ≥ 18.17
- npm ≥ 9（或 pnpm ≥ 8、yarn ≥ 1.22）

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器（默认 http://localhost:3000）
npm run dev

# 生产构建
npm run build
npm run preview
```

## 主要特性

- 基于 Cytoscape.js 的动态图谱，可切换力导向/层级/时间线布局
- shadcn-vue 风格组件：支持 Top App Bar、Drawer、Tabs 等交互
- Pinia 管理图谱、场景向导与 UI 状态；提供 mock 数据与导出/分享模拟
- vue-i18n 提供中英双语，所有文案均可本地化
- TailwindCSS + Motion One 实现响应式与动效

## 目录结构

```
/components/fraud-graph  # 页面模块化组件
/composables             # 分享、导出、时间线等组合式函数
/mocks/graph             # 图谱与洞察 mock 数据
/stores                  # Pinia 状态（图谱/UI/场景）
/pages/graph.vue         # 主页面入口
/locales                 # 中英文文案资源
```

## 开发建议

- 新增图谱数据或来源时，更新 `mocks/graph` 与 `locales/*/graph.json`
- 若接入真实接口，可在 `stores/useGraphStore.ts` 中替换 `initialize`/`expandNode` 等方法
- 统一使用 `$t('graph.xxx')` 完成文案渲染，保持 i18n 可维护性

欢迎根据业务需求拓展高级分析、导出格式或接入真实 API。祝开发顺利！
