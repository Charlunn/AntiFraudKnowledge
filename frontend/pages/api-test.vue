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
        
        <!-- 用户注册 -->
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

        <!-- 用户登录 -->
        <div class="test-section">
          <h4>用户登录</h4>
          <div class="form-group">
            <input v-model="loginForm.username" placeholder="用户名" class="form-input" />
            <input v-model="loginForm.password" type="password" placeholder="密码" class="form-input" />
          </div>
          <button @click="handleLogin" class="btn">登录</button>
        </div>
      </div>

      <!-- 聊天相关测试 -->
      <div v-else-if="activeTab === 'chat'" class="tab-panel">
        <h3>AI聊天</h3>
        <div class="test-section">
          <div class="form-group">
            <input v-model="chatMessage" placeholder="输入问题，例如：什么是电信诈骗？" class="form-input" />
            <div class="checkbox-group">
              <input type="checkbox" id="resetChat" v-model="resetChat" />
              <label for="resetChat">重置对话</label>
            </div>
          </div>
          <button @click="handleChat" class="btn">发送消息</button>
        </div>
      </div>

      <!-- 测验相关测试 -->
      <div v-else-if="activeTab === 'quiz'" class="tab-panel">
        <h3>反诈骗测验</h3>
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
          <button @click="handleGetQuestions" class="btn">获取题目</button>
        </div>

        <div class="test-section" v-if="questions.length > 0">
          <h4>提交答案</h4>
          <div v-for="question in questions" :key="question.id" class="question-item">
            <p>{{ question.question_text }}</p>
            <div v-if="question.question_type === 'single'">
              <div v-for="option in question.options" :key="option.id">
                <input type="radio" :id="`q${question.id}o${option.id}`" :value="option.id" v-model="quizAnswers[question.id]" />
                <label :for="`q${question.id}o${option.id}`">{{ option.option_text }}</label>
              </div>
            </div>
          </div>
          <button @click="handleSubmitAnswers" class="btn">提交答案</button>
        </div>
      </div>

      <!-- 成就相关测试 -->
      <div v-else-if="activeTab === 'achievements'" class="tab-panel">
        <h3>用户成就</h3>
        <div class="test-section">
          <button @click="handleGetAchievements" class="btn">获取成就</button>
        </div>
      </div>

      <!-- 反馈相关测试 -->
      <div v-else-if="activeTab === 'feedback'" class="tab-panel">
        <h3>用户反馈</h3>
        <div class="test-section">
          <div class="form-group">
            <textarea v-model="feedbackMessage" placeholder="请输入您的反馈内容" class="form-input textarea" rows="4"></textarea>
            <select v-model="feedbackType" class="form-input">
              <option value="">选择反馈类型</option>
              <option value="bug">Bug反馈</option>
              <option value="suggestion">功能建议</option>
              <option value="praise">表扬鼓励</option>
              <option value="other">其他</option>
            </select>
            <input v-model="feedbackContact" placeholder="联系方式（可选）" class="form-input" />
          </div>
          <button @click="handleSubmitFeedback" class="btn">提交反馈</button>
        </div>
      </div>
    </div>

    <!-- 结果显示区域 -->
    <div class="result-section">
      <h3>测试结果</h3>
      <div class="result-content" v-if="result">
        <div class="result-type" :class="result.success ? 'success' : 'error'">
          {{ result.success ? '成功' : '失败' }}
        </div>
        <pre class="result-text">{{ result.message }}</pre>
        <div v-if="result.data" class="result-data">
          <p>返回数据：</p>
          <pre>{{ JSON.stringify(result.data, null, 2) }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from '~/stores/auth';
import { register, login } from '~/api/auth';
import { sendMessage } from '~/api/chat';
import { fetchQuestions, submitAnswers } from '~/api/quiz';
import { fetchAchievements } from '~/api/achievements';
import { submitFeedback } from '~/api/feedback';

export default {
  name: 'ApiTestPage',
  data() {
    return {
      activeTab: 'auth',
      tabs: [
        { id: 'auth', name: '认证' },
        { id: 'chat', name: '聊天' },
        { id: 'quiz', name: '测验' },
        { id: 'achievements', name: '成就' },
        { id: 'feedback', name: '反馈' }
      ],
      // 认证表单
      registerForm: {
        username: '',
        nickname: '',
        password: 'ComplexPass123!',
        password2: 'ComplexPass123!'
      },
      loginForm: {
        username: '',
        password: ''
      },
      // 聊天表单
      chatMessage: '',
      resetChat: false,
      // 测验表单
      quizLevel: '',
      questions: [],
      quizAnswers: {},
      // 反馈表单
      feedbackMessage: '',
      feedbackType: '',
      feedbackContact: '',
      // 测试结果
      result: null
    };
  },
  computed: {
    auth() {
      return useAuthStore();
    }
  },
  mounted() {
    this.auth.initialize();
  },
  methods: {
    // 显示测试结果
    showResult(success, message, data = null) {
      this.result = {
        success,
        message,
        data
      };
    },

    // 认证相关方法
    async handleRegister() {
      try {
        this.showResult(false, '正在注册...');
        const response = await register(this.registerForm);
        this.showResult(true, '注册成功', response.data);
      } catch (error) {
        this.showResult(false, `注册失败: ${error.response?.data?.detail || error.message}`);
      }
    },

    async handleLogin() {
      try {
        this.showResult(false, '正在登录...');
        const response = await login(this.loginForm.username, this.loginForm.password);
        this.auth.setTokens(response.data.access, response.data.refresh);
        this.showResult(true, '登录成功', response.data);
      } catch (error) {
        this.showResult(false, `登录失败: ${error.response?.data?.detail || error.message}`);
      }
    },

    handleLogout() {
      this.auth.clear();
      this.showResult(true, '已退出登录');
    },

    // 聊天相关方法
    async handleChat() {
      try {
        this.showResult(false, '正在发送消息...');
        const response = await sendMessage(this.chatMessage, this.resetChat);
        this.showResult(true, '消息发送成功', response.data);
      } catch (error) {
        this.showResult(false, `消息发送失败: ${error.response?.data?.detail || error.message}`);
      }
    },

    // 测验相关方法
    async handleGetQuestions() {
      try {
        this.showResult(false, '正在获取题目...');
        const response = await fetchQuestions(this.quizLevel);
        this.questions = response.data;
        this.quizAnswers = {};
        this.showResult(true, '获取题目成功', response.data);
      } catch (error) {
        this.showResult(false, `获取题目失败: ${error.response?.data?.detail || error.message}`);
      }
    },

    async handleSubmitAnswers() {
      try {
        this.showResult(false, '正在提交答案...');
        const response = await submitAnswers(this.quizLevel || 'all', this.quizAnswers);
        this.showResult(true, '答案提交成功', response.data);
      } catch (error) {
        this.showResult(false, `答案提交失败: ${error.response?.data?.detail || error.message}`);
      }
    },

    // 成就相关方法
    async handleGetAchievements() {
      try {
        this.showResult(false, '正在获取成就...');
        const response = await fetchAchievements();
        this.showResult(true, '获取成就成功', response.data);
      } catch (error) {
        this.showResult(false, `获取成就失败: ${error.response?.data?.detail || error.message}`);
      }
    },

    // 反馈相关方法
    async handleSubmitFeedback() {
      try {
        this.showResult(false, '正在提交反馈...');
        const response = await submitFeedback({
          message: this.feedbackMessage,
          type: this.feedbackType,
          contact: this.feedbackContact
        });
        this.showResult(true, '反馈提交成功', response.data);
      } catch (error) {
        this.showResult(false, `反馈提交失败: ${error.response?.data?.detail || error.message}`);
      }
    }
  }
};
</script>

<style scoped>
.api-test-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

header {
  text-align: center;
  margin-bottom: 30px;
}

header h1 {
  color: #333;
  margin-bottom: 10px;
}

header p {
  color: #666;
  font-size: 16px;
}

.auth-status {
  text-align: right;
  margin-bottom: 20px;
  padding: 10px;
  background-color: #f5f5f5;
  border-radius: 5px;
}

.test-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 30px;
}

.tab-btn {
  padding: 10px 20px;
  border: 1px solid #ddd;
  background-color: #fff;
  border-radius: 5px;
  cursor: pointer;
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

.test-content {
  background-color: #fafafa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
}

.tab-panel {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.test-section {
  margin-bottom: 30px;
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.test-section h4 {
  margin-bottom: 15px;
  color: #333;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.form-group {
  margin-bottom: 20px;
}

.form-input {
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
}

.form-input.textarea {
  resize: vertical;
  min-height: 100px;
}

.checkbox-group {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.checkbox-group input[type="checkbox"] {
  margin-right: 8px;
}

.btn {
  padding: 10px 20px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.btn:hover {
  background-color: #35495e;
}

.logout-btn {
  background-color: #ff4444;
}

.logout-btn:hover {
  background-color: #cc0000;
}

.question-item {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 5px;
}

.question-item p {
  margin-bottom: 10px;
  font-weight: 500;
}

.question-item input[type="radio"] {
  margin-right: 8px;
}

.result-section {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.result-section h3 {
  margin-bottom: 15px;
  color: #333;
}

.result-content {
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 5px;
}

.result-type {
  padding: 8px 15px;
  margin-bottom: 10px;
  border-radius: 5px;
  font-weight: 500;
}

.result-type.success {
  background-color: #d4edda;
  color: #155724;
}

.result-type.error {
  background-color: #f8d7da;
  color: #721c24;
}

.result-text {
  background-color: white;
  padding: 10px;
  border-radius: 5px;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-word;
}

.result-data {
  margin-top: 15px;
}

.result-data pre {
  background-color: #2d3748;
  color: #e2e8f0;
  padding: 15px;
  border-radius: 5px;
  overflow-x: auto;
  font-family: 'Courier New', Courier, monospace;
}

@media (max-width: 768px) {
  .test-tabs {
    flex-direction: column;
  }
  
  .tab-btn {
    width: 100%;
  }
}
</style>