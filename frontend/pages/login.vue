<template>
  <div class="container login-container">
    <div class="card login-card">
      <h2>用户登录</h2>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="identifier">账号/邮箱/手机号:</label>
          <input type="text" id="identifier" v-model="formData.identifier" required>
        </div>
        <div class="form-group">
          <label for="password">密码:</label>
          <input type="password" id="password" v-model="formData.password" required>
        </div>

        <button type="submit" :disabled="loading">登录</button>
      </form>
      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
      <p class="register-link">没有账号？<NuxtLink to="/register">去注册</NuxtLink></p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '~/stores/auth'; // Import the auth store

const formData = ref({
  identifier: '', // Can be username, email, or phone_number
  password: '',
});

const loading = ref(false);
const errorMessage = ref('');
const router = useRouter();
const authStore = useAuthStore(); // Initialize the auth store

const handleLogin = async () => {
  errorMessage.value = '';
  loading.value = true;

  try {
    // Call the login action from the store
    await authStore.login(formData.value);

    console.log('Login successful!');
    router.push('/'); // Redirect to home page

  } catch (error) {
    console.error('Error during login:', error);
     if (error.response) {
        errorMessage.value = error.response.data.detail || '登录失败，请检查账号/邮箱/手机号和密码。';
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
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
   min-height: calc(100vh - var(--header-height, 0px) - var(--footer-height, 0px));
   padding: 20px;
}

.login-card {
  width: 100%;
  max-width: 400px;
  padding: 30px;
  box-shadow: 0 8px 24px var(--shadow-color);
  border-radius: 15px;
  background-color: var(--surface-color);
}

.login-card h2 {
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
.form-group input[type="password"] {
  width: 100%;
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 1rem;
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

.register-link {
  text-align: center;
  margin-top: 20px;
  color: var(--subtle-text-color);
}

.register-link a {
  color: var(--primary-color);
  text-decoration: none;
}

.register-link a:hover {
  text-decoration: underline;
}
</style>
