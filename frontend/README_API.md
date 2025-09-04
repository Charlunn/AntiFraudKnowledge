# 统一API工具类 - 快速入门

本项目为Nuxt.js应用提供了完整的统一API封装解决方案。

## 🚀 特性

- **统一封装**: 所有API调用使用统一的接口和错误处理
- **类型安全**: 完整的TypeScript类型定义
- **响应式**: 基于Vue 3组合式API的响应式状态管理
- **自动化**: 自动token刷新、错误处理和状态同步
- **模块化**: 按业务功能组织的清晰模块结构

## 📁 项目结构

```
frontend/
├── api/                    # API模块
│   ├── base.ts            # 基础API客户端
│   ├── auth.ts            # 认证相关API
│   ├── quiz.ts            # 测验相关API
│   ├── achievements.ts    # 成就系统API
│   ├── feedback.ts        # 反馈系统API
│   ├── chat.ts            # 聊天系统API
│   ├── community.ts       # 社区功能API
│   ├── statistics.ts      # 统计数据API
│   └── index.ts           # 统一导出
├── types/
│   └── api.ts             # API类型定义
├── composables/
│   └── useApi.ts          # 组合式函数
├── plugins/
│   └── api.client.ts      # Nuxt.js插件
└── docs/
    └── API_USAGE.md       # 详细使用文档
```

## ⚡ 快速开始

### 1. 环境配置

在 `nuxt.config.ts` 中配置API基础URL：

```typescript
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      apiBase: process.env.API_BASE_URL || 'http://localhost:8000/api'
    }
  }
})
```

### 2. 基础使用

```vue
<template>
  <div>
    <button @click="handleLogin" :disabled="pending">
      {{ pending ? '登录中...' : '登录' }}
    </button>
    <div v-if="error">{{ error.message }}</div>
  </div>
</template>

<script setup>
// 使用组合式函数
const { login } = useAuth()
const { data, error, pending, execute } = login('user@example.com', 'password')

const handleLogin = () => execute()
</script>
```

### 3. 直接API调用

```typescript
// 在任何地方使用API客户端
const { $api } = useNuxtApp()

// 发起请求
const response = await $api.auth.login('username', 'password')
console.log(response.data)
```

## 🛠️ 主要组合式函数

| 函数 | 用途 | 示例 |
|------|------|------|
| `useAuth()` | 认证管理 | `const { login, logout } = useAuth()` |
| `useQuiz()` | 测验功能 | `const { fetchQuestions } = useQuiz()` |
| `useAchievements()` | 成就系统 | `const { fetchUserAchievements } = useAchievements()` |
| `useFeedback()` | 反馈系统 | `const { submitFeedback } = useFeedback()` |
| `useChat()` | 聊天功能 | `const { sendMessage } = useChat()` |
| `useCommunity()` | 社区功能 | `const { fetchPosts } = useCommunity()` |
| `useStatistics()` | 统计数据 | `const { fetchSystemStats } = useStatistics()` |

## 🔧 核心功能

### 自动认证处理

- 自动添加认证token到请求头
- Token过期时自动刷新
- 刷新失败时自动跳转登录页

### 统一错误处理

- 401: 自动刷新token或跳转登录
- 403: 显示权限不足提示
- 404: 显示资源不存在提示
- 500: 显示服务器错误提示
- 网络错误: 显示连接问题提示

### 响应式状态

每个API调用都返回响应式状态：

```typescript
const { data, error, pending, execute, refresh, clear } = useApiCall()
```

- `data`: 响应数据
- `error`: 错误信息
- `pending`: 加载状态
- `execute`: 执行请求
- `refresh`: 重新请求
- `clear`: 清除状态

## 📝 使用示例

### 用户认证

```typescript
// 登录
const { login } = useAuth()
const { execute: doLogin } = login('user@example.com', 'password')
await doLogin()

// 注册
const { register } = useAuth()
const { execute: doRegister } = register({
  username: 'newuser',
  email: 'user@example.com',
  password: 'password123',
  confirmPassword: 'password123'
})
await doRegister()
```

### 测验功能

```typescript
// 获取题目
const { fetchQuestions } = useQuiz()
const { data: questions } = fetchQuestions('beginner', 10)

// 提交答案
const { submitAnswers } = useQuiz()
const { execute: submit } = submitAnswers('beginner', {
  'q1': 'answer1',
  'q2': 'answer2'
})
const result = await submit()
```

### 社区功能

```typescript
// 获取帖子
const { fetchPosts } = useCommunity()
const { data: posts } = fetchPosts('general', 'latest')

// 创建帖子
const { createPost } = useCommunity()
const { execute: create } = createPost({
  title: '新帖子',
  content: '帖子内容...',
  category: 'discussion'
})
await create()
```

## 🎯 最佳实践

1. **优先使用组合式函数**而不是直接调用API客户端
2. **合理使用immediate选项**控制请求时机
3. **充分利用TypeScript类型检查**确保类型安全
4. **使用响应式状态**简化UI状态管理
5. **遵循错误处理策略**提供良好的用户体验

## 📚 详细文档

查看 [API_USAGE.md](./docs/API_USAGE.md) 获取完整的使用文档和高级功能说明。

## 🔍 类型定义

所有API相关的类型定义都在 `~/types/api.ts` 中，包括：

- 请求/响应接口
- 业务数据模型
- 错误类型定义
- 配置选项类型

## 🚨 注意事项

1. 确保在 `.env` 文件中正确配置 `API_BASE_URL`
2. 所有API调用都是异步的，记得使用 `await` 或 `.then()`
3. 组合式函数返回的状态是响应式的，可以直接在模板中使用
4. 错误处理已经内置，但可以根据需要进行自定义处理

## 🤝 贡献

如果发现问题或有改进建议，请：

1. 查看现有的类型定义和API模块
2. 遵循现有的代码风格和命名约定
3. 添加适当的类型注解和JSDoc注释
4. 更新相关文档

---

**开始使用统一API工具类，让你的Nuxt.js应用开发更加高效！** 🎉