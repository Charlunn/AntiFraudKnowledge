<template>
  <div>
    <!-- AppHeader 和 AppFooter 已在布局文件中包含 -->
    <main class="personal-info-content">
      <h1>个人信息</h1>

      <!-- 使用 authStore.loading 判断是否加载中 -->
      <div v-if="authStore.loading">加载中...</div>
      <!-- 使用 authStore.error 判断是否有错误 -->
      <div v-else-if="authStore.error">{{ authStore.error }}</div>
      <!-- 如果没有加载中也没有错误，并且 authStore.user 有数据 -->
      <div v-else-if="authStore.user" class="personal-info-sections">
        <!-- 基本信息区域 -->
        <section class="info-section-card">
          <h2>基本信息</h2>
          <div class="info-item">
            <span class="item-label">账号：</span>
            <span class="item-value">{{ authStore.user.username }}</span>
          </div>
          <div class="info-item editable-field-content">
            <span class="item-label">昵称：</span>
            <span v-if="!editingNickname" class="item-value">{{ authStore.user.nickname }}</span>
            <input v-else v-model="newNickname" type="text" :placeholder="authStore.user.nickname" class="edit-input">
            <button @click="toggleEditNickname" class="edit-button">{{ editingNickname ? '保存' : '修改' }}</button>
            <button v-if="editingNickname" @click="cancelEditNickname" class="cancel-button">取消</button>
          </div>
           <div class="info-item">
              <span class="item-label">反诈等级：</span>
              <span class="item-value">{{ authStore.user.fraud_level }}</span> <!-- 使用 fraud_level 字段 -->
          </div>
          <!-- TODO: 添加生日、性别等其他基本信息 -->
        </section>

        <!-- 联系信息区域 -->
        <section class="info-section-card">
          <h2>联系信息</h2>
          <div class="info-item editable-field-content">
            <span class="item-label">邮箱：</span>
            <span v-if="authStore.user.email" class="item-value">{{ authStore.user.email }} (已绑定)</span>
            <span v-else class="item-value">未绑定</span>
            <!-- 动态绑定类，根据 authStore.user?.email 存在决定按钮颜色 -->
            <button
              @click="handleEmailAction"
              class="action-button"
              :class="{ 'unbind-button': authStore.user?.email }"
            >
              {{ authStore.user?.email ? '换绑' : '绑定' }}
            </button>
          </div>
          <div class="info-item editable-field-content">
            <span class="item-label">手机号：</span>
            <!-- 根据 authStore.user 中的 phone_number 字段判断是否已绑定 -->
            <span v-if="authStore.user?.phone_number" class="item-value">{{ authStore.user.phone_number }} (已绑定)</span>
            <span v-else class="item-value">未绑定</span>
             <!-- 动态绑定类，根据 authStore.user?.phone_number 存在决定按钮颜色 -->
            <button
              @click="handlePhoneAction"
              class="action-button"
              :class="{ 'unbind-button': authStore.user?.phone_number }" >
              {{ authStore.user?.phone_number ? '换绑' : '绑定' }}
            </button>
          </div>
        </section>


        <!-- 修改密码区域 -->
        <section class="info-section-card">
            <h2>修改密码</h2>
            <div v-if="passwordChangeSuccess" class="success-message">密码修改成功！</div>
            <div v-if="passwordChangeError" class="error-message">{{ passwordChangeError }}</div>
             <div class="password-change-fields">
                <input v-model="oldPassword" type="password" placeholder="旧密码">
                <input v-model="newPassword" type="password" placeholder="新密码">
                <input v-model="confirmPassword" type="password" placeholder="确认新密码">
            </div>
             <button @click="changePassword" class="change-password-button">修改密码</button>
        </section>


        <!-- TODO: 添加成就和设置区域 -->
      </div>
      <!-- 如果没有加载中，没有错误，也没有 user 数据 -->
      <div v-else>
        <p>无法加载用户信息。</p>
      </div>
    </main>
    <!-- AppHeader 和 AppFooter 已在布局文件中包含 -->
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useAuthStore } from '~/stores/auth'; // 假设你的auth store在这里
import { useRouter } from 'vue-router'; // 引入 useRouter
import { useRuntimeConfig } from '#app'; // 引入 useRuntimeConfig
import axios from 'axios'; // 引入 axios

// 指定使用 user-center 布局
definePageMeta({
  layout: 'user-center'
});

const authStore = useAuthStore();
const router = useRouter(); // 初始化 router
const runtimeConfig = useRuntimeConfig(); // 获取运行时配置

const editingNickname = ref(false);
const newNickname = ref('');

const oldPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const passwordChangeSuccess = ref(false);
const passwordChangeError = ref(null);

// 在组件加载时调用 store 的 fetchUserInfo action
onMounted(() => {
  // 如果 store 中还没有用户数据，或者需要刷新数据，就调用 fetchUserInfo
  if (!authStore.user) {
      authStore.fetchUserInfo();
  } else {
      // 如果 store 中已经有用户数据，初始化 newNickname
      newNickname.value = authStore.user.nickname;
  }
});

// 监听 authStore.user 的变化，更新本地的 newNickname
watch(() => authStore.user, (newUser) => {
  if (newUser) {
    newNickname.value = newUser.nickname;
  }
});


// 切换昵称编辑状态
const toggleEditNickname = async () => {
  if (editingNickname.value) {
    // 保存昵称
    try {
      // 调用后端 PATCH /api/users/profile/ 接口更新昵称，使用 axios
      const response = await axios.patch('/users/profile/', { // 使用 axios.patch
        nickname: newNickname.value
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authStore.getAccessToken}` // 使用 getter 获取 token
        }
      });

      // axios 在非 2xx 状态码时会抛出错误，不需要手动检查 response.ok
      const result = response.data;

      // 如果更新成功，手动更新 store 中的 user 状态 (或者在 store 的 action 中完成)
      if (authStore.user) {
          authStore.user.nickname = newNickname.value;
      }
      editingNickname.value = false;
      alert('昵称更新成功！'); // 提示用户更新成功
    } catch (error) {
       // axios 的错误处理
       const errorMessage = error.response?.data?.detail || error.message || 'Failed to update nickname';
       alert('修改昵称失败：' + errorMessage);
       console.error('修改昵称失败:', error.response?.data || error.message);
    }
  } else {
    // 进入编辑状态
    editingNickname.value = true;
  }
};

// 取消修改昵称
const cancelEditNickname = () => {
  if (authStore.user) {
      newNickname.value = authStore.user.nickname; // 恢复原昵称
  }
  editingNickname.value = false;
};

// 修改密码
const changePassword = async () => {
  passwordChangeSuccess.value = false;
  passwordChangeError.value = null;

  if (newPassword.value !== confirmPassword.value) {
    passwordChangeError.value = '两次输入的密码不一致';
    return;
  }

  // TODO: 添加密码强度校验

  try {
     // 调用后端 POST /api/users/change-password/ 接口修改密码，使用 axios
     const response = await axios.put('/users/change-password/', { // 使用 axios.post
       old_password: oldPassword.value,
       new_password: newPassword.value,
       new_password2: confirmPassword.value // 注意这里是 new_password2
     }, {
       headers: {
         'Content-Type': 'application/json',
         'Authorization': `Bearer ${authStore.getAccessToken}` // 使用 getter 获取 token
       }
     });

     // axios 在非 2xx 状态码时会抛出错误，不需要手动检查 response.ok
     const result = response.data;


    passwordChangeSuccess.value = true;
    alert('密码修改成功，请重新登录！'); // 提示用户密码修改成功并需要重新登录

    // 清空密码输入框
    oldPassword.value = '';
    newPassword.value = '';
    confirmPassword.value = '';

    // 在成功修改密码后，执行登出操作，并导航到登录页面
    // 假设你的 authStore 有 logout action
     authStore.logout(); // 调用 store 的登出 action
     router.push('/login'); // 导航到登录页面

  } catch (error) {
    // axios 的错误处理
    console.error('修改密码时发生错误:', error.response?.data || error.message);
    const errorData = error.response?.data;
    // 根据后端返回的错误信息进行处理
    if (errorData?.old_password) {
        passwordChangeError.value = '旧密码不正确';
    } else if (errorData?.new_password) {
         passwordChangeError.value = '新密码不符合要求：' + errorData.new_password.join(' ');
    } else if (errorData?.non_field_errors) {
         passwordChangeError.value = '修改密码失败：' + errorData.non_field_errors.join(' ');
    }
    else {
        passwordChangeError.value = '修改密码失败：' + (error.message || JSON.stringify(errorData));
    }
  }
};


// 处理邮箱绑定/换绑
const handleEmailAction = async () => {
  const promptText = authStore.user?.email ? '请输入新的邮箱地址以进行换绑：' : '请输入要绑定的邮箱地址：';
  const newEmail = prompt(promptText);

  if (newEmail !== null) { // prompt 返回 null 表示用户取消
       // TODO: 添加邮箱格式校验

       try {
         // 调用后端 PATCH /api/users/profile/ 接口绑定/换绑邮箱
         const response = await axios.patch('/users/profile/', {
           email: newEmail // 发送新的邮箱地址
         }, {
           headers: {
             'Content-Type': 'application/json',
             'Authorization': `Bearer ${authStore.getAccessToken}`
           }
         });

         const result = response.data;

         // 更新 store 中的 user 状态
         if (authStore.user) {
           authStore.user.email = newEmail;
         }
         alert(authStore.user?.email ? '邮箱换绑成功！' : '邮箱绑定成功！'); // 根据当前状态提示不同的信息
       } catch (error) {
         const errorMessage = error.response?.data?.email?.[0] || error.response?.data?.detail || error.message || (authStore.user?.email ? 'Failed to change email' : 'Failed to bind email');
         alert((authStore.user?.email ? '邮箱换绑失败：' : '邮箱绑定失败：') + errorMessage);
         console.error((authStore.user?.email ? '邮箱换绑失败:' : '邮箱绑定失败:'), error.response?.data || error.message);
       }
  }
};

// 处理手机号绑定/换绑
const handlePhoneAction = async () => {
   const promptText = authStore.user?.phone_number ? '请输入新的手机号以进行换绑：' : '请输入要绑定的手机号：';
   const newPhoneNumber = prompt(promptText);

   if (newPhoneNumber !== null) { // prompt 返回 null 表示用户取消
       // TODO: 添加手机号格式校验

       try {
         // 调用后端 PATCH /api/users/profile/ 接口绑定/换绑手机号
         const response = await axios.patch('/users/profile/', {
           phone_number: newPhoneNumber // 发送新的手机号
         }, {
           headers: {
             'Content-Type': 'application/json',
             'Authorization': `Bearer ${authStore.getAccessToken}`
           }
         });

         const result = response.data;

         // 更新 store 中的 user 状态
         if (authStore.user) {
           authStore.user.phone_number = newPhoneNumber;
         }
         alert(authStore.user?.phone_number ? '手机号换绑成功！' : '手机号绑定成功！'); // 根据当前状态提示不同的信息
       } catch (error) {
          const errorMessage = error.response?.data?.phone_number?.[0] || error.response?.data?.detail || error.message || (authStore.user?.phone_number ? 'Failed to change phone number' : 'Failed to bind phone number');
          alert((authStore.user?.phone_number ? '手机号换绑失败：' : '手机号绑定失败：') + errorMessage);
          console.error((authStore.user?.phone_number ? '手机号换绑失败:' : '手机号绑定失败:'), error.response?.data || error.message);
       }
   }
};


</script>

<style scoped>
/* 在这里添加你的页面样式，确保与整体主题契合 */
/* 注意：这里的样式是针对 personal-info 页面内容区域的 */
/* 整个布局的样式在 user-center.vue 中 */
.personal-info-content {
    /* 你可以根据需要调整这里的内边距等 */
    padding: 0; /* 内容区域的 padding 由布局文件控制 */
}

h1 {
  color: var(--text-color); /* 假设你的主题定义了文本颜色 */
  margin-bottom: 20px;
  font-size: 1.8em; /* 根据你的设计调整标题大小 */
}

/* 移除 personal-info-card-content 的 flex 布局，改为 block 布局 */
/* 改为 personal-info-sections 来管理信息分组 */
.personal-info-sections {
    display: flex;
    flex-direction: column;
    gap: 20px; /* 各个信息卡片之间的间距 */
}

.info-section-card {
    background-color: var(--surface-color); /* 使用表面颜色作为背景 */
    border-radius: 8px; /* 圆角 */
    box-shadow: 0 2px 4px var(--shadow-color); /* 阴影 */
    padding: 20px;
}

.info-section-card h2 {
    color: var(--text-color);
    font-size: 1.4em;
    margin-top: 0;
    margin-bottom: 20px; /* 标题和信息项之间的间距 */
    border-bottom: 1px solid var(--border-color); /* 分隔线 */
    padding-bottom: 10px;
}

.info-item {
    display: flex; /* 使用 flex 布局使标签和值对齐 */
    align-items: center;
    margin-bottom: 15px; /* 信息项之间的垂直间距 */
    padding: 10px 0; /* 增加信息项的垂直内边距 */
    border-bottom: 1px solid var(--border-color-light); /* 信息项之间的分隔线 */
}

.info-item:last-child {
    border-bottom: none; /* 最后一个信息项没有分隔线 */
    margin-bottom: 0;
    padding-bottom: 0;
}


.item-label {
    font-weight: bold;
    color: var(--subtle-text-color); /* 标签使用中灰色 */
    flex-basis: 150px; /* 给标签一个固定宽度 */
    flex-shrink: 0; /* 标签不收缩 */
    margin-right: 20px; /* 标签和值之间的间距 */
}

.item-value {
    color: var(--text-color); /* 值使用主要文字颜色 */
    flex-grow: 1; /* 值可以填充剩余空间 */
}


/* 可编辑字段的样式 */
.editable-field-content {
    /* 这里保留 flex 布局，因为它包含输入框和按钮 */
    display: flex; /* 确保这个 class 使用 flex */
    align-items: center;
    flex-wrap: wrap; /* 允许换行 */
    flex-grow: 1; /* 确保可编辑字段填充剩余空间 */
}


.edit-input {
  flex-grow: 1;
  padding: 8px 12px; /* 增加内边距 */
  margin-right: 10px;
  border: 1px solid var(--border-color); /* 假设你的主题定义了边框颜色 */
  border-radius: 4px;
  background-color: var(--input-bg-color); /* 假设你的主题定义了输入框背景颜色 */
  color: var(--text-color);
  min-width: 150px; /* 确保输入框有最小宽度 */
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.edit-input:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(var(--primary-color-dark), 0.1);
}


/* 按钮样式 */
/* 将编辑、取消和绑定/解绑按钮的共同样式提取出来 */
.edit-button, .cancel-button, .action-button {
   padding: 8px 15px;
   color: white;
   border: none;
   border-radius: 4px; /* 按钮圆角 */
   cursor: pointer;
   transition: background-color 0.3s ease, opacity 0.3s ease;
   margin-left: 5px; /* 按钮之间的间距 */
    font-weight: bold;
    flex-shrink: 0; /* 按钮不收缩 */
}

/* 绑定按钮使用主色调 */
.action-button {
    background-color: var(--primary-color);
}

/* 解绑按钮使用不同的颜色 */
.unbind-button {
    background-color: var(--subtle-text-color); /* 例如使用中灰色 */
}


.edit-button {
    background-color: var(--primary-color); /* 编辑按钮使用主色调 */
}

.cancel-button {
    background-color: var(--secondary-color); /* 取消按钮使用辅助色 */
    color: var(--text-color); /* 取消按钮文字颜色 */
}


.edit-button:hover, .action-button:hover {
    background-color: var(--primary-color-dark); /* 默认悬停效果 */
}

/* 为解绑按钮定义特定的悬停颜色 */
.unbind-button:hover {
     background-color: #555; /* 解绑按钮悬停颜色 */
}

.cancel-button:hover {
     background-color: var(--secondary-color-dark); /* 取消按钮悬停颜色 */
}


.edit-button:disabled, .cancel-button:disabled, .action-button:disabled, .change-password-button:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
    opacity: 0.7;
}


/* 修改密码按钮样式 */
.change-password-button{
  padding: 8px 15px;
   background-color: var(--primary-color); /* 使用主色调 */
   color: white;
   border: none;
   border-radius: 4px; /* 按钮圆角 */
   cursor: pointer;
   transition: background-color 0.3s ease, opacity 0.3s ease;
    font-weight: bold;
    /* 调整宽度以匹配输入框 */
    width: calc(100% - 24px); /* Adjust for padding and border */
    margin-top: 15px; /* 与输入框的间距 */
}

.change-password-button:hover {
     background-color: var(--primary-color-dark); /* 悬停颜色变深 */
}


.password-change-fields {
    margin-bottom: 15px; /* 输入框组的底部间距 */
}

.password-change-fields input {
    display: block;
    width: calc(100% - 24px); /* Adjust for padding and border */
    padding: 10px 12px;
    margin-bottom: 10px;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    background-color: var(--input-bg-color);
    color: var(--text-color);
     transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.password-change-fields input:focus {
     outline: none;
     border-color: var(--primary-color);
     box-shadow: 0 0 0 3px rgba(var(--primary-color-dark), 0.1);
}


.success-message {
    color: green;
    margin-bottom: 15px;
}

.error-message {
    color: red;
    margin-bottom: 15px;
}

/* 响应式设计考虑 */
@media (max-width: 768px) {
  .info-item {
      flex-direction: column; /* 在小屏幕上垂直布局 */
      align-items: flex-start;
  }

  .item-label {
      flex-basis: auto; /* 取消固定宽度 */
      margin-right: 0;
      margin-bottom: 5px; /* 标签和值之间的垂直间距 */
  }

  .item-value {
      width: 100%; /* 值填充整个宽度 */
  }

  .editable-field-content {
       flex-direction: column; /* 可编辑字段在小屏幕上垂直布局 */
       align-items: flex-start;
       width: 100%; /* 可编辑字段在小屏幕上填充宽度 */
  }


  .edit-input {
      width: 100%;
      margin-right: 0;
      margin-bottom: 10px; /* 输入框下的间距 */
  }

  .edit-button, .cancel-button, .action-button {
       width: 100%; /* 按钮宽度自适应内容 */
       margin-left: 0;
       margin-bottom: 10px; /* 按钮之间的水平间距 */
  }

   /* 移除最后一个按钮的底部间距 */
   .editable-field-content button:last-child {
       margin-bottom: 0;
   }


    .password-change-fields input {
        width: 100%; /* 继续调整宽度 */
    }

    .change-password-button {
         width: 100%; /* 按钮宽度自适应内容 */
    }

}

/* TODO: 根据你的具体项目调整样式变量和类名 */
</style>
