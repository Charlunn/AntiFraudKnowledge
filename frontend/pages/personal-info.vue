<template>
  <div class="personal-info-container">
    <h1>个人信息</h1>
    <div v-if="user" class="user-details">
      <div class="avatar-section">
        <img :src="user.avatar || '/default-avatar.png'" alt="User Avatar" class="user-avatar" />
        <input type="file" @change="onFileChange" accept="image/*" />
      </div>
      <form @submit.prevent="updateProfile">
        <div class="form-group">
          <label for="username">用户名:</label>
          <input type="text" id="username" v-model="user.username" disabled />
        </div>
        <div class="form-group">
          <label for="nickname">昵称:</label>
          <input type="text" id="nickname" v-model="user.nickname" />
        </div>
        <div class="form-group">
          <label for="email">邮箱:</label>
          <input type="email" id="email" v-model="user.email" />
        </div>
        <div class="form-group">
          <label for="phone_number">手机号:</label>
          <input type="text" id="phone_number" v-model="user.phone_number" />
        </div>
        <div class="form-group">
          <label>用户类型:</label>
          <p>{{ user.user_type }}</p>
        </div>
        <div class="form-group">
          <label>反诈等级:</label>
          <p>{{ user.fraud_level }}</p>
        </div>
        <button type="submit" :disabled="loading">更新信息</button>
      </form>
      <p v-if="message" :class="{ 'success-message': !isError, 'error-message': isError }">{{ message }}</p>
    </div>
    <div v-else>
      <p>正在加载用户信息...</p>
    </div>

    <!-- 修改密码和删除账号功能 -->
    <div class="action-section">
      <h3>修改密码</h3>
      <form @submit.prevent="changePassword">
        <div class="form-group">
          <label for="old_password">旧密码:</label>
          <input type="password" id="old_password" v-model="passwordData.old_password" required />
        </div>
        <div class="form-group">
          <label for="new_password">新密码:</label>
          <input type="password" id="new_password" v-model="passwordData.new_password" required />
        </div>
        <div class="form-group">
          <label for="new_password2">确认新密码:</label>
          <input type="password" id="new_password2" v-model="passwordData.new_password2" required />
        </div>
        <button type="submit" :disabled="loadingPasswordChange">修改密码</button>
      </form>
      <p v-if="passwordMessage" :class="{ 'success-message': !isPasswordError, 'error-message': isPasswordError }">{{ passwordMessage }}</p>

      <h3>删除账号</h3>
      <button @click="confirmDeleteAccount" class="delete-button">删除账号</button>
      <p v-if="deleteMessage" :class="{ 'success-message': !isDeleteError, 'error-message': isDeleteError }">{{ deleteMessage }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '~/stores/auth';
import axios from 'axios';
import { useRouter } from 'vue-router';

// 定义页面元数据，指示此页面需要用户认证
definePageMeta({
  requiresAuth: true,
});

const authStore = useAuthStore();
const router = useRouter();
const user = ref(null);
const loading = ref(false);
const message = ref('');
const isError = ref(false);

const passwordData = ref({
  old_password: '',
  new_password: '',
  new_password2: '',
});
const loadingPasswordChange = ref(false);
const passwordMessage = ref('');
const isPasswordError = ref(false);

const deleteMessage = ref('');
const isDeleteError = ref(false);

const fetchUserProfile = async () => {
  if (!authStore.isAuthenticated) {
    // 如果未认证，不尝试获取用户信息，并重定向到登录页
    router.push('/login');
    return;
  }
  try {
    loading.value = true;
    const response = await axios.get('/users/profile/');
    user.value = response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    message.value = '获取个人信息失败。';
    isError.value = true;
    if (error.response && error.response.status === 401) {
      // Token might be expired or invalid, log out
      authStore.logout();
      router.push('/login');
    }
  } finally {
    loading.value = false;
  }
};

const onFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    user.value.avatarFile = file; // Store the file object temporarily
    // Optionally, show a preview of the new avatar
    const reader = new FileReader();
    reader.onload = (e) => {
      user.value.avatar = e.target.result; // Update avatar for preview
    };
    reader.readAsDataURL(file);
  }
};

const updateProfile = async () => {
  loading.value = true;
  message.value = '';
  isError.value = false;

  const formData = new FormData();
  if (user.value.nickname) formData.append('nickname', user.value.nickname);
  if (user.value.email) formData.append('email', user.value.email);
  if (user.value.phone_number) formData.append('phone_number', user.value.phone_number);
  if (user.value.avatarFile) formData.append('avatar', user.value.avatarFile);

  try {
    // Ensure Content-Type is not set manually for FormData
    const response = await axios.patch('/users/profile/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    user.value = response.data;
    message.value = '个人信息更新成功！';
    isError.value = false;
  } catch (error) {
    console.error('Error updating profile:', error);
    message.value = error.response?.data?.detail || '更新个人信息失败。';
    isError.value = true;
  } finally {
    loading.value = false;
  }
};

const changePassword = async () => {
  loadingPasswordChange.value = true;
  passwordMessage.value = '';
  isPasswordError.value = false;

  try {
    const response = await axios.post('/users/change-password/', passwordData.value);
    passwordMessage.value = response.data.message;
    isPasswordError.value = false;
    passwordData.value = { old_password: '', new_password: '', new_password2: '' }; // Clear form
    // Optionally, log out the user after password change for re-login with new password
    // authStore.logout();
    // router.push('/login');
  } catch (error) {
    console.error('Error changing password:', error);
    passwordMessage.value = error.response?.data?.old_password?.[0] || error.response?.data?.new_password?.[0] || error.response?.data?.detail || '修改密码失败。';
    isPasswordError.value = true;
  } finally {
    loadingPasswordChange.value = false;
  }
};

const confirmDeleteAccount = () => {
  if (confirm('您确定要删除您的账号吗？此操作不可逆转。')) {
    deleteAccount();
  }
};

const deleteAccount = async () => {
  deleteMessage.value = '';
  isDeleteError.value = false;
  try {
    await axios.delete('/users/delete-account/');
    deleteMessage.value = '账号删除成功！您已被登出。';
    isDeleteError.value = false;
    authStore.logout();
    router.push('/register'); // Redirect to register or home page
  } catch (error) {
    console.error('Error deleting account:', error);
    deleteMessage.value = error.response?.data?.detail || '删除账号失败。';
    isDeleteError.value = true;
  }
};

onMounted(() => {
  fetchUserProfile();
});
</script>

<style scoped>
.personal-info-container {
  padding: 20px;
  max-width: 600px;
  margin: 20px auto;
  background-color: var(--surface-color);
  border-radius: 15px;
  box-shadow: 0 8px 24px var(--shadow-color);
}

h1 {
  text-align: center;
  color: var(--primary-color);
  margin-bottom: 30px;
}

.user-details, .action-section {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  background-color: var(--background-color);
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
}

.user-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--primary-color);
  margin-bottom: 10px;
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
.form-group input[type="email"],
.form-group input[type="password"] {
  width: 100%;
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 1rem;
  background-color: var(--input-background);
  color: var(--text-color);
}

.form-group input[type="text"][disabled] {
  background-color: var(--disabled-input-background);
  cursor: not-allowed;
}

button[type="submit"],
.delete-button {
  width: 100%;
  padding: 12px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.1rem;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
  margin-top: 10px;
}

button[type="submit"]:hover:not(:disabled),
.delete-button:hover {
  background-color: var(--primary-color-dark);
  box-shadow: 0 4px 8px var(--hover-shadow-color);
}

button[type="submit"]:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
  opacity: 0.7;
}

.delete-button {
  background-color: var(--danger-color);
}

.delete-button:hover {
  background-color: var(--danger-color-dark);
}

.success-message {
  color: green;
  text-align: center;
  margin-top: 10px;
}

.error-message {
  color: red;
  text-align: center;
  margin-top: 10px;
}

p {
  color: var(--text-color);
}

</style>
