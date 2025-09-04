# API 工具类使用文档

本文档详细介绍了项目中统一API工具类的使用方法和最佳实践。

## 目录

- [概述](#概述)
- [快速开始](#快速开始)
- [API 客户端](#api-客户端)
- [组合式函数](#组合式函数)
- [类型定义](#类型定义)
- [错误处理](#错误处理)
- [最佳实践](#最佳实践)
- [示例代码](#示例代码)

## 概述

项目采用统一的API封装工具类，提供以下特性：

- 🚀 **统一的请求拦截和响应处理**
- 🛡️ **完善的错误处理机制**
- 📝 **完整的TypeScript类型支持**
- 🔧 **模块化组织，按业务功能划分**
- 🎯 **与Nuxt.js插件机制完美集成**
- 🔄 **与Pinia状态管理无缝对接**

## 快速开始

### 1. 基础配置

API工具类已通过Nuxt.js插件自动注入，无需手动配置。

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      apiBase: process.env.API_BASE_URL || 'http://localhost:8000/api'
    }
  }
})
```

### 2. 在组件中使用

```vue
<template>
  <div>
    <button @click="handleLogin">登录</button>
    <div v-if="pending">加载中...</div>
    <div v-if="error">{{ error.message }}</div>
  </div>
</template>

<script setup>
const { login } = useAuth()
const { data, error, pending, execute } = login('user@example.com', 'password')

const handleLogin = async () => {
  try {
    await execute()
    console.log('登录成功')
  } catch (err) {
    console.error('登录失败:', err)
  }
}
</script>
```

## API 客户端

### 基础用法

```typescript
// 直接使用API客户端
const { $api } = useNuxtApp()

// 发起请求
const response = await $api.auth.login('username', 'password')
console.log(response.data)
```

### 可用的API模块

- `$api.auth` - 认证相关API
- `$api.quiz` - 测验相关API
- `$api.achievements` - 成就系统API
- `$api.feedback` - 反馈系统API
- `$api.chat` - 聊天系统API
- `$api.community` - 社区功能API
- `$api.statistics` - 统计数据API

## 组合式函数

### useAuth - 认证管理

```typescript
const { register, login, logout, fetchProfile } = useAuth()

// 用户注册
const { data, error, pending, execute: doRegister } = register({
  username: 'newuser',
  email: 'user@example.com',
  password: 'password123',
  confirmPassword: 'password123'
})

// 用户登录
const { execute: doLogin } = login('user@example.com', 'password123')

// 用户登出
const { execute: doLogout } = logout()

// 获取用户资料
const { data: profile, execute: getProfile } = fetchProfile()
```

### useQuiz - 测验管理

```typescript
const { fetchQuestions, submitAnswers, fetchRecords } = useQuiz()

// 获取题目（自动执行）
const { data: questions } = fetchQuestions('beginner', 10)

// 提交答案
const { execute: submit } = submitAnswers('beginner', {
  'question1': 'answer1',
  'question2': 'answer2'
})

// 获取答题记录
const { data: records } = fetchRecords(1, 20)
```

### useAchievements - 成就系统

```typescript
const { fetchUserAchievements, fetchAllAchievements, grantAchievement } = useAchievements()

// 获取用户成就
const { data: userAchievements } = fetchUserAchievements()

// 获取所有成就
const { data: allAchievements } = fetchAllAchievements('learning')

// 授予成就
const { execute: grant } = grantAchievement(123, 'first_quiz_completed')
```

### useFeedback - 反馈系统

```typescript
const { submitFeedback, fetchUserFeedback } = useFeedback()

// 提交反馈
const { execute: submit } = submitFeedback({
  type: 'bug',
  title: '发现一个问题',
  content: '详细描述...',
  rating: 3
})

// 获取用户反馈
const { data: feedbacks } = fetchUserFeedback()
```

### useChat - 聊天系统

```typescript
const { sendMessage, fetchSessions, fetchHistory } = useChat()

// 发送消息
const { execute: send } = sendMessage('你好，我有个问题')

// 获取会话列表
const { data: sessions } = fetchSessions()

// 获取聊天记录
const { data: history } = fetchHistory('session-123')
```

### useCommunity - 社区功能

```typescript
const { fetchPosts, createPost, toggleLike } = useCommunity()

// 获取帖子列表
const { data: posts } = fetchPosts('general', 'latest')

// 创建帖子
const { execute: create } = createPost({
  title: '新帖子标题',
  content: '帖子内容...',
  category: 'discussion',
  tags: ['学习', '交流']
})

// 点赞帖子
const { execute: like } = toggleLike(456)
```

### useStatistics - 统计数据

```typescript
const { fetchSystemStats, fetchUserActivityStats } = useStatistics()

// 获取系统统计
const { data: systemStats } = fetchSystemStats()

// 获取用户活跃度统计
const { data: activityStats } = fetchUserActivityStats('week')
```

## 类型定义

### 基础类型

```typescript
// API响应格式
interface ApiResponse<T> {
  data: T
  message?: string
  status: number
}

// 分页响应格式
interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

// 错误格式
interface ApiError {
  message: string
  code: number
  details?: any
}
```

### 业务类型

```typescript
// 用户类型
interface User {
  id: number
  username: string
  email: string
  avatar?: string
  created_at: string
}

// 认证令牌
interface AuthTokens {
  access_token: string
  refresh_token: string
  expires_in: number
}

// 测验题目
interface QuizQuestion {
  id: string
  question: string
  options: string[]
  level: string
  category: string
}
```

## 错误处理

### 全局错误处理

API客户端提供统一的错误处理机制：

```typescript
// 自动处理的错误类型
- 401: 自动刷新token或跳转登录
- 403: 显示权限不足提示
- 404: 显示资源不存在提示
- 500: 显示服务器错误提示
- 网络错误: 显示网络连接问题提示
```

### 自定义错误处理

```typescript
// 在组合式函数中自定义错误处理
const { execute } = login('user', 'pass')

try {
  await execute()
} catch (error: ApiError) {
  if (error.code === 401) {
    // 处理认证失败
    console.log('用户名或密码错误')
  } else {
    // 处理其他错误
    console.log('登录失败:', error.message)
  }
}
```

### 错误边界处理

```vue
<template>
  <div>
    <div v-if="error" class="error-message">
      {{ error.message }}
      <button @click="retry">重试</button>
    </div>
    <div v-else-if="pending">加载中...</div>
    <div v-else>
      <!-- 正常内容 -->
    </div>
  </div>
</template>

<script setup>
const { data, error, pending, execute, refresh } = fetchQuestions()

const retry = () => {
  refresh()
}
</script>
```

## 最佳实践

### 1. 使用组合式函数

优先使用提供的组合式函数，而不是直接调用API客户端：

```typescript
// ✅ 推荐
const { fetchQuestions } = useQuiz()
const { data } = fetchQuestions()

// ❌ 不推荐
const { $api } = useNuxtApp()
const response = await $api.quiz.fetchQuestions()
```

### 2. 合理使用immediate选项

```typescript
// 页面加载时立即获取数据
const { data: questions } = fetchQuestions('beginner', 10) // immediate: true 是默认的

// 用户操作时才执行
const { execute: submit } = submitAnswers(level, answers) // immediate: false
```

### 3. 错误处理策略

```typescript
// 全局错误处理 + 局部特殊处理
const { execute } = login(username, password)

try {
  await execute()
} catch (error) {
  // 只处理需要特殊处理的错误
  if (error.code === 'ACCOUNT_LOCKED') {
    showAccountLockedDialog()
  }
  // 其他错误由全局处理器处理
}
```

### 4. 类型安全

```typescript
// 充分利用TypeScript类型检查
const { execute } = submitFeedback({
  type: 'bug', // 类型安全，只能是预定义的类型
  title: '标题',
  content: '内容',
  rating: 5 // 类型检查确保是数字
})
```

### 5. 状态管理集成

```typescript
// 与Pinia store集成
const authStore = useAuthStore()
const { execute: doLogin } = login(username, password)

// 登录成功后自动更新store状态
await doLogin() // 内部会自动调用 authStore.setTokens()
```

## 示例代码

### 完整的登录页面

```vue
<template>
  <div class="login-page">
    <form @submit.prevent="handleSubmit">
      <input 
        v-model="form.username" 
        type="text" 
        placeholder="用户名或邮箱"
        required
      />
      <input 
        v-model="form.password" 
        type="password" 
        placeholder="密码"
        required
      />
      <button 
        type="submit" 
        :disabled="pending"
      >
        {{ pending ? '登录中...' : '登录' }}
      </button>
    </form>
    
    <div v-if="error" class="error">
      {{ error.message }}
    </div>
  </div>
</template>

<script setup>
const { login } = useAuth()

const form = reactive({
  username: '',
  password: ''
})

const { error, pending, execute } = login(form.username, form.password)

const handleSubmit = async () => {
  try {
    await execute()
    // 登录成功，会自动跳转到dashboard
  } catch (err) {
    // 错误已经存储在error中，模板会自动显示
  }
}
</script>
```

### 测验页面

```vue
<template>
  <div class="quiz-page">
    <div v-if="questionsLoading">加载题目中...</div>
    
    <div v-else-if="questions">
      <div v-for="question in questions.data" :key="question.id">
        <h3>{{ question.question }}</h3>
        <div v-for="option in question.options" :key="option">
          <label>
            <input 
              type="radio" 
              :name="question.id"
              :value="option"
              v-model="answers[question.id]"
            />
            {{ option }}
          </label>
        </div>
      </div>
      
      <button 
        @click="handleSubmit"
        :disabled="submitPending"
      >
        {{ submitPending ? '提交中...' : '提交答案' }}
      </button>
    </div>
    
    <div v-if="submitError" class="error">
      {{ submitError.message }}
    </div>
  </div>
</template>

<script setup>
const { fetchQuestions, submitAnswers } = useQuiz()

const level = 'beginner'
const answers = reactive({})

// 获取题目
const { 
  data: questions, 
  pending: questionsLoading 
} = fetchQuestions(level, 10)

// 提交答案
const { 
  error: submitError, 
  pending: submitPending, 
  execute: doSubmit 
} = submitAnswers(level, answers)

const handleSubmit = async () => {
  try {
    const result = await doSubmit()
    console.log('测验完成，得分:', result.score)
    // 可以跳转到结果页面
    navigateTo(`/quiz/result/${result.id}`)
  } catch (err) {
    // 错误处理
  }
}
</script>
```

### 社区帖子列表

```vue
<template>
  <div class="community-page">
    <div class="filters">
      <select v-model="category" @change="refreshPosts">
        <option value="">所有分类</option>
        <option value="general">综合讨论</option>
        <option value="learning">学习交流</option>
        <option value="feedback">意见反馈</option>
      </select>
      
      <select v-model="sortBy" @change="refreshPosts">
        <option value="latest">最新</option>
        <option value="popular">热门</option>
        <option value="hot">热议</option>
      </select>
    </div>
    
    <div v-if="postsLoading">加载中...</div>
    
    <div v-else-if="posts">
      <div 
        v-for="post in posts.data" 
        :key="post.id"
        class="post-item"
      >
        <h3>{{ post.title }}</h3>
        <p>{{ post.content }}</p>
        <div class="post-actions">
          <button @click="handleLike(post.id)">
            👍 {{ post.likes_count }}
          </button>
          <span>💬 {{ post.comments_count }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const { fetchPosts, toggleLike } = useCommunity()

const category = ref('')
const sortBy = ref('latest')

// 获取帖子列表
const { 
  data: posts, 
  pending: postsLoading,
  refresh: refreshPosts
} = fetchPosts(category.value, sortBy.value)

// 点赞功能
const { execute: doToggleLike } = toggleLike(0) // 占位ID

const handleLike = async (postId: number) => {
  try {
    await doToggleLike(postId)
    // 刷新帖子列表以更新点赞数
    refreshPosts()
  } catch (err) {
    console.error('点赞失败:', err)
  }
}
</script>
```

## 总结

本API工具类提供了完整的解决方案，包括：

- ✅ 统一的API调用接口
- ✅ 完善的TypeScript类型支持
- ✅ 响应式状态管理
- ✅ 自动错误处理
- ✅ 与Nuxt.js生态完美集成
- ✅ 简洁易用的组合式函数API

通过遵循本文档的最佳实践，可以高效地开发出类型安全、用户体验良好的应用程序。