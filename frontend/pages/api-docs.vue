<template>
  <div class="min-h-screen bg-muted/40">
    <div class="max-w-6xl mx-auto px-4 py-8">
      <div class="bg-card rounded-lg shadow-sm p-8">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-foreground mb-4">API 文档</h1>
          <p class="text-muted-foreground leading-relaxed">
            欢迎使用反诈骗知识平台 API。本文档提供了完整的 API 接口说明，帮助开发者集成我们的服务。
          </p>
        </div>
        
        <!-- API 概览 -->
        <div class="mb-8">
          <h2 class="text-2xl font-semibold text-foreground mb-4">API 概览</h2>
          <div class="grid md:grid-cols-3 gap-6">
            <div class="bg-primary/10 p-6 rounded-lg">
              <h3 class="text-lg font-semibold text-primary mb-2">基础信息</h3>
              <ul class="text-sm text-primary space-y-1">
                <li><strong>Base URL:</strong> https://api.antifraud.com</li>
                <li><strong>版本:</strong> v1</li>
                <li><strong>认证:</strong> Bearer Token</li>
              </ul>
            </div>
            
            <div class="bg-primary/10 p-6 rounded-lg">
              <h3 class="text-lg font-semibold text-success-800 mb-2">响应格式</h3>
              <ul class="text-sm text-success-700 space-y-1">
                <li><strong>格式:</strong> JSON</li>
                <li><strong>编码:</strong> UTF-8</li>
                <li><strong>状态码:</strong> HTTP 标准</li>
              </ul>
            </div>
            
            <div class="bg-primary/10 p-6 rounded-lg">
              <h3 class="text-lg font-semibold text-purple-900 mb-2">限制</h3>
              <ul class="text-sm text-purple-700 space-y-1">
                <li><strong>频率:</strong> 1000 次/小时</li>
                <li><strong>并发:</strong> 10 个请求</li>
                <li><strong>超时:</strong> 30 秒</li>
              </ul>
            </div>
          </div>
        </div>
        
        <!-- 认证 -->
        <div class="mb-8">
          <h2 class="text-2xl font-semibold text-foreground mb-4">认证</h2>
          <div class="bg-muted/40 p-6 rounded-lg">
            <p class="text-muted-foreground mb-4">所有 API 请求都需要在请求头中包含认证令牌：</p>
            <pre class="rounded-md bg-muted/80 p-4 text-success-400 overflow-x-auto"><code>Authorization: Bearer YOUR_ACCESS_TOKEN</code></pre>
          </div>
        </div>
        
        <!-- API 端点 -->
        <div class="mb-8">
          <h2 class="text-2xl font-semibold text-foreground mb-6">API 端点</h2>
          
          <!-- 用户认证 -->
          <div class="mb-8">
            <h3 class="text-xl font-semibold text-foreground mb-4">用户认证</h3>
            <div class="space-y-4">
              <div class="border border-border rounded-lg p-6">
                <div class="flex items-center mb-3">
                  <span class="bg-primary/20 text-success-700 px-2 py-1 rounded text-sm font-medium mr-3">POST</span>
                  <code class="text-foreground font-mono">/api/auth/login</code>
                </div>
                <p class="text-muted-foreground mb-4">用户登录</p>
                
                <div class="mb-4">
                  <h4 class="font-semibold text-muted-foreground mb-2">请求参数</h4>
                  <pre class="bg-muted/40 p-3 rounded text-sm overflow-x-auto"><code>{
  "email": "user@example.com",
  "password": "password123"
}</code></pre>
                </div>
                
                <div>
                  <h4 class="font-semibold text-muted-foreground mb-2">响应示例</h4>
                  <pre class="bg-muted/40 p-3 rounded text-sm overflow-x-auto"><code>{
  "success": true,
  "data": {
    "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "username": "user123"
    }
  }
}</code></pre>
                </div>
              </div>
              
              <div class="border border-border rounded-lg p-6">
                <div class="flex items-center mb-3">
                  <span class="bg-primary/20 text-success-700 px-2 py-1 rounded text-sm font-medium mr-3">POST</span>
                  <code class="text-foreground font-mono">/api/auth/register</code>
                </div>
                <p class="text-muted-foreground mb-4">用户注册</p>
                
                <div class="mb-4">
                  <h4 class="font-semibold text-muted-foreground mb-2">请求参数</h4>
                  <pre class="bg-muted/40 p-3 rounded text-sm overflow-x-auto"><code>{
  "username": "newuser",
  "email": "newuser@example.com",
  "password": "password123",
  "password_confirm": "password123"
}</code></pre>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 通知管理 -->
          <div class="mb-8">
            <h3 class="text-xl font-semibold text-foreground mb-4">通知管理</h3>
            <div class="space-y-4">
              <div class="border border-border rounded-lg p-6">
                <div class="flex items-center mb-3">
                  <span class="bg-primary/20 text-primary px-2 py-1 rounded text-sm font-medium mr-3">GET</span>
                  <code class="text-foreground font-mono">/api/notifications/notifications/</code>
                </div>
                <p class="text-muted-foreground mb-4">获取用户通知列表</p>
                
                <div class="mb-4">
                  <h4 class="font-semibold text-muted-foreground mb-2">查询参数</h4>
                  <ul class="text-sm text-muted-foreground space-y-1">
                    <li><code>page</code> - 页码（可选，默认为1）</li>
                    <li><code>page_size</code> - 每页数量（可选，默认为20）</li>
                    <li><code>is_read</code> - 是否已读（可选，true/false）</li>
                    <li><code>notification_type</code> - 通知类型（可选）</li>
                  </ul>
                </div>
                
                <div>
                  <h4 class="font-semibold text-muted-foreground mb-2">响应示例</h4>
                  <pre class="bg-muted/40 p-3 rounded text-sm overflow-x-auto"><code>{
  "success": true,
  "data": {
    "results": [
      {
        "id": 1,
        "title": "系统通知",
        "message": "欢迎使用反诈骗知识平台",
        "notification_type": "system",
        "is_read": false,
        "created_at": "2024-01-15T10:30:00Z"
      }
    ],
    "count": 10,
    "next": null,
    "previous": null
  }
}</code></pre>
                </div>
              </div>
              
              <div class="border border-border rounded-lg p-6">
                <div class="flex items-center mb-3">
                  <span class="bg-primary/20 text-yellow-800 px-2 py-1 rounded text-sm font-medium mr-3">PATCH</span>
                  <code class="text-foreground font-mono">/api/notifications/notifications/{id}/mark_read/</code>
                </div>
                <p class="text-muted-foreground">标记通知为已读</p>
              </div>
            </div>
          </div>
          
          <!-- 学习统计 -->
          <div class="mb-8">
            <h3 class="text-xl font-semibold text-foreground mb-4">学习统计</h3>
            <div class="space-y-4">
              <div class="border border-border rounded-lg p-6">
                <div class="flex items-center mb-3">
                  <span class="bg-primary/20 text-primary px-2 py-1 rounded text-sm font-medium mr-3">GET</span>
                  <code class="text-foreground font-mono">/api/stats/learning-stats/</code>
                </div>
                <p class="text-muted-foreground">获取用户学习统计数据</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 错误代码 -->
        <div class="mb-8">
          <h2 class="text-2xl font-semibold text-foreground mb-4">错误代码</h2>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-border">
              <thead class="bg-muted/40">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">状态码</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">说明</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">描述</th>
                </tr>
              </thead>
              <tbody class="bg-card divide-y divide-border">
                <tr>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">200</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">OK</td>
                  <td class="px-6 py-4 text-sm text-muted-foreground">请求成功</td>
                </tr>
                <tr>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">400</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">Bad Request</td>
                  <td class="px-6 py-4 text-sm text-muted-foreground">请求参数错误</td>
                </tr>
                <tr>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">401</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">Unauthorized</td>
                  <td class="px-6 py-4 text-sm text-muted-foreground">未授权，需要登录</td>
                </tr>
                <tr>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">403</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">Forbidden</td>
                  <td class="px-6 py-4 text-sm text-muted-foreground">禁止访问，权限不足</td>
                </tr>
                <tr>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">404</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">Not Found</td>
                  <td class="px-6 py-4 text-sm text-muted-foreground">资源不存在</td>
                </tr>
                <tr>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">500</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">Internal Server Error</td>
                  <td class="px-6 py-4 text-sm text-muted-foreground">服务器内部错误</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <!-- SDK 和示例 -->
        <div class="mb-8">
          <h2 class="text-2xl font-semibold text-foreground mb-4">SDK 和示例</h2>
          <div class="grid md:grid-cols-2 gap-6">
            <div class="bg-muted/40 p-6 rounded-lg">
              <h3 class="text-lg font-semibold text-foreground mb-3">JavaScript SDK</h3>
              <pre class="rounded bg-muted/80 p-4 text-sm text-success-400 overflow-x-auto"><code>// 安装
npm install @antifraud/sdk

// 使用
import { AntiFraudAPI } from '@antifraud/sdk'

const api = new AntiFraudAPI({
  baseURL: 'https://api.antifraud.com',
  token: 'your-access-token'
})

// 获取通知
const notifications = await api.notifications.list()</code></pre>
            </div>
            
            <div class="bg-muted/40 p-6 rounded-lg">
              <h3 class="text-lg font-semibold text-foreground mb-3">Python SDK</h3>
              <pre class="rounded bg-muted/80 p-4 text-sm text-success-400 overflow-x-auto"><code># 安装
pip install antifraud-sdk

# 使用
from antifraud import AntiFraudAPI

api = AntiFraudAPI(
    base_url='https://api.antifraud.com',
    token='your-access-token'
)

# 获取通知
notifications = api.notifications.list()</code></pre>
            </div>
          </div>
        </div>
        
        <!-- 联系信息 -->
        <div class="bg-primary/10 rounded-lg p-6">
          <h3 class="text-lg font-semibold text-primary mb-2">需要帮助？</h3>
          <p class="text-primary mb-4">如果您在使用 API 过程中遇到问题，请联系我们的技术支持团队。</p>
          <div class="flex flex-wrap gap-4">
            <NuxtLink 
              to="/contact"
              class="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
            >
              联系技术支持
            </NuxtLink>
            <a 
              href="mailto:api-support@antifraud.com"
              class="bg-card text-primary border border-primary px-4 py-2 rounded-md hover:bg-primary/10 transition-colors"
            >
              发送邮件
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  title: 'API 文档 - 反诈骗知识平台'
})
</script>