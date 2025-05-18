<template>
  <div>
    <main class="user-center-layout">
      <aside class="sidebar">
        <!-- 左侧导航菜单 -->
        <div class="user-info">
          <!-- 侧边栏头像区域，添加 hover 提示和 click 事件 -->
          <div class="avatar-container" @mouseover="showAvatarTooltip = true" @mouseleave="showAvatarTooltip = false" @click="triggerAvatarUpload">
              <img :src="authStore.user?.avatar || '/default-avatar.png'" alt="用户头像" class="sidebar-avatar">
              <!-- 头像修改提示 -->
              <transition name="fade">
                  <div v-if="showAvatarTooltip" class="avatar-tooltip">点击修改头像</div>
              </transition>
          </div>
          <p class="sidebar-username">{{ authStore.user?.nickname || '加载中...' }}</p>
        </div>
        <nav class="sidebar-nav">
          <ul>
            <li>
              <NuxtLink to="/personal-info" active-class="active-link">个人信息</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/achievements" active-class="active-link">成就</NuxtLink>
            </li>
            <!-- TODO: 添加设置等其他导航项 -->
          </ul>
        </nav>
      </aside>
      <section class="content">
        <!-- 右侧内容区域，显示当前页面的内容 -->
        <slot />
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '~/stores/auth';

const authStore = useAuthStore();
const showAvatarTooltip = ref(false);

// 获取用户信息以显示在侧边栏 (已通过 store 处理)
onMounted(() => {
  // 如果 store 中还没有用户数据，就调用 fetchUserInfo
  if (!authStore.user) {
      authStore.fetchUserInfo();
  }
});

// 触发头像上传的逻辑
const triggerAvatarUpload = () => {
    // TODO: 实现触发文件选择或模态框的逻辑
    alert('触发头像上传功能待实现！');
    // 例如：你可以使用一个隐藏的文件输入框并programmatically点击它
    // 或者显示一个上传头像的模态框
};

</script>

<style scoped>
.user-center-layout {
  display: flex;
  max-width: 1200px; /* 根据你的设计调整最大宽度 */
  margin: 20px auto;
  padding: 0 20px; /* 添加水平内边距 */
  gap: 40px; /* 左侧和右侧内容的间隔 */
}

.sidebar {
  flex-shrink: 0;
  width: 250px; /* 调整侧边栏宽度，增加一些空间 */
  background-color: var(--surface-color); /* 使用表面色作为背景 */
  border-radius: 15px; /* 增加圆角，与卡片样式一致 */
  box-shadow: 0 8px 24px var(--shadow-color); /* 添加柔和的阴影 */
  padding: 30px; /* 增加内边距 */
  display: flex;
  flex-direction: column; /* 垂直布局 */
  align-items: center; /* 侧边栏内容居中 */
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30px; /* 增加用户信息和导航的间距 */
}

.avatar-container {
    position: relative; /* 方便定位 tooltip */
    cursor: pointer;
    margin-bottom: 15px; /* 头像和用户名的间距 */
}


.sidebar-avatar {
  width: 100px; /* 调整头像大小 */
  height: 100px; /* 调整头像大小 */
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--primary-color); /* 增加边框宽度 */
  transition: border-color 0.3s ease; /* 添加过渡效果 */
}

.avatar-container:hover .sidebar-avatar {
    border-color: var(--primary-color-dark); /* 悬停时边框颜色变深 */
}

.avatar-tooltip {
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translate(-50%, 100%); /* 定位在头像下方 */
    background-color: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 5px 10px;
    border-radius: 4px;
    font-size: 0.9em;
    white-space: nowrap; /* 防止文字换行 */
    z-index: 1; /* 确保在头像之上 */
    pointer-events: none; /* 提示框不阻碍鼠标事件 */
}

/* Tooltip 淡入淡出过渡 */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}


.sidebar-username {
  color: var(--text-color);
  font-size: 1.2em; /* 调整用户名文字大小 */
  font-weight: bold;
}

.sidebar-nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
  width: 100%; /* 导航列表填充侧边栏宽度 */
}

.sidebar-nav li {
  margin-bottom: 10px;
}

.sidebar-nav a {
  display: block;
  padding: 12px 15px; /* 增加内边距 */
  color: var(--subtle-text-color); /* 使用中灰色文字 */
  text-decoration: none;
  border-radius: 8px; /* 增加圆角 */
  transition: background-color 0.3s ease, color 0.3s ease;
    font-weight: 600; /* 加粗导航文字 */
}

.sidebar-nav a:hover {
  background-color: var(--surface-color-hover); /* 添加一个悬停颜色变量 */
  color: var(--primary-color); /* 悬停时文字变主题色 */
}

.sidebar-nav .active-link {
  background-color: var(--primary-color);
  color: white;
  font-weight: bold; /* 选中状态文字加粗 */
}

.content {
  flex-grow: 1;
  background-color: var(--surface-color); /* 使用主题颜色 */
  border-radius: 15px; /* 增加圆角 */
  box-shadow: 0 8px 24px var(--shadow-color); /* 添加柔和的阴影 */
  padding: 30px; /* 增加内边距 */
}

/* 响应式设计考虑 */
@media (max-width: 768px) {
  .user-center-layout {
    flex-direction: column;
    padding: 0 15px; /* 调整水平内边距 */
    gap: 20px; /* 调整垂直间距 */
  }

  .sidebar {
    width: 100%; /* 侧边栏全宽 */
    flex-direction: row; /* 侧边栏内容水平布局 */
    justify-content: center; /* 内容居中 */
    padding: 20px;
  }

  .user-info {
      flex-direction: row; /* 用户信息水平布局 */
      margin-bottom: 0;
      margin-right: 20px; /* 头像和导航的间距 */
  }

    .sidebar-avatar {
        width: 80px;
        height: 80px;
        margin-bottom: 0;
    }

    .avatar-container {
        margin-bottom: 0;
    }


  .sidebar-nav ul {
    display: flex; /* 导航列表水平布局 */
    justify-content: center; /* 导航项居中 */
    gap: 15px; /* 导航项之间的水平间距 */
  }

  .sidebar-nav li {
      margin-bottom: 0;
  }

  .content {
      padding: 20px; /* 调整内容区域内边距 */
  }
}

</style>
