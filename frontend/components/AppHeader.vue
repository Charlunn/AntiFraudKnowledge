<template>
  <header class="app-header">
    <div class="container">
      <!-- 使用 NuxtLink 包裹 Logo -->
      <NuxtLink to="/" class="logo">
        <img src="../public/LOGO.png" style="width:4rem"/>
      </NuxtLink>
      <nav class="main-nav">
        <ul>
          <li><NuxtLink to="/">首页</NuxtLink></li>
          <!-- 添加诈骗模拟聊天页面链接，仅登录后显示 -->
          <li><NuxtLink to="/chat">诈骗模拟</NuxtLink></li>
          <li><NuxtLink to="/dashboard">数据总览</NuxtLink></li>
          <!-- 移除或其他导航链接 -->
          <!-- <li><NuxtLink to="/some-other-page">其他页面</NuxtLink></li> -->
        </ul>
      </nav>
      <div class="user-area">
        <!-- 显示用户信息或登录/注册链接 -->
        <div v-if="authStore.isAuthenticated" class="logged-in-user" @mouseover="showDropdown = true" @mouseleave="showDropdown = false">
          <div class="user-display">
            <!-- 用户头像，如果 avatar 为 null 则显示默认头像 -->
            <img :src="authStore.user?.avatar || '/default-avatar.png'" alt="User Avatar" class="user-avatar">
            <!-- 用户昵称 -->
            <span>{{ authStore.user?.nickname || authStore.user?.username || '用户' }}</span>
          </div>
          <!-- 下拉菜单 -->
          <transition name="dropdown">
            <div v-if="showDropdown" class="dropdown-menu">
              <!-- 将 Button 替换为 Div -->
              <div class="dropdown-item" data-path="/personal-info" @click="handleMenuItemClick">个人信息</div>
              <div class="dropdown-item" data-path="/achievements" @click="handleMenuItemClick">成就</div>
              <!-- 移除诈骗模拟链接 -->
              <div class="dropdown-item" data-path="/settings" @click="handleMenuItemClick">设置</div>
              <!-- 退出登录使用 Div -->
              <div class="dropdown-item" @click="handleLogout">退出登录</div>
            </div>
          </transition>
        </div>
        <div v-else class="logged-out-links">
          <!-- 登录/注册链接保持 NuxtLink，但调整样式使其像按钮 -->
          <div class="dropdown-item" data-path="/login" @click="handleMenuItemClick">登录</div>
          <div class="dropdown-item" data-path="/register" @click="handleMenuItemClick">注册</div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { ref } from 'vue';
import { useAuthStore } from '~/stores/auth'; // Import the auth store

const router = useRouter();
const authStore = useAuthStore(); // Initialize the auth store

const showDropdown = ref(false);

// 处理退出登录
const handleLogout = () => {
  authStore.logout();
  router.push('/login'); // Redirect to login page after logout
  showDropdown.value = false; // Hide dropdown after logout
};

// 处理下拉菜单项点击事件（除了退出登录）
const handleMenuItemClick = (event) => {
  const path = event.target.dataset.path;
  if (path) {
    router.push(path);
    showDropdown.value = false; // Hide dropdown after navigation
  }
};
</script>

<style scoped>
/* frontend/components/AppHeader.vue */

.app-header {
  background-color: var(--surface-color-dark); /* 头部背景色 */
  color: var(--text-color-inverted); /* 头部文字颜色 */
  padding: 15px 0; /* 上下内边距 */
  /* 移除 position: sticky; 和 top: 0; */
  /* position: sticky; */
  /* top: 0; */
  /* z-index: 100; */ /* 如果头部不固定，z-index 可能不是那么重要，但可以保留 */
  box-shadow: 0 2px 8px var(--shadow-color); /* 调整阴影，使其更柔和 */
  /* Removed border-radius here as it's a header, typically full width */
}
.logo{
  display:flex;
  align-content:center;
  justify-content:center;
}
.app-header .container {
  display: flex;
  justify-content: space-between; /* Logo 和导航左右对齐 */
  max-width: 1200px; /* Maximum width */
  margin: 0 auto; /* Center the container */
  align-items: center; /* 垂直居中对齐 */
  padding: 0 20px; /* Add horizontal padding to container */
}

.logo a {
  color: var(--primary-color); /* Logo 颜色 */
  font-size: 1.8rem; /* Increase logo size */
  font-weight: bold;
  text-decoration: none;
}

.main-nav ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
}

.main-nav li {
  font-size:1.5rem;
  margin-left: 25px; /* Increase navigation item spacing */
}

.main-nav a {
  text-decoration: none;
  color: var(--subtle-text-color); /* 使用中灰色文字，借鉴侧边栏 */
  font-weight: 500; /* 中等字重 */
  transition: color 0.3s ease;
}

.main-nav a:hover {
  color: var(--primary-color-light); /* 导航链接 hover 颜色 */
}

/* User Area with Dropdown */
.user-area {
    position: relative; /* Enable absolute positioning for dropdown */
    display: flex;
    align-items: center;
}

.logged-in-user {
    display: flex;
    align-items: center;
    cursor: pointer; /* Indicate clickable/hoverable area */
    position: relative; /* For dropdown positioning */
    padding: 5px 10px; /* Add padding to user display area */
    border-radius: 8px; /* Add rounded corners */
    transition: background-color 0.2s ease;
}

.logged-in-user:hover {
    background-color: var(--surface-color-light); /* Add subtle hover effect */
}

.user-display {
    display: flex;
    align-items: center;
}

.user-avatar {
    width: 35px; /* Increase avatar size */
    height: 35px; /* Increase avatar size */
    border-radius: 50%; /* Make avatar round */
    margin-right: 10px;
    object-fit: cover; /* Ensure avatar fills the circle */
    border: 2px solid var(--primary-color); /* Add a border to the avatar */
}

.logged-in-user span {
    font-weight: bold;
    color: var(--text-color-inverted);
    font-size: 1.05em; /* Slightly increase font size */
}

.dropdown-menu {
    position: absolute;
    top: calc(100% + 10px); /* Position below the user info with some gap */
    right: 0; /* Align to the right */
    background-color: var(--surface-color); /* Dropdown background */
    box-shadow: 0 8px 24px var(--shadow-color); /* Use similar shadow as sidebar */
    border-radius: 8px; /* Use similar rounded corners as sidebar */
    overflow: hidden; /* Clip rounded corners */
    z-index: 10; /* Ensure dropdown is above other content */
    min-width: 180px; /* Increase minimum width for the dropdown */
    padding: 10px; /* Add padding to the dropdown */
    display: flex; /* Use flexbox for dropdown items */
    flex-direction: column;
    gap: 8px; /* Add space between dropdown items */
}

/* Style for all dropdown items (now divs) */
.dropdown-item {
    display: block;
    padding: 8px 15px; /* Adjust padding for a softer look */
    /* border-radius: 0; */ /* Remove border-radius */
    color: var(--text-color); /* Default text color */
    background-color: transparent; /* Transparent background */
    border: 1px solid transparent; /* Transparent border */
    width: 100%; /* Full width of dropdown item */
    text-align: left; /* Align text to the left */
    cursor: pointer;
    transition: color 0.2s ease, background-color 0.2s ease, border-color 0.2s ease; /* Add transitions */
    font-size: 1em;
}

.dropdown-item:hover {
    background-color: var(--surface-color-light); /* Subtle background change on hover */
    color: var(--primary-color); /* Change text color to theme color on hover */
    border-color: transparent; /* Keep border transparent on hover */
}

/* Optional: Specific style for the logout item if needed, e.g., red text */
/* .dropdown-menu .dropdown-item:last-child {
    color: var(--error-color);
}
.dropdown-menu .dropdown-item:last-child:hover {
     background-color: var(--error-color-light);
     color: white;
} */
.logged-out-links {
    display: flex; /* Use flexbox for mobile layout */
    justify-content: center; /* Center login/register links */
    gap: 10px; /* Add gap between login/register links */
}

.logged-out-links a {
    color: var(--primary-color); /* 登录/注册链接颜色 */
    text-decoration: none;
    margin-left: 15px; /* Add margin between links */
    padding: 8px 15px; /* Add padding to make them look like buttons */
    border: 1px solid var(--primary-color);
    border-radius: 8px; /* Add rounded corners */
    transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
    font-weight: bold;
}

.logged-out-links a:hover {
    background-color: var(--primary-color); /* Fill background on hover */
    color: var(--text-color-inverted); /* Change text color to white on hover */
    border-color: var(--primary-color); /* Keep border color same on hover */
}


/* Dropdown Transition Styles (keep existing) */
.dropdown-enter-active, .dropdown-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.dropdown-enter-from, .dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px); /* Optional: slight upward movement effect */
}


/* Responsive adjustments */
@media (max-width: 768px) {
  .app-header .container {
    flex-direction: column;
    text-align: center;
    padding: 10px 20px; /* Adjust padding for smaller screens */
  }

  .main-nav ul {
    margin-top: 15px; /* Add space above nav */
    justify-content: center;
  }

  .main-nav li {
    margin: 0 10px; /* Adjust spacing between nav items */
  }

  .user-area {
    margin-top: 15px; /* Add space above user area */
    width: 100%; /* Full width for better centering on mobile */
    justify-content: center; /* Center content on mobile */
}

.logged-in-user {
    justify-content: center; /* Center user info on mobile */
}

.dropdown-menu {
    left: 50%; /* Center dropdown horizontally on mobile */
    transform: translateX(-50%);
    right: auto; /* Override right: 0 */
    min-width: 200px; /* Increase minimum width for mobile */
}

.dropdown-enter-from, .dropdown-leave-to {
    transform: translate(-50%, -10px); /* Adjust transform for centered positioning */
}

.logged-out-links {
    display: flex; /* Use flexbox for mobile layout */
    justify-content: center; /* Center login/register links */
    gap: 10px; /* Add gap between login/register links */
}

.logged-out-links a {
    margin-left: 0; /* Remove left margin */
}

}

</style>
