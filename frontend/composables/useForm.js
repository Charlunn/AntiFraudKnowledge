// 表单处理和验证管理

import { ref, reactive, computed, watch, nextTick } from 'vue'
import { Validator, createLoginValidator, createRegisterValidator } from '~/utils/validation'
import { handleError } from '~/utils/errorHandler'
import { formatters } from '~/utils/formatters'

// 通用表单处理composable
export const useForm = (initialData = {}, options = {}) => {
  const {
    validator = null,
    onSubmit = null,
    onSuccess = null,
    onError = null,
    resetOnSuccess = false,
    validateOnChange = true,
    validateOnBlur = true,
    debounceMs = 300
  } = options

  // 表单状态
  const formData = reactive({ ...initialData })
  const originalData = { ...initialData }
  const isSubmitting = ref(false)
  const isValidating = ref(false)
  const submitError = ref(null)
  const submitSuccess = ref(null)
  const touchedFields = ref(new Set())

  // 验证器实例
  const formValidator = validator || new Validator()
  const fieldErrors = ref({})
  const isValid = ref(true)

  // 计算属性
  const isDirty = computed(() => {
    return JSON.stringify(formData) !== JSON.stringify(originalData)
  })

  const hasErrors = computed(() => {
    return Object.keys(fieldErrors.value).length > 0
  })

  const canSubmit = computed(() => {
    return !isSubmitting.value && !hasErrors.value && isDirty.value && isValid.value
  })

  // 防抖验证
  let validationTimer = null
  const debounceValidation = (field, value) => {
    if (validationTimer) {
      clearTimeout(validationTimer)
    }
    
    validationTimer = setTimeout(() => {
      validateField(field, value)
    }, debounceMs)
  }

  // 验证单个字段
  const validateField = async (field, value = formData[field]) => {
    if (!formValidator) return true

    isValidating.value = true
    
    try {
      const isValid = formValidator.validateField(field, value, formData)
      
      if (isValid) {
        delete fieldErrors.value[field]
      } else {
        const errors = formValidator.getFieldErrors(field)
        fieldErrors.value[field] = errors
      }
      
      updateValidationState()
      return isValid
    } catch (error) {
      console.warn('Field validation error:', error)
      return false
    } finally {
      isValidating.value = false
    }
  }

  // 验证整个表单
  const validateForm = async () => {
    if (!formValidator) return true

    isValidating.value = true
    
    try {
      const isValid = formValidator.validate(formData)
      
      // 获取所有字段的错误
      const allErrors = {}
      for (const field of Object.keys(formData)) {
        const errors = formValidator.getFieldErrors(field)
        if (errors && errors.length > 0) {
          allErrors[field] = errors
        }
      }
      
      fieldErrors.value = allErrors
      updateValidationState()
      return isValid
    } catch (error) {
      console.warn('Form validation error:', error)
      return false
    } finally {
      isValidating.value = false
    }
  }

  // 更新验证状态
  const updateValidationState = () => {
    isValid.value = Object.keys(fieldErrors.value).length === 0
  }

  // 设置字段值
  const setFieldValue = (field, value) => {
    formData[field] = value
    touchedFields.value.add(field)
    
    if (validateOnChange) {
      debounceValidation(field, value)
    }
  }

  // 设置字段错误
  const setFieldError = (field, error) => {
    if (error) {
      fieldErrors.value[field] = Array.isArray(error) ? error : [error]
    } else {
      delete fieldErrors.value[field]
    }
    updateValidationState()
  }

  // 清除字段错误
  const clearFieldError = (field) => {
    delete fieldErrors.value[field]
    updateValidationState()
  }

  // 清除所有错误
  const clearErrors = () => {
    fieldErrors.value = {}
    submitError.value = null
    updateValidationState()
  }

  // 重置表单
  const resetForm = () => {
    Object.keys(formData).forEach(key => {
      formData[key] = originalData[key]
    })
    touchedFields.value.clear()
    clearErrors()
    submitSuccess.value = null
  }

  // 处理字段失焦
  const handleFieldBlur = (field) => {
    touchedFields.value.add(field)
    
    if (validateOnBlur) {
      validateField(field)
    }
  }

  // 提交表单
  const submitForm = async () => {
    if (isSubmitting.value) return

    // 清除之前的错误和成功消息
    submitError.value = null
    submitSuccess.value = null

    // 验证表单
    const isFormValid = await validateForm()
    if (!isFormValid) {
      submitError.value = '请检查表单中的错误'
      return { success: false, error: '表单验证失败' }
    }

    if (!onSubmit) {
      console.warn('No onSubmit handler provided')
      return { success: false, error: '未提供提交处理函数' }
    }

    isSubmitting.value = true

    try {
      const result = await onSubmit(formData)
      
      if (result && result.success !== false) {
        submitSuccess.value = result.message || '操作成功'
        
        if (onSuccess) {
          await onSuccess(result, formData)
        }
        
        if (resetOnSuccess) {
          resetForm()
        }
        
        return { success: true, data: result }
      } else {
        const errorMessage = result?.error || result?.message || '操作失败'
        submitError.value = errorMessage
        
        if (onError) {
          await onError(result, formData)
        }
        
        return { success: false, error: errorMessage }
      }
    } catch (error) {
      const processedError = handleError(error, { action: 'form_submit', formData })
      submitError.value = processedError.userMessage
      
      // 处理字段级别的错误
      if (processedError.fieldErrors) {
        Object.entries(processedError.fieldErrors).forEach(([field, errors]) => {
          setFieldError(field, errors)
        })
      }
      
      if (onError) {
        await onError(processedError, formData)
      }
      
      return { success: false, error: processedError.userMessage }
    } finally {
      isSubmitting.value = false
    }
  }

  // 获取字段错误
  const getFieldError = (field) => {
    return fieldErrors.value[field] || []
  }

  // 检查字段是否有错误
  const hasFieldError = (field) => {
    return !!fieldErrors.value[field] && fieldErrors.value[field].length > 0
  }

  // 检查字段是否被触摸
  const isFieldTouched = (field) => {
    return touchedFields.value.has(field)
  }

  // 格式化字段值
  const formatFieldValue = (field, formatter) => {
    if (formData[field] && formatters[formatter]) {
      formData[field] = formatters[formatter](formData[field])
    }
  }

  // 监听表单数据变化
  watch(
    () => formData,
    () => {
      // 清除成功消息
      if (submitSuccess.value) {
        submitSuccess.value = null
      }
    },
    { deep: true }
  )

  return {
    // 表单数据
    formData,
    
    // 状态
    isSubmitting: computed(() => isSubmitting.value),
    isValidating: computed(() => isValidating.value),
    isValid: computed(() => isValid.value),
    isDirty,
    hasErrors,
    canSubmit,
    
    // 错误和消息
    fieldErrors: computed(() => fieldErrors.value),
    submitError: computed(() => submitError.value),
    submitSuccess: computed(() => submitSuccess.value),
    
    // 方法
    setFieldValue,
    setFieldError,
    clearFieldError,
    clearErrors,
    resetForm,
    validateField,
    validateForm,
    submitForm,
    handleFieldBlur,
    getFieldError,
    hasFieldError,
    isFieldTouched,
    formatFieldValue
  }
}

// 登录表单
export const useLoginForm = (onSubmit, options = {}) => {
  const initialData = {
    username: '',
    password: '',
    rememberMe: false
  }

  const validator = new Validator()
  validator.required('username', '请输入用户名或邮箱')
  validator.required('password', '请输入密码')

  return useForm(initialData, {
    validator,
    onSubmit,
    ...options
  })
}

// 注册表单
export const useRegisterForm = (onSubmit, options = {}) => {
  const initialData = {
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  }

  const validator = createRegisterValidator()
  
  const form = useForm(initialData, {
    validator,
    onSubmit,
    ...options
  })
  
  // 重写canSubmit逻辑，添加注册特定的验证
  const canSubmit = computed(() => {
    const { formData, isSubmitting, hasErrors, isValid } = form
    
    // 检查所有必填字段是否已填写
    const hasAllRequiredFields = 
      formData.username.trim() !== '' &&
      formData.email.trim() !== '' &&
      formData.password.trim() !== '' &&
      formData.confirmPassword.trim() !== ''
    
    // 检查密码是否匹配
    const passwordsMatch = formData.password === formData.confirmPassword
    
    // 检查是否同意条款
    const agreedToTerms = formData.agreeToTerms === true
    
    return !isSubmitting.value && 
           !hasErrors.value && 
           isValid.value && 
           hasAllRequiredFields && 
           passwordsMatch && 
           agreedToTerms
  })
  
  return {
    ...form,
    canSubmit
  }
}

// 密码重置表单
export const usePasswordResetForm = (onSubmit, options = {}) => {
  const initialData = {
    email: ''
  }

  const validator = new Validator()
  validator.addRule('email', 'required', '邮箱地址不能为空')
  validator.addRule('email', 'email', '请输入有效的邮箱地址')

  return useForm(initialData, {
    validator,
    onSubmit,
    ...options
  })
}

// 修改密码表单
export const useChangePasswordForm = (onSubmit, options = {}) => {
  const initialData = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  }

  const validator = new Validator()
  validator.addRule('currentPassword', 'required', '当前密码不能为空')
  validator.addRule('newPassword', 'required', '新密码不能为空')
  validator.addRule('newPassword', 'minLength', '密码至少需要8个字符', 8)
  validator.addRule('confirmPassword', 'required', '确认密码不能为空')
  validator.addRule('confirmPassword', 'match', '两次输入的密码不一致', 'newPassword')

  return useForm(initialData, {
    validator,
    onSubmit,
    ...options
  })
}

// 个人资料表单
export const useProfileForm = (initialData = {}, onSubmit, options = {}) => {
  const defaultData = {
    username: '',
    email: '',
    name: '',
    bio: '',
    location: '',
    website: '',
    ...initialData
  }

  const validator = new Validator()
  validator.addRule('username', 'required', '用户名不能为空')
  validator.addRule('username', 'minLength', '用户名至少需要3个字符', 3)
  validator.addRule('email', 'required', '邮箱地址不能为空')
  validator.addRule('email', 'email', '请输入有效的邮箱地址')
  validator.addRule('name', 'maxLength', '姓名不能超过50个字符', 50)
  validator.addRule('bio', 'maxLength', '个人简介不能超过200个字符', 200)
  validator.addRule('website', 'url', '请输入有效的网址')

  return useForm(defaultData, {
    validator,
    onSubmit,
    ...options
  })
}

// 搜索表单
export const useSearchForm = (onSubmit, options = {}) => {
  const initialData = {
    query: '',
    category: '',
    sortBy: 'relevance',
    dateRange: ''
  }

  const validator = new Validator()
  validator.addRule('query', 'required', '搜索关键词不能为空')
  validator.addRule('query', 'minLength', '搜索关键词至少需要2个字符', 2)

  return useForm(initialData, {
    validator,
    onSubmit,
    validateOnChange: false, // 搜索表单不需要实时验证
    ...options
  })
}

// 评论表单
export const useCommentForm = (onSubmit, options = {}) => {
  const initialData = {
    content: '',
    parentId: null
  }

  const validator = new Validator()
  validator.addRule('content', 'required', '评论内容不能为空')
  validator.addRule('content', 'minLength', '评论内容至少需要5个字符', 5)
  validator.addRule('content', 'maxLength', '评论内容不能超过1000个字符', 1000)

  return useForm(initialData, {
    validator,
    onSubmit,
    resetOnSuccess: true,
    ...options
  })
}

// 帖子表单
export const usePostForm = (initialData = {}, onSubmit, options = {}) => {
  const defaultData = {
    title: '',
    content: '',
    category: '',
    tags: [],
    isPublic: true,
    ...initialData
  }

  const validator = new Validator()
  validator.addRule('title', 'required', '标题不能为空')
  validator.addRule('title', 'minLength', '标题至少需要5个字符', 5)
  validator.addRule('title', 'maxLength', '标题不能超过100个字符', 100)
  validator.addRule('content', 'required', '内容不能为空')
  validator.addRule('content', 'minLength', '内容至少需要20个字符', 20)
  validator.addRule('category', 'required', '请选择分类')

  return useForm(defaultData, {
    validator,
    onSubmit,
    ...options
  })
}

// 导出所有表单composables
export default {
  useForm,
  useLoginForm,
  useRegisterForm,
  usePasswordResetForm,
  useChangePasswordForm,
  useProfileForm,
  useSearchForm,
  useCommentForm,
  usePostForm
}