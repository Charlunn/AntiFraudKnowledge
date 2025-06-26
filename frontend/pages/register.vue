<template>
  <div class="container register-container">
    <div class="card register-card">
      <h2>用户注册</h2>
      <form @submit.prevent="handleRegistration">
        <div class="form-group">
          <label for="username">账号 (唯一标识符):</label>
          <input type="text" id="username" v-model="formData.username" required>
        </div>
        <div class="form-group">
          <label for="nickname">昵称 (显示名):</label>
          <input type="text" id="nickname" v-model="formData.nickname" required>
        </div>
        <div class="form-group">
          <label for="password">密码:</label>
          <input type="password" id="password" v-model="formData.password" required>
        </div>
        <div class="form-group">
          <label for="password2">确认密码:</label>
          <input type="password" id="password2" v-model="formData.password2" required>
        </div>
        <div class="form-group">
          <label for="email">邮箱 (可选):</label>
          <input type="email" id="email" v-model="formData.email">
        </div>
        <div class="form-group">
          <label for="phone_number">手机号 (可选):</label>
          <input type="text" id="phone_number" v-model="formData.phone_number">
        </div>
        <div class="form-group">
          <label for="avatar">头像 (可选):</label>
          <input type="file" id="avatar" @change="handleAvatarChange" accept="image/*">
        </div>

        <button type="submit" :disabled="loading">注册</button>
      </form>
      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
      <p class="login-link">已有账号？<NuxtLink to="/login">去登录</NuxtLink></p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '~/stores/auth'; // Import the auth store

const formData = ref({
  username: '',
  nickname: '',
  password: '',
  password2: '',
  email: '',
  phone_number: '',
  avatar: null,
});

const loading = ref(false);
const errorMessage = ref('');
const router = useRouter();
const authStore = useAuthStore(); // Initialize the auth store

const handleAvatarChange = (event) => {
  formData.value.avatar = event.target.files[0];
};

const handleRegistration = async () => {
  errorMessage.value = '';
  loading.value = true;

  // 前端验证
  if (formData.value.password !== formData.value.password2) {
    errorMessage.value = '两次输入的密码不一致';
    loading.value = false;
    return;
  }

  try {
    // 检查是否有头像文件上传
    if (formData.value.avatar) {
      // 如果有文件上传，使用FormData
      const data = new FormData();
      for (const key in formData.value) {
        if (formData.value[key]) {
          data.append(key, formData.value[key]);
        }
      }
      await authStore.register(data);
    } else {
      // 如果没有文件上传，直接使用JSON格式
      await authStore.register({
        username: formData.value.username,
        nickname: formData.value.nickname,
        password: formData.value.password,
        password2: formData.value.password2,
        email: formData.value.email || '',
        phone_number: formData.value.phone_number || '',
      });
    }

    alert('注册成功！'); // TODO: Replace with a better notification
    router.push('/login'); // Redirect to login page

  } catch (error) {
    console.error('Registration failed:', error);
    if (error.response && error.response.data) {
      // 显示详细的错误信息
      const errorData = error.response.data;
      if (typeof errorData === 'object') {
        // 如果是对象，尝试提取错误消息
        const errorMessages = [];
        for (const key in errorData) {
          if (Array.isArray(errorData[key])) {
            errorMessages.push(`${key}: ${errorData[key].join(', ')}`);
          } else if (typeof errorData[key] === 'string') {
            errorMessages.push(`${key}: ${errorData[key]}`);
          }
        }
        errorMessage.value = errorMessages.join('\n') || '注册失败，请检查表单信息';
      } else {
        errorMessage.value = errorData.message || '注册失败，请稍后再试';
      }
    } else if (error.request) {
        errorMessage.value = '网络错误，请稍后再试。无法连接到服务器。';
    } else {
        errorMessage.value = '发生未知错误，请稍后再试。';
    }
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* Add styles here to match the overall theme */
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - var(--header-height, 0px) - var(--footer-height, 0px));
  padding: 20px;
}

.register-card {
  width: 100%;
  max-width: 500px;
  padding: 30px;
  box-shadow: 0 8px 24px var(--shadow-color);
  border-radius: 15px;
  background-color: var(--surface-color);
}

.register-card h2 {
  text-align: center;
  margin-bottom: 20px;
  color: var(--text-color);
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: var(--subtle-text-color);
}

.form-group input[type="text"],
.form-group input[type="password"],
.form-group input[type="email"],
.form-group input[type="text"] { /* Targeting phone_number input */
  width: 100%;
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 1rem;
}

.form-group input[type="file"] {
    padding: 10px 0;
}

button[type="submit"] {
  width: 100%;
  padding: 12px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.1rem;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
}

button[type="submit"]:hover:not(:disabled) {
  background-color: var(--primary-color-dark);
  box-shadow: 0 4px 8px var(--hover-shadow-color);
}

button[type="submit"]:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
  opacity: 0.7;
}

.error-message {
  color: red;
  margin-top: 10px;
  text-align: center;
}

.login-link {
  text-align: center;
  margin-top: 20px;
  color: var(--subtle-text-color);
}

.login-link a {
  color: var(--primary-color);
  text-decoration: none;
}

.login-link a:hover {
  text-decoration: underline;
}
</style>