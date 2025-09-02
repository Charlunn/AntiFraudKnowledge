<template>
  <div class="api-test-container">
    <header>
      <h1>API 测试中心</h1>
      <p>通过这个界面可以全方位测试所有API接口功能，结果将显示在下方</p>
    </header>

    <div class="auth-status">
      <div v-if="auth.accessToken">
        <span>已登录</span>
        <button @click="handleLogout" class="btn logout-btn">退出登录</button>
      </div>
      <div v-else>
        <span>未登录</span>
      </div>
    </div>

    <div class="test-tabs">
      <button 
        v-for="tab in tabs" 
        :key="tab.id" 
        :class="['tab-btn', { active: activeTab === tab.id }]"
        @click="activeTab = tab.id"
      >
        {{ tab.name }}
      </button>
    </div>

    <div class="test-content">
      <!-- 认证相关测试 -->
      <div v-if="activeTab === 'auth'" class="tab-panel">
        <h3>用户认证</h3>
        <div class="test-section">
          <h4>用户注册</h4>
          <div class="form-group">
            <input v-model="registerForm.username" placeholder="用户名" class="form-input" />
            <input v-model="registerForm.nickname" placeholder="昵称" class="form-input" />
            <input v-model="registerForm.password" type="password" placeholder="密码" class="form-input" />
            <input v-model="registerForm.password2" type="password" placeholder="确认密码" class="form-input" />
          </div>
          <button @click="handleRegister" class="btn">注册</button>
        </div>

        <div class="test-section">
          <h4>用户登录</h4>
          <div class="form-group">
            <input v-model="loginForm.username" placeholder="用户名" class="form-input" />
            <input v-model="loginForm.password" type="password" placeholder="密码" class="form-input" />
          </div>
          <button @click="handleLogin" class="btn">登录</button>
        </div>

        <div class="test-section">
          <h4>获取用户资料</h4>
          <button @click="handleFetchProfile" class="btn">获取资料</button>
        </div>

        <div class="test-section">
          <h4>修改密码</h4>
          <div class="form-group">
            <input v-model="passwordForm.oldPassword" type="password" placeholder="当前密码" class="form-input" />
            <input v-model="passwordForm.newPassword" type="password" placeholder="新密码" class="form-input" />
          </div>
          <button @click="handleChangePassword" class="btn">修改密码</button>
        </div>

        <div class="test-section">
          <h4>账号设置</h4>
          <div class="form-group">
            <select v-model="settingsForm.language" class="form-input">
              <option value="zh">中文</option>
              <option value="en">英文</option>
            </select>
            <select v-model="settingsForm.theme" class="form-input">
              <option value="light">浅色</option>
              <option value="dark">深色</option>
            </select>
          </div>
          <button @click="handleUpdateSettings" class="btn">更新设置</button>
          <button @click="handleGetSettings" class="btn">获取设置</button>
        </div>

        <div class="test-section">
          <h4>账号管理</h4>
          <button @click="handleDeleteAccount" class="btn danger-btn">删除账号</button>
        </div>
      </div>

      <!-- 成就相关测试 -->
      <div v-if="activeTab === 'achievements'" class="tab-panel">
        <h3>成就系统</h3>
        <div class="test-section">
          <h4>获取成就列表</h4>
          <button @click="handleFetchAchievements" class="btn">获取成就</button>
        </div>

        <div class="test-section">
          <h4>授予成就</h4>
          <div class="form-group">
            <input v-model="achievementId" type="number" placeholder="成就ID" class="form-input" />
          </div>
          <button @click="handleGrantAchievement" class="btn">授予成就</button>
        </div>
      </div>

      <!-- 反馈相关测试 -->
      <div v-if="activeTab === 'feedback'" class="tab-panel">
        <h3>反馈系统</h3>
        <div class="test-section">
          <h4>提交反馈</h4>
          <div class="form-group">
            <textarea v-model="feedbackForm.message" placeholder="反馈内容" class="form-input" rows="4"></textarea>
            <input v-model="feedbackForm.type" placeholder="反馈类型" class="form-input" />
            <input v-model="feedbackForm.contact" placeholder="联系方式" class="form-input" />
          </div>
          <button @click="handleSubmitFeedback" class="btn">提交反馈</button>
        </div>
      </div>

      <!-- 测验相关测试 -->
      <div v-if="activeTab === 'quiz'" class="tab-panel">
        <h3>测验系统</h3>
        <div class="test-section">
          <h4>获取题目</h4>
          <div class="form-group">
            <select v-model="quizLevel" class="form-input">
              <option value="">所有难度</option>
              <option value="easy">简单</option>
              <option value="medium">中等</option>
              <option value="hard">困难</option>
            </select>
          </div>
          <button @click="handleFetchQuestions" class="btn">获取题目</button>
        </div>

        <div class="test-section">
          <h4>提交答案</h4>
          <div class="form-group">
            <select v-model="submitQuizLevel" class="form-input">
              <option value="easy">简单</option>
              <option value="medium">中等</option>
              <option value="hard">困难</option>
            </select>
            <textarea v-model="quizAnswers" placeholder="答案 JSON，例如：{'1':'A','2':'B'}" class="form-input" rows="3"></textarea>
          </div>
          <button @click="handleSubmitAnswers" class="btn">提交答案</button>
        </div>
      </div>

      <!-- 聊天相关测试 -->
      <div v-if="activeTab === 'chat'" class="tab-panel">
        <h3>AI 聊天</h3>
        <div class="test-section">
          <h4>发送消息</h4>
          <div class="form-group">
            <textarea v-model="chatMessage" placeholder="输入消息" class="form-input" rows="3"></textarea>
            <label><input type="checkbox" v-model="resetChat" /> 重置对话</label>
          </div>
          <button @click="handleSendMessage" class="btn">发送消息</button>
        </div>
      </div>
    </div>

    <!-- 结果展示区域 -->
    <div class="results-section">
      <h3>API 调用结果</h3>
      <div class="result-container">
        <pre v-if="resultData">{{ resultData }}</pre>
        <p v-else>请选择上方的API进行测试</p>
      </div>
    </div>

    <!-- 工具类调用说明 -->
    <div class="docs-section">
      <h3>工具类调用文档</h3>
      <div class="doc-content">
        <h4>1. HTTP 基础封装 (http.js)</h4>
        <pre>import apiClient from './http';

// 基本使用方法
try {
  const response = await apiClient.get('/api/endpoint');
  console.log(response.data);
} catch (error) {
  console.error('API调用失败:', error);
}</pre>

        <h4>2. 认证相关 (auth.js)</h4>
        <pre>import { login, fetchProfile, logout } from '~/api/auth';

// 登录示例
const { data } = await login('username', 'password');
const auth = useAuthStore();
auth.setTokens(data.access, data.refresh);

// 获取用户资料
const profile = await fetchProfile();

// 退出登录
await logout(auth.refreshToken);
auth.clear();</pre>

        <h4>3. 其他工具类</h4>
        <p>所有工具类都遵循相似的调用模式，通过async/await处理异步请求，并使用try/catch捕获可能的错误。</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { register, login, fetchProfile, changePassword, deleteAccount, getSettings, updateSettings, logout } from '~/api/auth';
import { fetchAchievements, grantAchievement } from '~/api/achievements';
import { submitFeedback } from '~/api/feedback';
import { fetchQuestions, submitAnswers } from '~/api/quiz';
import { sendMessage } from '~/api/chat';
import { useAuthStore } from '~/stores/auth';

// 状态管理
const auth = useAuthStore();
const activeTab = ref('auth');
const resultData = ref(null);

// 标签页配置
const tabs = [
  { id: 'auth', name: '认证' },
  { id: 'achievements', name: '成就' },
  { id: 'feedback', name: '反馈' },
  { id: 'quiz', name: '测验' },
  { id: 'chat', name: '聊天' }
];

// 表单数据
const registerForm = reactive({ username: 'demo', nickname: '测试用户', password: 'password123', password2: 'password123' });
const loginForm = reactive({ username: 'demo', password: 'password123' });
const passwordForm = reactive({ oldPassword: 'password123', newPassword: 'newpass123' });
const settingsForm = reactive({ language: 'en', theme: 'light' });
const achievementId = ref(1);
const feedbackForm = reactive({ message: '测试反馈内容', type: 'suggestion', contact: 'demo@example.com' });
const quizLevel = ref('easy');
const submitQuizLevel = ref('easy');
const quizAnswers = ref('{"1":"A","2":"B"}');
const chatMessage = ref('什么是电信诈骗？');
const resetChat = ref(false);

// 初始化认证状态
auth.initialize();

// 显示结果的通用方法
const showResult = (data, error = false) => {
  if (error) {
    resultData.value = `错误: ${JSON.stringify(data, null, 2)}`;
  } else {
    resultData.value = JSON.stringify(data, null, 2);
  }
};

// 认证相关方法
const handleRegister = async () => {
  try {
    const response = await register(registerForm);
    showResult({ message: '注册成功', data: response.data });
  } catch (e) {
    showResult(e.response?.data || e.message, true);
  }
};

const handleLogin = async () => {
  try {
    const { data } = await login(loginForm.username, loginForm.password);
    auth.setTokens(data.access, data.refresh);
    showResult({ message: '登录成功', data });
  } catch (e) {
    showResult(e.response?.data || e.message, true);
  }
};

const handleFetchProfile = async () => {
  try {
    const profile = await fetchProfile();
    showResult(profile.data);
  } catch (e) {
    showResult(e.response?.data || e.message, true);
  }
};

const handleChangePassword = async () => {
  try {
    await changePassword({
      old_password: passwordForm.oldPassword,
      new_password: passwordForm.newPassword
    });
    showResult({ message: '密码修改成功' });
  } catch (e) {
    showResult(e.response?.data || e.message, true);
  }
};

const handleGetSettings = async () => {
  try {
    const settings = await getSettings();
    showResult(settings.data);
  } catch (e) {
    showResult(e.response?.data || e.message, true);
  }
};

const handleUpdateSettings = async () => {
  try {
    await updateSettings(settingsForm);
    showResult({ message: '设置更新成功' });
  } catch (e) {
    showResult(e.response?.data || e.message, true);
  }
};

const handleDeleteAccount = async () => {
  if (confirm('确定要删除账号吗？此操作不可恢复！')) {
    try {
      await deleteAccount();
      auth.clear();
      showResult({ message: '账号已删除' });
    } catch (e) {
      showResult(e.response?.data || e.message, true);
    }
  }
};

const handleLogout = async () => {
  try {
    await logout(auth.refreshToken);
    auth.clear();
    showResult({ message: '已退出登录' });
  } catch (e) {
    auth.clear();
    showResult(e.response?.data || e.message, true);
  }
};

// 成就相关方法
const handleFetchAchievements = async () => {
  try {
    const ach = await fetchAchievements();
    showResult(ach.data);
  } catch (e) {
    showResult(e.response?.data || e.message, true);
  }
};

const handleGrantAchievement = async () => {
  try {
    await grantAchievement(Number(achievementId.value));
    showResult({ message: '成就授予成功' });
  } catch (e) {
    showResult(e.response?.data || e.message, true);
  }
};

// 反馈相关方法
const handleSubmitFeedback = async () => {
  try {
    await submitFeedback(feedbackForm);
    showResult({ message: '反馈提交成功' });
  } catch (e) {
    showResult(e.response?.data || e.message, true);
  }
};

// 测验相关方法
const handleFetchQuestions = async () => {
  try {
    const q = await fetchQuestions(quizLevel.value || undefined);
    showResult(q.data);
  } catch (e) {
    showResult(e.response?.data || e.message, true);
  }
};

const handleSubmitAnswers = async () => {
  try {
    let answers = {};
    try {
      answers = JSON.parse(quizAnswers.value);
    } catch (parseError) {
      throw new Error('答案格式错误，请输入有效的JSON');
    }
    const result = await submitAnswers(submitQuizLevel.value, answers);
    showResult(result.data);
  } catch (e) {
    showResult(e.response?.data || e.message, true);
  }
};

// 聊天相关方法
const handleSendMessage = async () => {
  try {
    const msg = await sendMessage(chatMessage.value, resetChat.value);
    showResult(msg.data);
  } catch (e) {
    showResult(e.response?.data || e.message, true);
  }
};
</script>

<style scoped>
.api-test-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

header {
  text-align: center;
  margin-bottom: 30px;
}

h1 {
  color: #333;
  font-size: 2.5rem;
}

h2 {
  color: #555;
  font-size: 1.8rem;
  margin-top: 20px;
}

h3 {
  color: #666;
  font-size: 1.5rem;
  margin-top: 15px;
}

h4 {
  color: #777;
  font-size: 1.2rem;
  margin-top: 10px;
}

p {
  color: #666;
  line-height: 1.6;
}

.auth-status {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 20px;
  padding: 10px;
  background-color: #f5f5f5;
  border-radius: 5px;
}

.test-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
}

.tab-btn {
  padding: 10px 20px;
  border: 1px solid #ddd;
  background-color: #fff;
  cursor: pointer;
  border-radius: 5px;
  transition: all 0.3s;
}

.tab-btn:hover {
  background-color: #f5f5f5;
}

.tab-btn.active {
  background-color: #42b983;
  color: white;
  border-color: #42b983;
}

.tab-panel {
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 5px;
}

.test-section {
  margin-bottom: 30px;
  padding: 15px;
  background-color: white;
  border-radius: 5px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 15px;
}

.form-input {
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.btn {
  padding: 10px 20px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.btn:hover {
  background-color: #3aa674;
}

.logout-btn {
  background-color: #ff6b6b;
  margin-left: 10px;
}

.logout-btn:hover {
  background-color: #ff5252;
}

.danger-btn {
  background-color: #ff6b6b;
}

.danger-btn:hover {
  background-color: #ff5252;
}

.results-section {
  margin-top: 40px;
}

.result-container {
  background-color: #f5f5f5;
  padding: 20px;
  border-radius: 5px;
  max-height: 400px;
  overflow-y: auto;
}

pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: 'Courier New', Courier, monospace;
}

.docs-section {
  margin-top: 40px;
}

.doc-content {
  background-color: #f5f5f5;
  padding: 20px;
  border-radius: 5px;
}

.doc-content h4 {
  margin-top: 20px;
  color: #333;
}

.doc-content pre {
  background-color: #333;
  color: #fff;
  padding: 15px;
  border-radius: 5px;
  overflow-x: auto;
}
</style>
