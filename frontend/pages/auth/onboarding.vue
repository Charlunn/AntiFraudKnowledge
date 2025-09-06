<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <div class="flex justify-center">
          <img class="h-12 w-auto" src="/logo.svg" alt="Logo" />
        </div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          完善个人信息
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          请补充以下信息，帮助我们为您提供更好的服务
        </p>
      </div>
      
      <form class="mt-8 space-y-6" @submit.prevent="handleSubmit">
        <div class="space-y-4">
          <!-- 年龄范围 -->
          <div>
            <label for="age-range" class="block text-sm font-medium text-gray-700 mb-2">
              年龄范围
            </label>
            <select
              id="age-range"
              v-model="form.age_range"
              name="age-range"
              required
              class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="">请选择年龄范围</option>
              <option
                v-for="option in options.age_ranges"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
          </div>
          
          <!-- 性别 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              性别
            </label>
            <div class="space-y-2">
              <div
                v-for="option in options.genders"
                :key="option.value"
                class="flex items-center"
              >
                <input
                  :id="`gender-${option.value}`"
                  v-model="form.gender"
                  :value="option.value"
                  name="gender"
                  type="radio"
                  required
                  class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                />
                <label
                  :for="`gender-${option.value}`"
                  class="ml-3 block text-sm font-medium text-gray-700"
                >
                  {{ option.label }}
                </label>
              </div>
            </div>
          </div>
          
          <!-- 职业 -->
          <div>
            <label for="occupation" class="block text-sm font-medium text-gray-700 mb-2">
              职业
            </label>
            <select
              id="occupation"
              v-model="form.occupation"
              name="occupation"
              required
              class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="">请选择职业</option>
              <option
                v-for="option in options.occupations"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
          </div>
        </div>
        
        <!-- 错误提示 -->
        <div v-if="error" class="bg-red-50 border border-red-200 rounded-md p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <ExclamationCircleIcon class="h-5 w-5 text-red-400" />
            </div>
            <div class="ml-3">
              <p class="text-sm text-red-800">{{ error }}</p>
            </div>
          </div>
        </div>
        
        <div class="space-y-3">
          <button
            type="submit"
            :disabled="loading || !isFormValid"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="loading" class="absolute left-0 inset-y-0 flex items-center pl-3">
              <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            </span>
            {{ loading ? '保存中...' : '完成设置' }}
          </button>
          
          <button
            type="button"
            class="w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            @click="skipOnboarding"
          >
            跳过，稍后设置
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
import { ExclamationCircleIcon } from '@heroicons/vue/24/outline'

const router = useRouter()
const authStore = useAuthStore()

// 表单数据
const form = ref({
  age_range: '',
  gender: '',
  occupation: ''
})

// 状态
const loading = ref(false)
const error = ref('')
const options = ref({
  age_ranges: [],
  genders: [],
  occupations: []
})

// 计算属性
const isFormValid = computed(() => {
  return form.value.age_range && form.value.gender && form.value.occupation
})

// 获取选项数据
const fetchOptions = async () => {
  try {
    const response = await $fetch('/api/users/onboarding/', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authStore.accessToken}`
      }
    })
    
    options.value = response.options
  } catch (err) {
    console.error('获取选项失败:', err)
    error.value = '加载选项失败，请刷新页面重试'
  }
}

const handleSubmit = async () => {
  if (!isFormValid.value) return
  
  loading.value = true
  error.value = ''
  
  try {
    const response = await $fetch('/api/users/onboarding/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authStore.accessToken}`
      },
      body: {
        age_range: form.value.age_range,
        gender: form.value.gender,
        occupation: form.value.occupation
      }
    })
    
    if (response.success) {
      // 引导流程完成，跳转到仪表板
      await router.push('/dashboard')
    }
  } catch (err) {
    error.value = err.data?.error || '保存失败，请重试'
  } finally {
    loading.value = false
  }
}

const skipOnboarding = async () => {
  // 直接跳转到仪表板，不保存信息
  await router.push('/dashboard')
}

onMounted(async () => {
  // 检查用户是否已登录
  if (!authStore.isAuthenticated) {
    await router.push('/login')
    return
  }
  
  // 获取选项数据
  await fetchOptions()
})
</script>