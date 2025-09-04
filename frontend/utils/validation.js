// 表单验证工具 - 提供统一的表单验证规则和验证函数

// 验证规则类型
export const ValidationRules = {
  REQUIRED: 'required',
  EMAIL: 'email',
  PASSWORD: 'password',
  CONFIRM_PASSWORD: 'confirmPassword',
  USERNAME: 'username',
  PHONE: 'phone',
  URL: 'url',
  NUMBER: 'number',
  INTEGER: 'integer',
  MIN_LENGTH: 'minLength',
  MAX_LENGTH: 'maxLength',
  MIN_VALUE: 'minValue',
  MAX_VALUE: 'maxValue',
  PATTERN: 'pattern',
  CUSTOM: 'custom'
}

// 预定义的正则表达式
const patterns = {
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  phone: /^1[3-9]\d{9}$/,
  username: /^[a-zA-Z0-9_]{3,20}$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
  url: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  number: /^-?\d*\.?\d+$/,
  integer: /^-?\d+$/,
  chinese: /^[\u4e00-\u9fa5]+$/,
  idCard: /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/
}

// 错误消息模板
const errorMessages = {
  required: '此字段为必填项',
  email: '请输入有效的邮箱地址',
  password: '密码必须包含大小写字母和数字，至少8位',
  confirmPassword: '两次输入的密码不一致',
  username: '用户名只能包含字母、数字和下划线，长度3-20位',
  phone: '请输入有效的手机号码',
  url: '请输入有效的URL地址',
  number: '请输入有效的数字',
  integer: '请输入有效的整数',
  minLength: '长度不能少于{min}位',
  maxLength: '长度不能超过{max}位',
  minValue: '值不能小于{min}',
  maxValue: '值不能大于{max}',
  pattern: '格式不正确',
  custom: '验证失败'
}

// 验证器类
export class Validator {
  constructor() {
    this.rules = new Map()
    this.errors = new Map()
  }
  
  // 添加验证规则
  addRule(field, rule) {
    if (!this.rules.has(field)) {
      this.rules.set(field, [])
    }
    this.rules.get(field).push(rule)
    return this
  }
  
  // 添加必填规则
  required(field, message) {
    return this.addRule(field, {
      type: ValidationRules.REQUIRED,
      message: message || errorMessages.required,
      validate: (value) => {
        if (Array.isArray(value)) return value.length > 0
        if (typeof value === 'string') return value.trim().length > 0
        if (typeof value === 'boolean') return value === true
        return value !== null && value !== undefined && value !== ''
      }
    })
  }
  
  // 添加邮箱规则
  email(field, message) {
    return this.addRule(field, {
      type: ValidationRules.EMAIL,
      message: message || errorMessages.email,
      validate: (value) => {
        if (!value) return true // 空值由required规则处理
        return patterns.email.test(value)
      }
    })
  }
  
  // 添加密码规则
  password(field, message) {
    return this.addRule(field, {
      type: ValidationRules.PASSWORD,
      message: message || errorMessages.password,
      validate: (value) => {
        if (!value) return true
        return patterns.password.test(value)
      }
    })
  }
  
  // 添加确认密码规则
  confirmPassword(field, passwordField, message) {
    return this.addRule(field, {
      type: ValidationRules.CONFIRM_PASSWORD,
      message: message || errorMessages.confirmPassword,
      validate: (value, data) => {
        if (!value) return true
        return value === data[passwordField]
      }
    })
  }
  
  // 添加用户名规则
  username(field, message) {
    return this.addRule(field, {
      type: ValidationRules.USERNAME,
      message: message || errorMessages.username,
      validate: (value) => {
        if (!value) return true
        return patterns.username.test(value)
      }
    })
  }
  
  // 添加手机号规则
  phone(field, message) {
    return this.addRule(field, {
      type: ValidationRules.PHONE,
      message: message || errorMessages.phone,
      validate: (value) => {
        if (!value) return true
        return patterns.phone.test(value)
      }
    })
  }
  
  // 添加URL规则
  url(field, message) {
    return this.addRule(field, {
      type: ValidationRules.URL,
      message: message || errorMessages.url,
      validate: (value) => {
        if (!value) return true
        return patterns.url.test(value)
      }
    })
  }
  
  // 添加数字规则
  number(field, message) {
    return this.addRule(field, {
      type: ValidationRules.NUMBER,
      message: message || errorMessages.number,
      validate: (value) => {
        if (!value) return true
        return patterns.number.test(value) && !isNaN(Number(value))
      }
    })
  }
  
  // 添加整数规则
  integer(field, message) {
    return this.addRule(field, {
      type: ValidationRules.INTEGER,
      message: message || errorMessages.integer,
      validate: (value) => {
        if (!value) return true
        return patterns.integer.test(value)
      }
    })
  }
  
  // 添加最小长度规则
  minLength(field, min, message) {
    return this.addRule(field, {
      type: ValidationRules.MIN_LENGTH,
      message: message || errorMessages.minLength.replace('{min}', min),
      validate: (value) => {
        if (!value) return true
        return String(value).length >= min
      }
    })
  }
  
  // 添加最大长度规则
  maxLength(field, max, message) {
    return this.addRule(field, {
      type: ValidationRules.MAX_LENGTH,
      message: message || errorMessages.maxLength.replace('{max}', max),
      validate: (value) => {
        if (!value) return true
        return String(value).length <= max
      }
    })
  }
  
  // 添加最小值规则
  minValue(field, min, message) {
    return this.addRule(field, {
      type: ValidationRules.MIN_VALUE,
      message: message || errorMessages.minValue.replace('{min}', min),
      validate: (value) => {
        if (!value) return true
        return Number(value) >= min
      }
    })
  }
  
  // 添加最大值规则
  maxValue(field, max, message) {
    return this.addRule(field, {
      type: ValidationRules.MAX_VALUE,
      message: message || errorMessages.maxValue.replace('{max}', max),
      validate: (value) => {
        if (!value) return true
        return Number(value) <= max
      }
    })
  }
  
  // 添加正则表达式规则
  pattern(field, regex, message) {
    return this.addRule(field, {
      type: ValidationRules.PATTERN,
      message: message || errorMessages.pattern,
      validate: (value) => {
        if (!value) return true
        return regex.test(value)
      }
    })
  }
  
  // 添加自定义规则
  custom(field, validateFn, message) {
    return this.addRule(field, {
      type: ValidationRules.CUSTOM,
      message: message || errorMessages.custom,
      validate: validateFn
    })
  }
  
  // 验证单个字段
  validateField(field, value, data = {}) {
    const fieldRules = this.rules.get(field) || []
    const fieldErrors = []
    
    for (const rule of fieldRules) {
      try {
        const isValid = rule.validate(value, data)
        if (!isValid) {
          fieldErrors.push(rule.message)
        }
      } catch (error) {
        fieldErrors.push('验证过程中发生错误')
      }
    }
    
    if (fieldErrors.length > 0) {
      this.errors.set(field, fieldErrors)
    } else {
      this.errors.delete(field)
    }
    
    return fieldErrors.length === 0
  }
  
  // 验证所有字段
  validate(data) {
    this.errors.clear()
    let isValid = true
    
    for (const [field] of this.rules) {
      const fieldValid = this.validateField(field, data[field], data)
      if (!fieldValid) {
        isValid = false
      }
    }
    
    return isValid
  }
  
  // 获取字段错误
  getFieldError(field) {
    const errors = this.errors.get(field)
    return errors && errors.length > 0 ? errors[0] : null
  }
  
  // 获取字段所有错误
  getFieldErrors(field) {
    return this.errors.get(field) || []
  }
  
  // 获取所有错误
  getAllErrors() {
    const allErrors = {}
    for (const [field, errors] of this.errors) {
      allErrors[field] = errors
    }
    return allErrors
  }
  
  // 检查是否有错误
  hasErrors() {
    return this.errors.size > 0
  }
  
  // 检查字段是否有错误
  hasFieldError(field) {
    return this.errors.has(field)
  }
  
  // 清除所有错误
  clearErrors() {
    this.errors.clear()
  }
  
  // 清除字段错误
  clearFieldError(field) {
    this.errors.delete(field)
  }
  
  // 设置字段错误
  setFieldError(field, message) {
    this.errors.set(field, [message])
  }
  
  // 重置验证器
  reset() {
    this.rules.clear()
    this.errors.clear()
  }
}

// 预定义的验证器工厂函数
export const createLoginValidator = () => {
  return new Validator()
    .required('email', '请输入邮箱')
    .email('email')
    .required('password', '请输入密码')
}

export const createRegisterValidator = () => {
  return new Validator()
    .required('username', '请输入用户名')
    .username('username')
    .required('email', '请输入邮箱')
    .email('email')
    .required('password', '请输入密码')
    .password('password')
    .required('confirmPassword', '请确认密码')
    .confirmPassword('confirmPassword', 'password')
    .required('agreeToTerms', '请同意服务条款和隐私政策')
    .custom('agreeToTerms', (value) => {
      return value === true
    }, '请同意服务条款和隐私政策')
}

export const createProfileValidator = () => {
  return new Validator()
    .required('username', '请输入用户名')
    .username('username')
    .required('email', '请输入邮箱')
    .email('email')
    .phone('phone')
    .maxLength('bio', 500, '个人简介不能超过500字')
}

export const createPasswordChangeValidator = () => {
  return new Validator()
    .required('currentPassword', '请输入当前密码')
    .required('newPassword', '请输入新密码')
    .password('newPassword')
    .required('confirmPassword', '请确认新密码')
    .confirmPassword('confirmPassword', 'newPassword')
    .custom('newPassword', (value, data) => {
      return value !== data.currentPassword
    }, '新密码不能与当前密码相同')
}

export const createPostValidator = () => {
  return new Validator()
    .required('title', '请输入标题')
    .minLength('title', 5, '标题至少5个字符')
    .maxLength('title', 100, '标题不能超过100个字符')
    .required('content', '请输入内容')
    .minLength('content', 10, '内容至少10个字符')
    .maxLength('content', 10000, '内容不能超过10000个字符')
    .required('category', '请选择分类')
}

export const createCommentValidator = () => {
  return new Validator()
    .required('content', '请输入评论内容')
    .minLength('content', 1, '评论内容不能为空')
    .maxLength('content', 1000, '评论内容不能超过1000个字符')
}

// 快速验证函数
export const quickValidate = {
  // 验证邮箱
  email: (value) => {
    if (!value) return { valid: false, message: '邮箱不能为空' }
    if (!patterns.email.test(value)) return { valid: false, message: '邮箱格式不正确' }
    return { valid: true }
  },
  
  // 验证密码
  password: (value) => {
    if (!value) return { valid: false, message: '密码不能为空' }
    if (value.length < 8) return { valid: false, message: '密码至少8位' }
    if (!patterns.password.test(value)) return { valid: false, message: '密码必须包含大小写字母和数字' }
    return { valid: true }
  },
  
  // 验证用户名
  username: (value) => {
    if (!value) return { valid: false, message: '用户名不能为空' }
    if (!patterns.username.test(value)) return { valid: false, message: '用户名格式不正确' }
    return { valid: true }
  },
  
  // 验证手机号
  phone: (value) => {
    if (!value) return { valid: false, message: '手机号不能为空' }
    if (!patterns.phone.test(value)) return { valid: false, message: '手机号格式不正确' }
    return { valid: true }
  },
  
  // 验证必填项
  required: (value, fieldName = '此字段') => {
    if (Array.isArray(value)) {
      if (value.length === 0) return { valid: false, message: `${fieldName}不能为空` }
    } else if (typeof value === 'string') {
      if (value.trim().length === 0) return { valid: false, message: `${fieldName}不能为空` }
    } else if (value === null || value === undefined || value === '') {
      return { valid: false, message: `${fieldName}不能为空` }
    }
    return { valid: true }
  }
}

// Vue 组合式函数
export const useValidator = (validatorFactory) => {
  const validator = validatorFactory ? validatorFactory() : new Validator()
  const errors = ref({})
  const isValid = ref(true)
  
  // 验证单个字段
  const validateField = (field, value, data = {}) => {
    const fieldValid = validator.validateField(field, value, data)
    errors.value = { ...validator.getAllErrors() }
    return fieldValid
  }
  
  // 验证所有字段
  const validate = (data) => {
    const valid = validator.validate(data)
    errors.value = { ...validator.getAllErrors() }
    isValid.value = valid
    return valid
  }
  
  // 获取字段错误
  const getFieldError = (field) => {
    return errors.value[field] && errors.value[field][0]
  }
  
  // 检查字段是否有错误
  const hasFieldError = (field) => {
    return !!(errors.value[field] && errors.value[field].length > 0)
  }
  
  // 清除错误
  const clearErrors = () => {
    validator.clearErrors()
    errors.value = {}
    isValid.value = true
  }
  
  // 清除字段错误
  const clearFieldError = (field) => {
    validator.clearFieldError(field)
    const newErrors = { ...errors.value }
    delete newErrors[field]
    errors.value = newErrors
  }
  
  // 设置字段错误
  const setFieldError = (field, message) => {
    validator.setFieldError(field, message)
    errors.value = { ...validator.getAllErrors() }
    isValid.value = false
  }
  
  return {
    validator,
    errors: readonly(errors),
    isValid: readonly(isValid),
    validateField,
    validate,
    getFieldError,
    hasFieldError,
    clearErrors,
    clearFieldError,
    setFieldError
  }
}

// 表单验证指令
export const vValidate = {
  mounted(el, binding) {
    const { validator, field } = binding.value
    
    el.addEventListener('blur', () => {
      const value = el.value
      validator.validateField(field, value)
    })
    
    el.addEventListener('input', () => {
      // 清除错误状态
      validator.clearFieldError(field)
    })
  }
}

export default Validator