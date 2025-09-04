<template>
  <div class="settings-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-info">
          <h1 class="page-title">账户设置</h1>
          <p class="page-description">管理你的账户信息、隐私设置和通知偏好</p>
        </div>
        
        <div class="header-actions">
          <NuxtLink to="/profile" class="btn btn-secondary">
            <Icon name="heroicons:arrow-left" class="w-4 h-4" />
            返回资料
          </NuxtLink>
        </div>
      </div>
    </div>
    
    <!-- 设置内容 -->
    <div class="settings-content">
      <!-- 侧边导航 -->
      <div class="settings-sidebar">
        <nav class="settings-nav">
          <button 
            v-for="section in settingSections" 
            :key="section.key"
            @click="activeSection = section.key"
            class="nav-item"
            :class="{ 'active': activeSection === section.key }"
          >
            <Icon :name="section.icon" class="w-5 h-5" />
            <span>{{ section.label }}</span>
          </button>
        </nav>
      </div>
      
      <!-- 设置面板 -->
      <div class="settings-panel">
        <!-- 个人信息 -->
        <div v-if="activeSection === 'profile'" class="setting-section">
          <div class="section-header">
            <h2 class="section-title">个人信息</h2>
            <p class="section-description">更新你的个人资料信息</p>
          </div>
          
          <form @submit.prevent="handleUpdateProfile" class="setting-form">
            <!-- 头像设置 -->
            <div class="form-group">
              <label class="form-label">头像</label>
              <div class="avatar-setting">
                <img :src="profileForm.avatar" alt="用户头像" class="current-avatar" />
                <div class="avatar-actions">
                  <button type="button" @click="triggerAvatarUpload" class="btn btn-secondary">
                    <Icon name="heroicons:camera" class="w-4 h-4" />
                    更换头像
                  </button>
                  <input 
                    ref="avatarInput" 
                    type="file" 
                    accept="image/*" 
                    @change="handleAvatarUpload" 
                    class="hidden"
                  >
                </div>
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">用户名 *</label>
                <input 
                  v-model="profileForm.name" 
                  type="text" 
                  class="form-input"
                  required
                  placeholder="请输入用户名"
                >
              </div>
              
              <div class="form-group">
                <label class="form-label">邮箱地址 *</label>
                <input 
                  v-model="profileForm.email" 
                  type="email" 
                  class="form-input"
                  required
                  placeholder="请输入邮箱地址"
                >
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">职位/头衔</label>
                <input 
                  v-model="profileForm.title" 
                  type="text" 
                  class="form-input"
                  placeholder="请输入职位或头衔"
                >
              </div>
              
              <div class="form-group">
                <label class="form-label">所在地</label>
                <input 
                  v-model="profileForm.location" 
                  type="text" 
                  class="form-input"
                  placeholder="请输入所在地"
                >
              </div>
            </div>
            
            <div class="form-group">
              <label class="form-label">个人简介</label>
              <textarea 
                v-model="profileForm.bio" 
                class="form-textarea"
                rows="4"
                placeholder="介绍一下你自己..."
              ></textarea>
              <div class="form-hint">
                {{ profileForm.bio?.length || 0 }}/500 字符
              </div>
            </div>
            
            <div class="form-actions">
              <button type="submit" class="btn btn-primary" :disabled="profileUpdating">
                <Icon v-if="profileUpdating" name="heroicons:arrow-path" class="w-4 h-4 animate-spin" />
                {{ profileUpdating ? '保存中...' : '保存更改' }}
              </button>
            </div>
          </form>
        </div>
        
        <!-- 账户安全 -->
        <div v-if="activeSection === 'security'" class="setting-section">
          <div class="section-header">
            <h2 class="section-title">账户安全</h2>
            <p class="section-description">管理你的密码和安全设置</p>
          </div>
          
          <!-- 密码修改 -->
          <div class="security-group">
            <h3 class="group-title">修改密码</h3>
            <form @submit.prevent="handleChangePassword" class="setting-form">
              <div class="form-group">
                <label class="form-label">当前密码 *</label>
                <input 
                  v-model="passwordForm.currentPassword" 
                  type="password" 
                  class="form-input"
                  required
                  placeholder="请输入当前密码"
                >
              </div>
              
              <div class="form-group">
                <label class="form-label">新密码 *</label>
                <input 
                  v-model="passwordForm.newPassword" 
                  type="password" 
                  class="form-input"
                  required
                  placeholder="请输入新密码"
                >
                <div class="password-strength">
                  <div class="strength-bar">
                    <div 
                      class="strength-fill" 
                      :class="passwordStrengthClass"
                      :style="{ width: `${passwordStrength}%` }"
                    ></div>
                  </div>
                  <span class="strength-text" :class="passwordStrengthClass">
                    {{ passwordStrengthText }}
                  </span>
                </div>
              </div>
              
              <div class="form-group">
                <label class="form-label">确认新密码 *</label>
                <input 
                  v-model="passwordForm.confirmPassword" 
                  type="password" 
                  class="form-input"
                  required
                  placeholder="请再次输入新密码"
                >
                <div v-if="passwordForm.confirmPassword && !passwordsMatch" class="form-error">
                  两次输入的密码不一致
                </div>
              </div>
              
              <div class="form-actions">
                <button 
                  type="submit" 
                  class="btn btn-primary" 
                  :disabled="passwordUpdating || !passwordsMatch"
                >
                  <Icon v-if="passwordUpdating" name="heroicons:arrow-path" class="w-4 h-4 animate-spin" />
                  {{ passwordUpdating ? '修改中...' : '修改密码' }}
                </button>
              </div>
            </form>
          </div>
          
          <!-- 两步验证 -->
          <div class="security-group">
            <h3 class="group-title">两步验证</h3>
            <div class="security-item">
              <div class="item-info">
                <div class="item-name">短信验证</div>
                <div class="item-description">通过短信接收验证码</div>
              </div>
              <div class="item-status">
                <span v-if="securitySettings.sms_2fa" class="status-badge enabled">已启用</span>
                <span v-else class="status-badge disabled">未启用</span>
                <button 
                  @click="toggleSMS2FA" 
                  class="btn btn-sm"
                  :class="securitySettings.sms_2fa ? 'btn-secondary' : 'btn-primary'"
                >
                  {{ securitySettings.sms_2fa ? '禁用' : '启用' }}
                </button>
              </div>
            </div>
            
            <div class="security-item">
              <div class="item-info">
                <div class="item-name">邮箱验证</div>
                <div class="item-description">通过邮箱接收验证码</div>
              </div>
              <div class="item-status">
                <span v-if="securitySettings.email_2fa" class="status-badge enabled">已启用</span>
                <span v-else class="status-badge disabled">未启用</span>
                <button 
                  @click="toggleEmail2FA" 
                  class="btn btn-sm"
                  :class="securitySettings.email_2fa ? 'btn-secondary' : 'btn-primary'"
                >
                  {{ securitySettings.email_2fa ? '禁用' : '启用' }}
                </button>
              </div>
            </div>
          </div>
          
          <!-- 登录记录 -->
          <div class="security-group">
            <h3 class="group-title">最近登录记录</h3>
            <div class="login-history">
              <div 
                v-for="login in loginHistory" 
                :key="login.id"
                class="login-item"
              >
                <div class="login-info">
                  <div class="login-device">
                    <Icon :name="getDeviceIcon(login.device_type)" class="w-5 h-5" />
                    <span>{{ login.device_name }}</span>
                  </div>
                  <div class="login-details">
                    <span class="login-location">{{ login.location }}</span>
                    <span class="login-time">{{ formatDateTime(login.timestamp) }}</span>
                  </div>
                </div>
                <div class="login-status">
                  <span v-if="login.is_current" class="status-badge current">当前会话</span>
                  <span v-else-if="login.is_suspicious" class="status-badge suspicious">可疑登录</span>
                  <span v-else class="status-badge normal">正常</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 隐私设置 -->
        <div v-if="activeSection === 'privacy'" class="setting-section">
          <div class="section-header">
            <h2 class="section-title">隐私设置</h2>
            <p class="section-description">控制你的信息可见性和数据使用</p>
          </div>
          
          <div class="privacy-groups">
            <div class="privacy-group">
              <h3 class="group-title">个人资料可见性</h3>
              <div class="privacy-items">
                <div class="privacy-item">
                  <div class="item-info">
                    <div class="item-name">公开个人资料</div>
                    <div class="item-description">允许其他用户查看你的个人资料</div>
                  </div>
                  <div class="item-toggle">
                    <input 
                      v-model="privacySettings.profile_public" 
                      type="checkbox" 
                      class="toggle-input"
                      id="profile-public"
                    >
                    <label for="profile-public" class="toggle-label"></label>
                  </div>
                </div>
                
                <div class="privacy-item">
                  <div class="item-info">
                    <div class="item-name">显示学习记录</div>
                    <div class="item-description">在个人资料中显示学习活动和成就</div>
                  </div>
                  <div class="item-toggle">
                    <input 
                      v-model="privacySettings.learning_public" 
                      type="checkbox" 
                      class="toggle-input"
                      id="learning-public"
                    >
                    <label for="learning-public" class="toggle-label"></label>
                  </div>
                </div>
                
                <div class="privacy-item">
                  <div class="item-info">
                    <div class="item-name">显示在线状态</div>
                    <div class="item-description">让其他用户看到你是否在线</div>
                  </div>
                  <div class="item-toggle">
                    <input 
                      v-model="privacySettings.online_status" 
                      type="checkbox" 
                      class="toggle-input"
                      id="online-status"
                    >
                    <label for="online-status" class="toggle-label"></label>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="privacy-group">
              <h3 class="group-title">数据使用</h3>
              <div class="privacy-items">
                <div class="privacy-item">
                  <div class="item-info">
                    <div class="item-name">学习数据分析</div>
                    <div class="item-description">允许系统分析你的学习数据以提供个性化建议</div>
                  </div>
                  <div class="item-toggle">
                    <input 
                      v-model="privacySettings.data_analytics" 
                      type="checkbox" 
                      class="toggle-input"
                      id="data-analytics"
                    >
                    <label for="data-analytics" class="toggle-label"></label>
                  </div>
                </div>
                
                <div class="privacy-item">
                  <div class="item-info">
                    <div class="item-name">使用统计</div>
                    <div class="item-description">帮助我们改进产品功能和用户体验</div>
                  </div>
                  <div class="item-toggle">
                    <input 
                      v-model="privacySettings.usage_stats" 
                      type="checkbox" 
                      class="toggle-input"
                      id="usage-stats"
                    >
                    <label for="usage-stats" class="toggle-label"></label>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="form-actions">
            <button @click="updatePrivacySettings" class="btn btn-primary" :disabled="privacyUpdating">
              <Icon v-if="privacyUpdating" name="heroicons:arrow-path" class="w-4 h-4 animate-spin" />
              {{ privacyUpdating ? '保存中...' : '保存设置' }}
            </button>
          </div>
        </div>
        
        <!-- 通知设置 -->
        <div v-if="activeSection === 'notifications'" class="setting-section">
          <div class="section-header">
            <h2 class="section-title">通知设置</h2>
            <p class="section-description">管理你希望接收的通知类型</p>
          </div>
          
          <div class="notification-groups">
            <div class="notification-group">
              <h3 class="group-title">邮件通知</h3>
              <div class="notification-items">
                <div class="notification-item">
                  <div class="item-info">
                    <div class="item-name">系统更新</div>
                    <div class="item-description">重要的系统更新和维护通知</div>
                  </div>
                  <div class="item-toggle">
                    <input 
                      v-model="notificationSettings.email.system_updates" 
                      type="checkbox" 
                      class="toggle-input"
                      id="email-system"
                    >
                    <label for="email-system" class="toggle-label"></label>
                  </div>
                </div>
                
                <div class="notification-item">
                  <div class="item-info">
                    <div class="item-name">学习提醒</div>
                    <div class="item-description">学习计划提醒和进度更新</div>
                  </div>
                  <div class="item-toggle">
                    <input 
                      v-model="notificationSettings.email.learning_reminders" 
                      type="checkbox" 
                      class="toggle-input"
                      id="email-learning"
                    >
                    <label for="email-learning" class="toggle-label"></label>
                  </div>
                </div>
                
                <div class="notification-item">
                  <div class="item-info">
                    <div class="item-name">社区活动</div>
                    <div class="item-description">新帖子回复、点赞和关注通知</div>
                  </div>
                  <div class="item-toggle">
                    <input 
                      v-model="notificationSettings.email.community_activity" 
                      type="checkbox" 
                      class="toggle-input"
                      id="email-community"
                    >
                    <label for="email-community" class="toggle-label"></label>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="notification-group">
              <h3 class="group-title">推送通知</h3>
              <div class="notification-items">
                <div class="notification-item">
                  <div class="item-info">
                    <div class="item-name">即时消息</div>
                    <div class="item-description">私信和重要通知的即时推送</div>
                  </div>
                  <div class="item-toggle">
                    <input 
                      v-model="notificationSettings.push.instant_messages" 
                      type="checkbox" 
                      class="toggle-input"
                      id="push-messages"
                    >
                    <label for="push-messages" class="toggle-label"></label>
                  </div>
                </div>
                
                <div class="notification-item">
                  <div class="item-info">
                    <div class="item-name">学习提醒</div>
                    <div class="item-description">学习计划和测验提醒</div>
                  </div>
                  <div class="item-toggle">
                    <input 
                      v-model="notificationSettings.push.learning_reminders" 
                      type="checkbox" 
                      class="toggle-input"
                      id="push-learning"
                    >
                    <label for="push-learning" class="toggle-label"></label>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="notification-group">
              <h3 class="group-title">通知频率</h3>
              <div class="frequency-setting">
                <label class="form-label">邮件通知频率</label>
                <select v-model="notificationSettings.email_frequency" class="form-select">
                  <option value="immediate">立即发送</option>
                  <option value="daily">每日汇总</option>
                  <option value="weekly">每周汇总</option>
                  <option value="never">从不发送</option>
                </select>
              </div>
            </div>
          </div>
          
          <div class="form-actions">
            <button @click="updateNotificationSettings" class="btn btn-primary" :disabled="notificationUpdating">
              <Icon v-if="notificationUpdating" name="heroicons:arrow-path" class="w-4 h-4 animate-spin" />
              {{ notificationUpdating ? '保存中...' : '保存设置' }}
            </button>
          </div>
        </div>
        
        <!-- 数据管理 -->
        <div v-if="activeSection === 'data'" class="setting-section">
          <div class="section-header">
            <h2 class="section-title">数据管理</h2>
            <p class="section-description">管理你的个人数据和账户</p>
          </div>
          
          <div class="data-groups">
            <div class="data-group">
              <h3 class="group-title">数据导出</h3>
              <p class="group-description">下载你的个人数据副本</p>
              <div class="data-actions">
                <button @click="exportData('profile')" class="btn btn-secondary">
                  <Icon name="heroicons:document-arrow-down" class="w-4 h-4" />
                  导出个人资料
                </button>
                <button @click="exportData('learning')" class="btn btn-secondary">
                  <Icon name="heroicons:document-arrow-down" class="w-4 h-4" />
                  导出学习记录
                </button>
                <button @click="exportData('posts')" class="btn btn-secondary">
                  <Icon name="heroicons:document-arrow-down" class="w-4 h-4" />
                  导出发布内容
                </button>
              </div>
            </div>
            
            <div class="data-group danger-group">
              <h3 class="group-title">危险操作</h3>
              <div class="danger-actions">
                <div class="danger-item">
                  <div class="item-info">
                    <div class="item-name">清除学习记录</div>
                    <div class="item-description">永久删除所有学习记录和进度数据</div>
                  </div>
                  <button @click="showClearDataModal = true" class="btn btn-danger">
                    清除记录
                  </button>
                </div>
                
                <div class="danger-item">
                  <div class="item-info">
                    <div class="item-name">删除账户</div>
                    <div class="item-description">永久删除你的账户和所有相关数据，此操作不可恢复</div>
                  </div>
                  <button @click="showDeleteAccountModal = true" class="btn btn-danger">
                    删除账户
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 确认删除数据弹窗 -->
    <div v-if="showClearDataModal" class="modal-overlay" @click="showClearDataModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2 class="modal-title">确认清除学习记录</h2>
          <button @click="showClearDataModal = false" class="modal-close">
            <Icon name="heroicons:x-mark" class="w-5 h-5" />
          </button>
        </div>
        
        <div class="modal-body">
          <div class="warning-message">
            <Icon name="heroicons:exclamation-triangle" class="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p class="text-center text-gray-700 dark:text-gray-300 mb-4">
              此操作将永久删除你的所有学习记录、测验成绩和进度数据。
            </p>
            <p class="text-center text-red-600 dark:text-red-400 font-semibold">
              此操作不可恢复！
            </p>
          </div>
          
          <div class="confirmation-input">
            <label class="form-label">请输入 "清除数据" 来确认操作</label>
            <input 
              v-model="clearDataConfirmation" 
              type="text" 
              class="form-input"
              placeholder="清除数据"
            >
          </div>
        </div>
        
        <div class="modal-actions">
          <button @click="showClearDataModal = false" class="btn btn-secondary">
            取消
          </button>
          <button 
            @click="clearLearningData" 
            class="btn btn-danger" 
            :disabled="clearDataConfirmation !== '清除数据' || dataClearing"
          >
            <Icon v-if="dataClearing" name="heroicons:arrow-path" class="w-4 h-4 animate-spin" />
            {{ dataClearing ? '清除中...' : '确认清除' }}
          </button>
        </div>
      </div>
    </div>
    
    <!-- 确认删除账户弹窗 -->
    <div v-if="showDeleteAccountModal" class="modal-overlay" @click="showDeleteAccountModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2 class="modal-title">确认删除账户</h2>
          <button @click="showDeleteAccountModal = false" class="modal-close">
            <Icon name="heroicons:x-mark" class="w-5 h-5" />
          </button>
        </div>
        
        <div class="modal-body">
          <div class="warning-message">
            <Icon name="heroicons:exclamation-triangle" class="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p class="text-center text-gray-700 dark:text-gray-300 mb-4">
              此操作将永久删除你的账户和所有相关数据，包括：
            </p>
            <ul class="text-left text-gray-600 dark:text-gray-400 mb-4 space-y-1">
              <li>• 个人资料信息</li>
              <li>• 学习记录和成就</li>
              <li>• 发布的帖子和评论</li>
              <li>• 所有设置和偏好</li>
            </ul>
            <p class="text-center text-red-600 dark:text-red-400 font-semibold">
              此操作不可恢复！
            </p>
          </div>
          
          <div class="confirmation-input">
            <label class="form-label">请输入你的邮箱地址来确认删除</label>
            <input 
              v-model="deleteAccountConfirmation" 
              type="email" 
              class="form-input"
              placeholder="请输入邮箱地址"
            >
          </div>
        </div>
        
        <div class="modal-actions">
          <button @click="showDeleteAccountModal = false" class="btn btn-secondary">
            取消
          </button>
          <button 
            @click="deleteAccount" 
            class="btn btn-danger" 
            :disabled="deleteAccountConfirmation !== profileForm.email || accountDeleting"
          >
            <Icon v-if="accountDeleting" name="heroicons:arrow-path" class="w-4 h-4 animate-spin" />
            {{ accountDeleting ? '删除中...' : '确认删除' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { useProfileForm, usePasswordChangeForm } from '~/composables/useForm'
import { useToast } from '~/composables/useNotification'
import { formatDate } from '~/utils/formatters'
import { USER_ROLES } from '~/constants'

// 页面元数据
useHead({
  title: '个人设置 - 反欺诈知识图谱系统',
  meta: [
    { name: 'description', content: '管理您的个人资料、安全设置和偏好配置' }
  ]
})

// 认证和通知
const { user, updateProfile, changePassword } = useAuth()
const { showToast } = useToast()

// 表单管理
const {
  formData: profileData,
  errors: profileErrors,
  isSubmitting: isUpdatingProfile,
  isDirty: isProfileDirty,
  validateField: validateProfileField,
  validateForm: validateProfileForm,
  setFieldValue: setProfileField,
  resetForm: resetProfileForm,
  submitForm: submitProfileForm
} = useProfileForm()

const {
  formData: passwordData,
  errors: passwordErrors,
  isSubmitting: isChangingPassword,
  isDirty: isPasswordDirty,
  validateField: validatePasswordField,
  validateForm: validatePasswordForm,
  setFieldValue: setPasswordField,
  resetForm: resetPasswordForm,
  submitForm: submitPasswordForm
} = usePasswordChangeForm()

// 响应式数据
const activeSection = ref('profile')
const profileUpdating = ref(false)
const passwordUpdating = ref(false)
const privacyUpdating = ref(false)
const notificationUpdating = ref(false)
const dataClearing = ref(false)
const accountDeleting = ref(false)
const showClearDataModal = ref(false)
const showDeleteAccountModal = ref(false)
const clearDataConfirmation = ref('')
const deleteAccountConfirmation = ref('')

// 表单引用
const avatarInput = ref(null)

// 设置分类
const settingSections = [
  { key: 'profile', label: '个人信息', icon: 'heroicons:user' },
  { key: 'security', label: '账户安全', icon: 'heroicons:shield-check' },
  { key: 'privacy', label: '隐私设置', icon: 'heroicons:eye-slash' },
  { key: 'notifications', label: '通知设置', icon: 'heroicons:bell' },
  { key: 'data', label: '数据管理', icon: 'heroicons:server' }
]

// 表单数据
const profileForm = ref({
  name: '张三',
  email: 'zhangsan@example.com',
  title: '高级数据科学家',
  location: '北京市',
  bio: '专注于反欺诈领域的机器学习应用，拥有5年以上的数据科学经验。',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhang'
})

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const securitySettings = ref({
  sms_2fa: false,
  email_2fa: true
})

const privacySettings = ref({
  profile_public: true,
  learning_public: true,
  online_status: true,
  data_analytics: true,
  usage_stats: false
})

const notificationSettings = ref({
  email: {
    system_updates: true,
    learning_reminders: true,
    community_activity: false
  },
  push: {
    instant_messages: true,
    learning_reminders: false
  },
  email_frequency: 'daily'
})

// 模拟登录记录
const loginHistory = ref([
  {
    id: 1,
    device_type: 'desktop',
    device_name: 'Chrome on Windows',
    location: '北京市',
    timestamp: '2024-01-20T14:30:00Z',
    is_current: true,
    is_suspicious: false
  },
  {
    id: 2,
    device_type: 'mobile',
    device_name: 'Safari on iPhone',
    location: '上海市',
    timestamp: '2024-01-19T09:15:00Z',
    is_current: false,
    is_suspicious: false
  },
  {
    id: 3,
    device_type: 'desktop',
    device_name: 'Firefox on Linux',
    location: '深圳市',
    timestamp: '2024-01-18T16:45:00Z',
    is_current: false,
    is_suspicious: true
  }
])

// 计算属性
const passwordsMatch = computed(() => {
  return passwordForm.value.newPassword === passwordForm.value.confirmPassword
})

const passwordStrength = computed(() => {
  const password = passwordForm.value.newPassword
  if (!password) return 0
  
  let strength = 0
  if (password.length >= 8) strength += 25
  if (/[a-z]/.test(password)) strength += 25
  if (/[A-Z]/.test(password)) strength += 25
  if (/[0-9]/.test(password)) strength += 25
  if (/[^A-Za-z0-9]/.test(password)) strength += 25
  
  return Math.min(strength, 100)
})

const passwordStrengthText = computed(() => {
  const strength = passwordStrength.value
  if (strength === 0) return ''
  if (strength < 50) return '弱'
  if (strength < 75) return '中等'
  return '强'
})

const passwordStrengthClass = computed(() => {
  const strength = passwordStrength.value
  if (strength < 50) return 'weak'
  if (strength < 75) return 'medium'
  return 'strong'
})

// 方法
const triggerAvatarUpload = () => {
  avatarInput.value?.click()
}

const handleAvatarUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    // TODO: 上传头像到服务器
    const reader = new FileReader()
    reader.onload = (e) => {
      profileForm.value.avatar = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const handleUpdateProfile = async () => {
  try {
    const isValid = await validateProfileForm()
    if (!isValid) return
    
    await submitProfileForm(async (data) => {
      const result = await updateProfile(data)
      
      // 更新本地表单数据
      Object.assign(profileForm.value, result.data)
      
      showToast({
        type: 'success',
        title: '更新成功',
        message: '个人资料已成功更新'
      })
      
      return result
    })
    
  } catch (err) {
    console.error('Failed to update profile:', err)
    showToast({
      type: 'error',
      title: '更新失败',
      message: err.message || '更新个人资料时发生错误'
    })
  }
}

const handleChangePassword = async () => {
  try {
    const isValid = await validatePasswordForm()
    if (!isValid) return
    
    await submitPasswordForm(async (data) => {
      const result = await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      })
      
      // 重置表单
      resetPasswordForm()
      
      showToast({
        type: 'success',
        title: '修改成功',
        message: '密码已成功修改'
      })
      
      return result
    })
    
  } catch (err) {
    console.error('Failed to change password:', err)
    showToast({
      type: 'error',
      title: '修改失败',
      message: err.message || '修改密码时发生错误'
    })
  }
}

const toggleSMS2FA = async () => {
  try {
    const response = await updateSecuritySettings({
      sms_2fa: !securitySettings.value.sms_2fa
    })
    securitySettings.value.sms_2fa = response.sms_2fa
    showToast(response.sms_2fa ? '短信两步验证已开启' : '短信两步验证已关闭', 'success')
  } catch (err) {
    showToast('设置失败', 'error')
    console.error('Failed to toggle SMS 2FA:', err)
  }
}

const toggleEmail2FA = async () => {
  try {
    const response = await updateSecuritySettings({
      email_2fa: !securitySettings.value.email_2fa
    })
    securitySettings.value.email_2fa = response.email_2fa
    showToast(response.email_2fa ? '邮箱两步验证已开启' : '邮箱两步验证已关闭', 'success')
  } catch (err) {
    showToast('设置失败', 'error')
    console.error('Failed to toggle Email 2FA:', err)
  }
}

const updatePrivacySettings = async () => {
  privacyUpdating.value = true
  
  try {
    const { $api } = useNuxtApp()
    const result = await $api.user.updatePrivacySettings(privacySettings.value)
    
    showToast({
      type: 'success',
      title: '更新成功',
      message: '隐私设置已成功更新'
    })
    
    console.log('Privacy settings updated:', result)
    
  } catch (err) {
    console.error('Failed to update privacy settings:', err)
    showToast({
      type: 'error',
      title: '更新失败',
      message: err.message || '更新隐私设置时发生错误'
    })
  } finally {
    privacyUpdating.value = false
  }
}

const updateNotificationSettings = async () => {
  notificationUpdating.value = true
  
  try {
    const { $api } = useNuxtApp()
    const result = await $api.user.updateNotificationSettings(notificationSettings.value)
    
    showToast({
      type: 'success',
      title: '更新成功',
      message: '通知设置已成功更新'
    })
    
    console.log('Notification settings updated:', result)
    
  } catch (err) {
    console.error('Failed to update notification settings:', err)
    showToast({
      type: 'error',
      title: '更新失败',
      message: err.message || '更新通知设置时发生错误'
    })
  } finally {
    notificationUpdating.value = false
  }
}

const exportData = async (type) => {
  try {
    const response = await exportUserData(type)
    
    // 创建下载链接
    const blob = new Blob([JSON.stringify(response.data, null, 2)], {
      type: 'application/json'
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${type}_data_${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
    
    showToast('数据导出成功', 'success')
  } catch (err) {
    showToast('数据导出失败', 'error')
    console.error('Failed to export data:', err)
  }
}

const clearLearningData = async () => {
  dataClearing.value = true
  
  try {
    await clearUserLearningData()
    
    showClearDataModal.value = false
    clearDataConfirmation.value = ''
    showToast('学习数据已清除', 'success')
    
  } catch (err) {
    showToast('清除数据失败', 'error')
    console.error('Failed to clear learning data:', err)
  } finally {
    dataClearing.value = false
  }
}

const deleteAccount = async () => {
  accountDeleting.value = true
  
  try {
    await deleteUserAccount()
    
    showToast('账户已删除', 'success')
    
    // 清除本地存储并重定向到登录页面
    await logout()
    await navigateTo('/login')
    
  } catch (err) {
    console.error('Failed to delete account:', err)
  } finally {
    accountDeleting.value = false
  }
}

const getDeviceIcon = (deviceType) => {
  const icons = {
    desktop: 'heroicons:computer-desktop',
    mobile: 'heroicons:device-phone-mobile',
    tablet: 'heroicons:device-tablet'
  }
  return icons[deviceType] || 'heroicons:computer-desktop'
}

const formatDateTime = (timestamp) => {
  return new Date(timestamp).toLocaleString('zh-CN')
}

// 监听弹窗关闭，重置确认输入
watch(showClearDataModal, (newVal) => {
  if (!newVal) {
    clearDataConfirmation.value = ''
  }
})

watch(showDeleteAccountModal, (newVal) => {
  if (!newVal) {
    deleteAccountConfirmation.value = ''
  }
})

// 初始化数据
const initializeData = async () => {
  try {
    const { $api } = useNuxtApp()
    
    // 加载用户设置数据
    const [privacyData, notificationData, securityData, loginHistoryData] = await Promise.all([
      $api.user.getPrivacySettings(),
      $api.user.getNotificationSettings(),
      $api.user.getSecuritySettings(),
      $api.user.getLoginHistory()
    ])
    
    // 更新响应式数据
    Object.assign(privacySettings.value, privacyData)
    Object.assign(notificationSettings.value, notificationData)
    Object.assign(securitySettings.value, securityData)
    loginHistory.value = loginHistoryData
    
    // 初始化表单数据
    if (user.value) {
      Object.assign(profileForm.value, {
        name: user.value.name,
        email: user.value.email,
        title: user.value.title,
        location: user.value.location,
        bio: user.value.bio,
        avatar: user.value.avatar
      })
    }
    
  } catch (err) {
    console.error('Failed to initialize settings data:', err)
    showToast({
      type: 'error',
      title: '加载失败',
      message: '加载设置数据时发生错误'
    })
  }
}

// 生命周期
onMounted(() => {
  initializeData()
})
</script>

<style scoped>
.settings-page {
  @apply min-h-screen bg-gray-50 dark:bg-gray-900;
}

.page-header {
  @apply bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-8;
}

.header-content {
  @apply max-w-6xl mx-auto flex items-center justify-between;
}

.header-info {
  @apply flex-1;
}

.page-title {
  @apply text-3xl font-bold text-gray-900 dark:text-white mb-2;
}

.page-description {
  @apply text-gray-600 dark:text-gray-400;
}

.header-actions {
  @apply flex gap-3;
}

.settings-content {
  @apply max-w-6xl mx-auto p-6 flex gap-8;
}

.settings-sidebar {
  @apply w-64 flex-shrink-0;
}

.settings-nav {
  @apply bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-2;
}

.nav-item {
  @apply w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 dark:text-gray-300
         hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors;
}

.nav-item.active {
  @apply bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400;
}

.settings-panel {
  @apply flex-1;
}

.setting-section {
  @apply bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8;
}

.section-header {
  @apply mb-8 pb-4 border-b border-gray-200 dark:border-gray-700;
}

.section-title {
  @apply text-2xl font-bold text-gray-900 dark:text-white mb-2;
}

.section-description {
  @apply text-gray-600 dark:text-gray-400;
}

.setting-form {
  @apply space-y-6;
}

.form-row {
  @apply grid grid-cols-1 md:grid-cols-2 gap-6;
}

.form-group {
  @apply space-y-2;
}

.form-label {
  @apply block text-sm font-medium text-gray-700 dark:text-gray-300;
}

.form-input {
  @apply w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
         focus:ring-2 focus:ring-primary-500 focus:border-primary-500;
}

.form-textarea {
  @apply w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
         focus:ring-2 focus:ring-primary-500 focus:border-primary-500
         resize-y;
}

.form-select {
  @apply w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
         focus:ring-2 focus:ring-primary-500 focus:border-primary-500;
}

.form-hint {
  @apply text-xs text-gray-500 dark:text-gray-400 text-right;
}

.form-error {
  @apply text-sm text-red-600 dark:text-red-400;
}

.form-actions {
  @apply flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700;
}

.avatar-setting {
  @apply flex items-center gap-4;
}

.current-avatar {
  @apply w-20 h-20 rounded-full border-2 border-gray-200 dark:border-gray-600;
}

.avatar-actions {
  @apply flex flex-col gap-2;
}

.security-group,
.privacy-group,
.notification-group,
.data-group {
  @apply mb-8 last:mb-0;
}

.group-title {
  @apply text-lg font-semibold text-gray-900 dark:text-white mb-4;
}

.group-description {
  @apply text-gray-600 dark:text-gray-400 mb-4;
}

.security-item,
.privacy-item,
.notification-item,
.danger-item {
  @apply flex items-center justify-between py-4 border-b border-gray-200 dark:border-gray-700
         last:border-b-0;
}

.item-info {
  @apply flex-1;
}

.item-name {
  @apply font-medium text-gray-900 dark:text-white mb-1;
}

.item-description {
  @apply text-sm text-gray-600 dark:text-gray-400;
}

.item-status {
  @apply flex items-center gap-3;
}

.item-toggle {
  @apply relative;
}

.status-badge {
  @apply px-2 py-1 rounded text-xs font-medium;
}

.status-badge.enabled {
  @apply bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300;
}

.status-badge.disabled {
  @apply bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300;
}

.status-badge.current {
  @apply bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300;
}

.status-badge.suspicious {
  @apply bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300;
}

.status-badge.normal {
  @apply bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300;
}

.password-strength {
  @apply flex items-center gap-3 mt-2;
}

.strength-bar {
  @apply flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden;
}

.strength-fill {
  @apply h-full transition-all duration-300;
}

.strength-fill.weak {
  @apply bg-red-500;
}

.strength-fill.medium {
  @apply bg-yellow-500;
}

.strength-fill.strong {
  @apply bg-green-500;
}

.strength-text {
  @apply text-sm font-medium;
}

.strength-text.weak {
  @apply text-red-600 dark:text-red-400;
}

.strength-text.medium {
  @apply text-yellow-600 dark:text-yellow-400;
}

.strength-text.strong {
  @apply text-green-600 dark:text-green-400;
}

.login-history {
  @apply space-y-4;
}

.login-item {
  @apply flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg;
}

.login-info {
  @apply flex-1;
}

.login-device {
  @apply flex items-center gap-2 font-medium text-gray-900 dark:text-white mb-1;
}

.login-details {
  @apply flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400;
}

.login-location {
  @apply flex items-center gap-1;
}

.login-time {
  @apply flex items-center gap-1;
}

.login-status {
  @apply flex items-center;
}

.privacy-groups,
.notification-groups,
.data-groups {
  @apply space-y-8;
}

.privacy-items,
.notification-items {
  @apply space-y-4;
}

.frequency-setting {
  @apply space-y-2;
}

.data-actions {
  @apply flex flex-wrap gap-3;
}

.danger-group {
  @apply border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10 rounded-lg p-6;
}

.danger-actions {
  @apply space-y-4;
}

.toggle-input {
  @apply sr-only;
}

.toggle-label {
  @apply block w-12 h-6 bg-gray-300 dark:bg-gray-600 rounded-full cursor-pointer
         transition-colors relative;
}

.toggle-label::after {
  @apply content-[''] absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full
         transition-transform;
}

.toggle-input:checked + .toggle-label {
  @apply bg-primary-600;
}

.toggle-input:checked + .toggle-label::after {
  @apply transform translate-x-6;
}

.modal-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50;
}

.modal-content {
  @apply bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto;
}

.modal-header {
  @apply flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700;
}

.modal-title {
  @apply text-lg font-semibold text-gray-900 dark:text-white;
}

.modal-close {
  @apply p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors;
}

.modal-body {
  @apply p-6 space-y-4;
}

.modal-actions {
  @apply flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700;
}

.warning-message {
  @apply text-center mb-6;
}

.confirmation-input {
  @apply space-y-2;
}

.btn {
  @apply inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors
         focus:outline-none focus:ring-2 focus:ring-offset-2;
}

.btn-primary {
  @apply bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500;
}

.btn-secondary {
  @apply bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500;
}

.btn-danger {
  @apply bg-red-600 text-white hover:bg-red-700 focus:ring-red-500;
}

.btn-sm {
  @apply px-3 py-1.5 text-sm;
}

.btn:disabled {
  @apply opacity-50 cursor-not-allowed;
}
</style>