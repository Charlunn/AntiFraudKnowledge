<template>
  <div class="third-party-login">
    <div class="divider">
      <span>或使用第三方登录</span>
    </div>
    
    <div class="third-party-buttons">
      <button 
        class="qq-login-btn" 
        @click="loginWithQQ"
        :disabled="loading"
      >
        <svg class="icon" viewBox="0 0 1024 1024">
          <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64z" fill="#12B7F5"/>
          <path d="M512 128c212.1 0 384 171.9 384 384s-171.9 384-384 384-384-171.9-384-384 171.9-384 384-384z" fill="#FFFFFF"/>
          <path d="M464 320h96v64h-96z" fill="#12B7F5"/>
          <path d="M400 448h224v32H400z" fill="#12B7F5"/>
          <path d="M432 512h160v32H432z" fill="#12B7F5"/>
        </svg>
        QQ登录
      </button>
      
      <button 
        class="wechat-login-btn" 
        @click="loginWithWeChat"
        :disabled="loading"
      >
        <svg class="icon" viewBox="0 0 1024 1024">
          <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64z" fill="#07C160"/>
          <path d="M512 128c212.1 0 384 171.9 384 384s-171.9 384-384 384-384-171.9-384-384 171.9-384 384-384z" fill="#FFFFFF"/>
          <path d="M400 320c-53 0-96 43-96 96s43 96 96 96c53 0 96-43 96-96s-43-96-96-96z" fill="#07C160"/>
          <path d="M624 320c-53 0-96 43-96 96s43 96 96 96c53 0 96-43 96-96s-43-96-96-96z" fill="#07C160"/>
        </svg>
        微信登录
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { ElMessage } from 'element-plus'

const router = useRouter()
const { login } = useAuth()
const loading = ref(false)

// QQ登录配置
const QQ_APP_ID = '你的QQ应用ID' // 需要在QQ开放平台申请
const QQ_REDIRECT_URI = encodeURIComponent('http://localhost:3001/auth/qq/callback')

// 微信登录配置
const WECHAT_APP_ID = '你的微信应用ID' // 需要在微信开放平台申请
const WECHAT_REDIRECT_URI = encodeURIComponent('http://localhost:3001/auth/wechat/callback')

const loginWithQQ = () => {
  if (loading.value) return
  
  // 构建QQ授权URL
  const qqAuthUrl = `https://graph.qq.com/oauth2.0/authorize?response_type=code&client_id=${QQ_APP_ID}&redirect_uri=${QQ_REDIRECT_URI}&scope=get_user_info&state=qq_login`
  
  // 打开QQ授权页面
  window.location.href = qqAuthUrl
}

const loginWithWeChat = () => {
  if (loading.value) return
  
  // 构建微信授权URL
  const wechatAuthUrl = `https://open.weixin.qq.com/connect/qrconnect?appid=${WECHAT_APP_ID}&redirect_uri=${WECHAT_REDIRECT_URI}&response_type=code&scope=snsapi_login&state=wechat_login`
  
  // 打开微信授权页面
  window.location.href = wechatAuthUrl
}
</script>

<style scoped>
.third-party-login {
  margin-top: 24px;
}

.divider {
  position: relative;
  text-align: center;
  margin: 24px 0;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: #e4e7ed;
}

.divider span {
  background: white;
  padding: 0 16px;
  color: #909399;
  font-size: 14px;
}

.third-party-buttons {
  display: flex;
  gap: 12px;
}

.qq-login-btn,
.wechat-login-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  background: white;
  color: #606266;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.qq-login-btn:hover {
  border-color: #12B7F5;
  color: #12B7F5;
}

.wechat-login-btn:hover {
  border-color: #07C160;
  color: #07C160;
}

.qq-login-btn:disabled,
.wechat-login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.icon {
  width: 20px;
  height: 20px;
}
</style>