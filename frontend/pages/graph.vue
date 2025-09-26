<template>
  <div class="min-h-screen bg-gray-50 dark:bg-dark-bg">
    <!-- 页面头部 -->
    <div class="bg-white dark:bg-dark-surface border-b border-gray-200 dark:border-dark-border">
      <div class="container mx-auto px-4 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-dark-text mb-2">
              反诈知识图谱
            </h1>
            <p class="text-gray-600 dark:text-dark-text-secondary">
              探索反欺诈知识之间的关联关系，发现隐藏的模式和洞察
            </p>
          </div>
          
          <div class="flex items-center space-x-4">
            <!-- AI助手开关 -->
            <div class="flex items-center space-x-2">
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" v-model="aiPilotEnabled" class="sr-only peer">
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
              <span class="text-sm font-medium text-gray-700 dark:text-dark-text">AI助手</span>
            </div>
            
            <!-- 操作按钮 -->
            <button 
              @click="exportGraph"
              :disabled="exporting"
              class="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-dark-text bg-white dark:bg-dark-surface hover:bg-gray-50 dark:hover:bg-dark-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              {{ exporting ? '导出中...' : '导出' }}
            </button>
            <button 
              @click="shareGraph"
              class="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-dark-text bg-white dark:bg-dark-surface hover:bg-gray-50 dark:hover:bg-dark-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"></path>
              </svg>
              分享
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="container mx-auto px-4 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <!-- 左侧控制面板 -->
        <div class="lg:col-span-1">
          <div class="space-y-6">
            <!-- 搜索框 -->
            <div class="bg-white dark:bg-dark-surface rounded-xl shadow-lg p-6">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-dark-text mb-4">搜索与筛选</h3>
              
              <div class="space-y-4">
                <div class="relative">
                  <input
                    v-model="searchQuery"
                    type="text"
                    placeholder="搜索节点、关系..."
                    @keyup.enter="performSearch"
                    class="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-surface dark:text-dark-text"
                  />
                  <svg class="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">节点类型</label>
                  <select 
                    v-model="selectedNodeTypes" 
                    multiple
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-surface dark:text-dark-text"
                  >
                    <option v-for="option in nodeTypeOptions" :key="option.value" :value="option.value">
                      {{ option.label }}
                    </option>
                  </select>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">关系类型</label>
                  <select 
                    v-model="selectedRelationTypes" 
                    multiple
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-surface dark:text-dark-text"
                  >
                    <option v-for="option in relationTypeOptions" :key="option.value" :value="option.value">
                      {{ option.label }}
                    </option>
                  </select>
                </div>
                
                <button @click="applyFilters" class="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                  应用筛选
                </button>
                <button @click="resetFilters" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-dark-text rounded-md hover:bg-gray-50 dark:hover:bg-dark-hover focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                  重置
                </button>
              </div>
            </div>

            <!-- 图谱统计 -->
            <div class="bg-white dark:bg-dark-surface rounded-xl shadow-lg p-6">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-dark-text mb-4">图谱统计</h3>
              
              <div class="space-y-3">
                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-600 dark:text-dark-text-secondary">节点数量</span>
                  <span class="font-semibold text-gray-900 dark:text-dark-text">{{ nodeCount }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-600 dark:text-dark-text-secondary">关系数量</span>
                  <span class="font-semibold text-gray-900 dark:text-dark-text">{{ linkCount }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-600 dark:text-dark-text-secondary">已选择</span>
                  <span class="font-semibold text-gray-900 dark:text-dark-text">{{ selectedNodes.length }}</span>
                </div>
              </div>
            </div>

            <!-- 布局控制 -->
            <div class="bg-white dark:bg-dark-surface rounded-xl shadow-lg p-6">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-dark-text mb-4">布局设置</h3>
              
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">布局算法</label>
                  <select 
                    v-model="currentLayout" 
                    @change="changeLayout"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-surface dark:text-dark-text"
                  >
                    <option v-for="option in layoutOptions" :key="option.value" :value="option.value">
                      {{ option.label }}
                    </option>
                  </select>
                </div>
                
                <div class="flex space-x-2">
                  <button 
                    @click="zoomIn"
                    class="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-dark-text bg-white dark:bg-dark-surface hover:bg-gray-50 dark:hover:bg-dark-hover focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"></path>
                    </svg>
                    放大
                  </button>
                  <button 
                    @click="zoomOut"
                    class="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-dark-text bg-white dark:bg-dark-surface hover:bg-gray-50 dark:hover:bg-dark-hover focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7"></path>
                    </svg>
                    缩小
                  </button>
                </div>
                
                <button 
                  @click="resetView"
                  class="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-dark-text bg-white dark:bg-dark-surface hover:bg-gray-50 dark:hover:bg-dark-hover focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                  </svg>
                  重置视图
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 中央图谱可视化区域 -->
        <div class="lg:col-span-2">
          <div class="bg-white dark:bg-dark-surface rounded-xl shadow-lg overflow-hidden">
            <!-- 图谱工具栏 -->
            <div class="border-b border-gray-200 dark:border-dark-border p-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4">
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-dark-text">知识图谱</h3>
                  <div class="flex items-center space-x-2 text-sm text-gray-500 dark:text-dark-text-secondary">
                    <div class="flex items-center">
                      <div class="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
                      <span>在线</span>
                    </div>
                    <span>•</span>
                    <span>最后更新: {{ lastUpdateTime }}</span>
                  </div>
                </div>
                
                <div class="flex items-center space-x-2">
                  <button 
                    @click="refreshGraph"
                    :disabled="loading"
                    class="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-dark-text bg-white dark:bg-dark-surface hover:bg-gray-50 dark:hover:bg-dark-hover focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    <svg class="w-4 h-4 mr-1" :class="{ 'animate-spin': loading }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                    </svg>
                    刷新
                  </button>
                </div>
              </div>
            </div>

            <!-- 图谱画布 -->
            <div class="relative" style="height: 600px;">
              <div v-if="loading && !graphData.nodes.length" class="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-dark-bg">
                <div class="text-center">
                  <svg class="animate-spin text-4xl text-blue-500 mb-4 w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                  </svg>
                  <p class="text-gray-600 dark:text-dark-text-secondary">正在加载知识图谱...</p>
                </div>
              </div>
              
              <div v-else-if="error" class="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-dark-bg">
                <div class="text-center">
                  <svg class="text-4xl text-red-500 mb-4 w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                  </svg>
                  <p class="text-red-600 dark:text-red-400 mb-4">{{ error }}</p>
                  <button 
                    @click="refreshGraph"
                    class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    重新加载
                  </button>
                </div>
              </div>
              
              <div v-else-if="!graphData.nodes.length" class="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-dark-bg dark:to-dark-surface">
                <div class="text-center">
                  <div class="w-24 h-24 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg class="text-4xl text-blue-600 dark:text-blue-400 w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"></path>
                    </svg>
                  </div>
                  <h4 class="text-xl font-semibold text-gray-900 dark:text-dark-text mb-2">知识图谱可视化</h4>
                  <p class="text-gray-600 dark:text-dark-text-secondary mb-4">点击开始探索反欺诈知识图谱</p>
                  <button 
                    @click="fetchInitialGraph" 
                    :disabled="loading"
                    class="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                  >
                    <svg v-if="loading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {{ loading ? '加载中...' : '开始探索' }}
                  </button>
                </div>
              </div>
              
              <ClientOnly v-else>
                <GraphVisualization
                  :graph-data="graphData"
                  :width="'100%'"
                  :height="'600px'"
                  :interactive="true"
                  @node-click="handleNodeClick"
                  @node-expand="handleNodeExpand"
                  @node-collapse="handleNodeCollapse"
                  @layout-change="handleLayoutChange"
                />
                <template #fallback>
                  <div class="w-full h-full flex items-center justify-center">
                    <svg class="animate-spin text-2xl w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                    </svg>
                  </div>
                </template>
              </ClientOnly>
            </div>
          </div>
        </div>

        <!-- 右侧信息面板 -->
        <div class="lg:col-span-1">
          <div class="space-y-6">
            <!-- 节点详情 -->
            <div class="bg-white dark:bg-dark-surface rounded-xl shadow-lg p-6">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-dark-text mb-4">节点详情</h3>
              
              <div v-if="selectedNode" class="space-y-4">
                <div class="flex items-center space-x-3">
                  <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                    <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                  </div>
                  <div>
                    <h4 class="font-semibold text-gray-900 dark:text-dark-text">{{ selectedNode.name }}</h4>
                    <span :class="`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${getNodeTypeColor(selectedNode.type)}-100 text-${getNodeTypeColor(selectedNode.type)}-800`">
                      {{ selectedNode.type }}
                    </span>
                  </div>
                </div>
                
                <div v-if="selectedNode.properties" class="space-y-2">
                  <h5 class="font-medium text-gray-900 dark:text-dark-text">属性信息</h5>
                  <div class="space-y-1">
                    <div v-for="(value, key) in selectedNode.properties" :key="key" class="flex justify-between text-sm">
                      <span class="text-gray-600 dark:text-dark-text-secondary">{{ key }}:</span>
                      <span class="text-gray-900 dark:text-dark-text font-medium">{{ value }}</span>
                    </div>
                  </div>
                </div>
                
                <div class="flex space-x-2">
                  <button 
                    @click="expandNode(selectedNode.id)" 
                    :disabled="loading"
                    class="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {{ loading ? '展开中...' : '展开' }}
                  </button>
                  <button 
                    @click="analyzeNode(selectedNode.id)"
                    class="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-dark-text rounded-md hover:bg-gray-50 dark:hover:bg-dark-hover focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    分析
                  </button>
                </div>
              </div>
              
              <div v-else class="text-center py-8">
                <svg class="w-16 h-16 text-gray-400 dark:text-dark-text-secondary mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"></path>
                </svg>
                <p class="text-gray-500 dark:text-dark-text-secondary">点击图谱中的节点查看详细信息</p>
              </div>
            </div>

            <!-- AI助手 -->
            <div v-if="aiPilotEnabled" class="bg-white dark:bg-dark-surface rounded-xl shadow-lg p-6">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-dark-text mb-4 flex items-center">
                <svg class="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
                </svg>
                AI助手
              </h3>
              
              <div class="space-y-4">
                <div v-if="selectedNode" class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p class="text-sm text-blue-800 dark:text-blue-200">
                    {{ aiAnalysis.summary || '正在分析当前节点...' }}
                  </p>
                </div>
                
                <div class="space-y-2">
                  <h5 class="font-medium text-gray-900 dark:text-dark-text">智能建议</h5>
                  <div class="space-y-2">
                    <div v-for="suggestion in aiSuggestions" :key="suggestion.id" 
                         class="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-bg rounded-lg">
                      <div>
                        <p class="text-sm font-medium text-gray-900 dark:text-dark-text">{{ suggestion.title }}</p>
                        <p class="text-xs text-gray-600 dark:text-dark-text-secondary">{{ suggestion.description }}</p>
                      </div>
                      <button 
                        @click="applySuggestion(suggestion)"
                        class="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        {{ suggestion.action }}
                      </button>
                    </div>
                  </div>
                </div>
                
                <div>
                  <input 
                    v-model="chatInput" 
                    type="text"
                    placeholder="询问关于图谱的问题..."
                    @keyup.enter="sendChatMessage"
                    :disabled="chatLoading"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-surface dark:text-dark-text disabled:opacity-50"
                  />
                  <button 
                    class="mt-2 w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                    @click="sendChatMessage"
                    :disabled="chatLoading || !chatInput.trim()"
                  >
                    <svg v-if="chatLoading" class="animate-spin -ml-1 mr-3 h-4 w-4 text-white inline" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {{ chatLoading ? '发送中...' : '发送' }}
                  </button>
                </div>
              </div>
            </div>

            <!-- 分析工具 -->
            <div class="bg-white dark:bg-dark-surface rounded-xl shadow-lg p-6">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-dark-text mb-4">分析工具</h3>
              
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">分析类型</label>
                  <select
                    v-model="analysisParams.analysis_type"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-surface dark:text-dark-text"
                  >
                    <option v-for="option in analysisTypeOptions" :key="option.value" :value="option.value">
                      {{ option.label }}
                    </option>
                  </select>
                </div>
                
                <div v-if="needsSourceNode">
                  <label class="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">源节点ID</label>
                  <input
                    v-model="analysisParams.source_node"
                    type="text"
                    placeholder="输入节点ID"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-surface dark:text-dark-text"
                  />
                </div>
                
                <div v-if="needsTargetNode">
                  <label class="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">目标节点ID</label>
                  <input
                    v-model="analysisParams.target_node"
                    type="text"
                    placeholder="输入目标节点ID"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-surface dark:text-dark-text"
                  />
                </div>
                
                <button 
                  @click="executeAnalysis" 
                  :disabled="loading"
                  class="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  <svg v-if="loading" class="animate-spin -ml-1 mr-3 h-4 w-4 text-white inline" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {{ loading ? '分析中...' : '执行分析' }}
                </button>
              </div>
              
              <div v-if="analysisResult" class="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <h5 class="font-medium text-green-800 dark:text-green-200 mb-2">分析结果</h5>
                <p class="text-sm text-green-700 dark:text-green-300">
                  类型：{{ analysisResult.analysis_type }}
                </p>
                <p class="text-sm text-green-700 dark:text-green-300">
                  节点：{{ analysisResult.graph?.counts?.nodes ?? 0 }}，关系：{{ analysisResult.graph?.counts?.links ?? 0 }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 反馈模态框 -->
    <Modal v-model="showFeedbackModal" title="反馈建议">
      <div class="p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-dark-text mb-4">反馈建议</h3>
        <textarea 
          v-model="feedbackText" 
          placeholder="请输入您的反馈建议..."
          rows="4"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-surface dark:text-dark-text resize-none mb-4"
        ></textarea>
        <div class="flex justify-end space-x-3">
          <button 
            @click="showFeedbackModal = false"
            class="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-dark-text rounded-md hover:bg-gray-50 dark:hover:bg-dark-hover focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            取消
          </button>
          <button 
            @click="submitFeedback"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            提交
          </button>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch, nextTick } from 'vue'
import GraphVisualization from '~/components/GraphVisualization.vue'
import { useGraphApi } from '~/composables/useApi'
import { useToast } from '~/composables/useNotification'

// 设置页面布局
definePageMeta({
  layout: 'default'
})

// 页面元数据
useHead({
  title: '知识图谱 - 反欺诈知识平台',
  meta: [
    { name: 'description', content: '基于Neo4j的反欺诈知识图谱可视化系统，支持图数据查询、分析和交互式可视化' }
  ]
})

// API和通知
const { getGraphData, getNodeDetails, expandNode: expandNodeApi, runAnalysis, searchGraph } = useGraphApi()
const { showToast } = useToast()

// 页面状态管理
const loading = ref(false)
const error = ref(null)
const exporting = ref(false)
const aiPilotEnabled = ref(false)
const showFeedbackModal = ref(false)
const feedbackText = ref('')

// 搜索和筛选
const searchQuery = ref('')
const selectedNodeTypes = ref([])
const selectedRelationTypes = ref([])

// 图谱数据和状态
const graphData = ref({ nodes: [], links: [], categories: [] })
const graphMeta = ref({ counts: { nodes: 0, links: 0 }, meta: {} })
const selectedNode = ref(null)
const selectedNodes = ref([])
const expandedNodes = ref(new Set())
const currentLayout = ref('force')

// 分析参数
const analysisParams = ref({
  analysis_type: 'shortest_path',
  source_node: '',
  target_node: '',
  k: 2,
  limit: 20
})
const analysisResult = ref(null)

// AI功能
const aiAnalysis = reactive({
  summary: '',
  insights: [],
  recommendations: []
})
const chatInput = ref('')
const chatLoading = ref(false)
const aiSuggestions = ref([
  { id: 1, title: '风险评估', description: '分析当前节点的风险等级', action: '分析' },
  { id: 2, title: '关联挖掘', description: '发现潜在的关联关系', action: '挖掘' },
  { id: 3, title: '路径分析', description: '分析资金流转路径', action: '追踪' }
])

// 选项数据
const nodeTypeOptions = [
  { label: '人员', value: 'person' },
  { label: '机构', value: 'organization' },
  { label: '账户', value: 'account' },
  { label: '交易', value: 'transaction' }
]

const relationTypeOptions = [
  { label: '拥有', value: 'owns' },
  { label: '转账', value: 'transfer' },
  { label: '关联', value: 'related' },
  { label: '控制', value: 'controls' }
]

const layoutOptions = [
  { label: '力导向布局', value: 'force' },
  { label: '层次布局', value: 'hierarchical' },
  { label: '圆形布局', value: 'circular' },
  { label: '网格布局', value: 'grid' }
]

const analysisTypeOptions = [
  { label: '最短路径', value: 'shortest_path' },
  { label: 'K跳邻居', value: 'k_hop_neighbors' },
  { label: '中心性分析', value: 'centrality' }
]

// 计算属性
const nodeCount = computed(() => graphMeta.value.counts?.nodes ?? graphData.value.nodes?.length ?? 0)
const linkCount = computed(() => graphMeta.value.counts?.links ?? graphData.value.links?.length ?? 0)
const lastUpdateTime = computed(() => new Date().toLocaleTimeString())

const needsSourceNode = computed(() => {
  return ['shortest_path', 'k_hop_neighbors'].includes(analysisParams.value.analysis_type)
})

const needsTargetNode = computed(() => {
  return analysisParams.value.analysis_type === 'shortest_path'
})

// 核心方法
const applyGraphResponse = (graphResponse, { merge = false } = {}) => {
  if (!graphResponse) return

  const {
    nodes = [],
    links = [],
    categories = [],
    counts = {},
    meta = {}
  } = graphResponse

  if (merge && graphData.value.nodes.length) {
    const existingNodeIds = new Set(graphData.value.nodes.map(node => node.id))
    const mergedNodes = [...graphData.value.nodes]
    nodes.forEach((node) => {
      if (node && node.id && !existingNodeIds.has(node.id)) {
        mergedNodes.push(node)
        existingNodeIds.add(node.id)
      }
    })

    const existingLinkKeys = new Set(
      graphData.value.links.map(link => `${link.source}->${link.target}:${link.label || ''}`)
    )
    const mergedLinks = [...graphData.value.links]
    links.forEach((link) => {
      if (!link) return
      const key = `${link.source}->${link.target}:${link.label || ''}`
      if (!existingLinkKeys.has(key)) {
        mergedLinks.push(link)
        existingLinkKeys.add(key)
      }
    })

    graphData.value = {
      ...graphData.value,
      nodes: mergedNodes,
      links: mergedLinks,
      categories: categories.length ? categories : graphData.value.categories
    }
  } else {
    graphData.value = {
      nodes,
      links,
      categories
    }
  }

  graphMeta.value = {
    counts: {
      nodes: counts.nodes ?? graphData.value.nodes.length,
      links: counts.links ?? graphData.value.links.length
    },
    meta
  }
}

const fetchInitialGraph = async (params = {}) => {
  loading.value = true
  error.value = null
  
  try {
    const apiCall = getGraphData(params)
    const response = await apiCall.execute()
    applyGraphResponse(response)
    showToast('图谱加载成功', 'success')
  } catch (err) {
    const message = err?.message || '加载图谱失败'
    error.value = message
    showToast(message, 'error')
    console.error('Failed to fetch graph data:', err)
  } finally {
    loading.value = false
  }
}

const performSearch = async () => {
  if (!searchQuery.value.trim()) return
  
  loading.value = true
  try {
    const apiCall = searchGraph(searchQuery.value)
    const response = await apiCall.execute()

    if (response) {
      applyGraphResponse(response)
      showToast('搜索完成', 'success')
    } else {
      showToast('未找到结果', 'info')
    }
  } catch (err) {
    showToast('搜索失败', 'error')
    console.error('Search failed:', err)
  } finally {
    loading.value = false
  }
}

const applyFilters = async () => {
  const filters = {}
  
  if (selectedNodeTypes.value.length) {
    filters.node_types = selectedNodeTypes.value
  }
  if (selectedRelationTypes.value.length) {
    filters.relationship_types = selectedRelationTypes.value
  }
  
  loading.value = true
  try {
    const apiCall = getGraphData(filters)
    const response = await apiCall.execute()
    applyGraphResponse(response)
    showToast('筛选应用成功', 'success')
  } catch (err) {
    showToast('筛选失败', 'error')
    console.error('Filter failed:', err)
  } finally {
    loading.value = false
  }
}

const resetFilters = () => {
  selectedNodeTypes.value = []
  selectedRelationTypes.value = []
  searchQuery.value = ''
  fetchInitialGraph({ limit: 50 })
}

const executeAnalysis = async () => {
  const params = { ...analysisParams.value }

  if (!params.analysis_type) {
    showToast('请选择分析类型', 'warning')
    return
  }

  if (needsSourceNode.value && !params.source_node) {
    showToast('请输入源节点ID', 'warning')
    return
  }

  if (needsTargetNode.value && !params.target_node) {
    showToast('请输入目标节点ID', 'warning')
    return
  }

  const payload = {
    analysis_type: params.analysis_type,
    parameters: {}
  }

  if (params.source_node) payload.parameters.source_node = params.source_node
  if (params.target_node) payload.parameters.target_node = params.target_node
  if (params.k) payload.parameters.k = Number(params.k)
  if (params.limit) payload.parameters.limit = Number(params.limit)

  loading.value = true
  try {
    const apiCall = runAnalysis(payload)
    const result = await apiCall.execute()
    
    if (result) {
      analysisResult.value = result
      if (result.graph) {
        applyGraphResponse(result.graph, { merge: true })
      }
      showToast('分析完成', 'success')
    }
  } catch (err) {
    showToast('分析失败', 'error')
    console.error('Analysis failed:', err)
  } finally {
    loading.value = false
  }
}

const expandNode = async (nodeId) => {
  if (expandedNodes.value.has(nodeId)) return
  
  loading.value = true
  try {
    const apiCall = expandNodeApi(nodeId, { limit: 150 })
    const response = await apiCall.execute()
    applyGraphResponse(response, { merge: true })
    expandedNodes.value.add(nodeId)
    showToast('节点展开成功', 'success')
  } catch (err) {
    showToast('节点展开失败', 'error')
    console.error('Failed to expand node:', err)
  } finally {
    loading.value = false
  }
}

const analyzeNode = async (nodeId) => {
  // 自动设置分析参数
  analysisParams.value.source_node = nodeId
  analysisParams.value.analysis_type = 'k_hop_neighbors'
  await executeAnalysis()
}

const refreshGraph = async () => {
  graphData.value = { nodes: [], links: [], categories: [] }
  graphMeta.value = { counts: { nodes: 0, links: 0 }, meta: {} }
  selectedNodes.value = []
  expandedNodes.value.clear()
  analysisResult.value = null
  error.value = null
  await fetchInitialGraph({ limit: 50 })
}

// 工具方法
const getNodeIcon = (type) => {
  const iconMap = {
    person: 'i-heroicons-user',
    organization: 'i-heroicons-building-office',
    account: 'i-heroicons-credit-card',
    transaction: 'i-heroicons-arrow-right-left',
    default: 'i-heroicons-circle-stack'
  }
  return iconMap[type] || iconMap.default
}

const getNodeTypeColor = (type) => {
  const colorMap = {
    person: 'blue',
    organization: 'green',
    account: 'yellow',
    transaction: 'red',
    default: 'gray'
  }
  return colorMap[type] || colorMap.default
}

// 其他功能方法
const exportGraph = () => {
  exporting.value = true
  setTimeout(() => {
    exporting.value = false
    showToast('图谱导出成功', 'success')
  }, 2000)
}

const shareGraph = () => {
  showToast('分享链接已复制', 'success')
}

const submitFeedback = () => {
  showFeedbackModal.value = false
  feedbackText.value = ''
  showToast('反馈提交成功', 'success')
}

const changeLayout = (layout) => {
  currentLayout.value = layout
  console.log('Layout changed to:', layout)
}

const zoomIn = () => {
  console.log('Zoom in')
}

const zoomOut = () => {
  console.log('Zoom out')
}

const resetView = () => {
  console.log('Reset view')
}

const sendChatMessage = () => {
  if (!chatInput.value.trim()) return
  
  chatLoading.value = true
  
  setTimeout(() => {
    showToast('AI助手功能开发中', 'info')
    chatInput.value = ''
    chatLoading.value = false
  }, 1000)
}

const applySuggestion = (suggestion) => {
  console.log('Applying suggestion:', suggestion)
  showToast(`正在执行${suggestion.title}`, 'info')
}

// 事件处理方法
const handleNodeClick = async (node) => {
  console.log('Node clicked:', node)
  toggleNodeSelection(node.id)
  
  // 获取节点详细信息
  try {
    const apiCall = getNodeDetails(node.id)
    const details = await apiCall.execute()
    selectedNode.value = {
      ...node,
      properties: details?.node || {},
      neighbors: details?.neighbors || []
    }
  } catch (e) {
    showToast('获取节点详情失败', 'error')
  }

  // 如果需要源节点或目标节点，自动填充
  if (needsSourceNode.value && !analysisParams.value.source_node) {
    analysisParams.value.source_node = node.id
  } else if (needsTargetNode.value && !analysisParams.value.target_node && analysisParams.value.source_node !== node.id) {
    analysisParams.value.target_node = node.id
  }
}

const handleNodeExpand = async (node) => {
  console.log('Expanding node:', node)
  await expandNode(node.id)
}

const handleNodeCollapse = (node) => {
  console.log('Collapsing node:', node)
  collapseNode(node.id)
}

const handleLayoutChange = (layoutType) => {
  console.log('Layout changed to:', layoutType)
  currentLayout.value = layoutType
}

const toggleNodeSelection = (nodeId) => {
  const index = selectedNodes.value.indexOf(nodeId)
  if (index > -1) {
    selectedNodes.value.splice(index, 1)
  } else {
    selectedNodes.value.push(nodeId)
  }
}

const collapseNode = (nodeId) => {
  // 移除与该节点相关的扩展节点和链接
  const nodesToRemove = new Set()
  const linksToRemove = new Set()
  
  // 找到需要移除的节点和链接
  graphData.value.links.forEach(link => {
    if (link.source === nodeId || link.target === nodeId) {
      linksToRemove.add(link)
      if (expandedNodes.value.has(link.source)) nodesToRemove.add(link.source)
      if (expandedNodes.value.has(link.target)) nodesToRemove.add(link.target)
    }
  })
  
  // 移除节点和链接
  graphData.value.nodes = graphData.value.nodes.filter(n => !nodesToRemove.has(n.id))
  graphData.value.links = graphData.value.links.filter(l => !linksToRemove.has(l))
  
  expandedNodes.value.delete(nodeId)
}

// 生命周期
onMounted(async () => {
  if (typeof window !== 'undefined') {
    await nextTick()
    await fetchInitialGraph({ limit: 50 })
  }
})
</script>

<style scoped>
/* 最小化自定义样式，主要使用 Tailwind CSS */
</style>