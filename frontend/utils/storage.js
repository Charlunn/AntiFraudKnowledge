// 存储工具 - 提供localStorage和sessionStorage的封装

// 存储类型枚举
export const StorageType = {
  LOCAL: 'localStorage',
  SESSION: 'sessionStorage'
}

// 存储键名常量
export const StorageKeys = {
  // 用户相关
  USER_TOKEN: 'user_token',
  USER_INFO: 'user_info',
  USER_PREFERENCES: 'user_preferences',
  USER_SETTINGS: 'user_settings',
  
  // 应用状态
  THEME: 'app_theme',
  LANGUAGE: 'app_language',
  SIDEBAR_COLLAPSED: 'sidebar_collapsed',
  
  // 缓存数据
  GRAPH_DATA: 'graph_data',
  QUIZ_PROGRESS: 'quiz_progress',
  SEARCH_HISTORY: 'search_history',
  
  // 临时数据
  FORM_DRAFT: 'form_draft',
  LAST_ROUTE: 'last_route',
  SESSION_ID: 'session_id'
}

// 存储工具类
class StorageManager {
  constructor(type = StorageType.LOCAL) {
    this.type = type
    this.storage = this.getStorage()
    this.prefix = 'antifraud_'
  }
  
  // 获取存储对象
  getStorage() {
    if (typeof window === 'undefined') {
      // 服务端渲染时返回模拟对象
      return {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
        clear: () => {},
        length: 0,
        key: () => null
      }
    }
    
    try {
      const storage = window[this.type]
      // 测试存储是否可用
      const testKey = '__storage_test__'
      storage.setItem(testKey, 'test')
      storage.removeItem(testKey)
      return storage
    } catch (error) {
      console.warn(`${this.type} is not available:`, error)
      // 返回内存存储作为降级方案
      return this.createMemoryStorage()
    }
  }
  
  // 创建内存存储（降级方案）
  createMemoryStorage() {
    const memoryStorage = new Map()
    
    return {
      getItem: (key) => memoryStorage.get(key) || null,
      setItem: (key, value) => memoryStorage.set(key, value),
      removeItem: (key) => memoryStorage.delete(key),
      clear: () => memoryStorage.clear(),
      get length() { return memoryStorage.size },
      key: (index) => {
        const keys = Array.from(memoryStorage.keys())
        return keys[index] || null
      }
    }
  }
  
  // 生成完整的键名
  getFullKey(key) {
    return `${this.prefix}${key}`
  }
  
  // 设置数据
  set(key, value, options = {}) {
    try {
      const fullKey = this.getFullKey(key)
      const data = {
        value,
        timestamp: Date.now(),
        ...options
      }
      
      // 如果设置了过期时间
      if (options.expires) {
        data.expires = Date.now() + options.expires
      }
      
      const serializedData = JSON.stringify(data)
      this.storage.setItem(fullKey, serializedData)
      
      return true
    } catch (error) {
      console.error('Storage set error:', error)
      return false
    }
  }
  
  // 获取数据
  get(key, defaultValue = null) {
    try {
      const fullKey = this.getFullKey(key)
      const serializedData = this.storage.getItem(fullKey)
      
      if (!serializedData) {
        return defaultValue
      }
      
      const data = JSON.parse(serializedData)
      
      // 检查是否过期
      if (data.expires && Date.now() > data.expires) {
        this.remove(key)
        return defaultValue
      }
      
      return data.value
    } catch (error) {
      console.error('Storage get error:', error)
      return defaultValue
    }
  }
  
  // 移除数据
  remove(key) {
    try {
      const fullKey = this.getFullKey(key)
      this.storage.removeItem(fullKey)
      return true
    } catch (error) {
      console.error('Storage remove error:', error)
      return false
    }
  }
  
  // 检查键是否存在
  has(key) {
    try {
      const fullKey = this.getFullKey(key)
      const data = this.storage.getItem(fullKey)
      
      if (!data) return false
      
      // 检查是否过期
      const parsedData = JSON.parse(data)
      if (parsedData.expires && Date.now() > parsedData.expires) {
        this.remove(key)
        return false
      }
      
      return true
    } catch (error) {
      return false
    }
  }
  
  // 获取所有键
  keys() {
    try {
      const keys = []
      const prefixLength = this.prefix.length
      
      for (let i = 0; i < this.storage.length; i++) {
        const key = this.storage.key(i)
        if (key && key.startsWith(this.prefix)) {
          keys.push(key.substring(prefixLength))
        }
      }
      
      return keys
    } catch (error) {
      console.error('Storage keys error:', error)
      return []
    }
  }
  
  // 获取所有数据
  getAll() {
    try {
      const data = {}
      const keys = this.keys()
      
      keys.forEach(key => {
        data[key] = this.get(key)
      })
      
      return data
    } catch (error) {
      console.error('Storage getAll error:', error)
      return {}
    }
  }
  
  // 清空所有数据
  clear() {
    try {
      const keys = this.keys()
      keys.forEach(key => this.remove(key))
      return true
    } catch (error) {
      console.error('Storage clear error:', error)
      return false
    }
  }
  
  // 获取存储大小（字节）
  getSize() {
    try {
      let size = 0
      const keys = this.keys()
      
      keys.forEach(key => {
        const fullKey = this.getFullKey(key)
        const data = this.storage.getItem(fullKey)
        if (data) {
          size += data.length
        }
      })
      
      return size
    } catch (error) {
      console.error('Storage getSize error:', error)
      return 0
    }
  }
  
  // 清理过期数据
  cleanup() {
    try {
      const keys = this.keys()
      let cleanedCount = 0
      
      keys.forEach(key => {
        const fullKey = this.getFullKey(key)
        const serializedData = this.storage.getItem(fullKey)
        
        if (serializedData) {
          try {
            const data = JSON.parse(serializedData)
            if (data.expires && Date.now() > data.expires) {
              this.remove(key)
              cleanedCount++
            }
          } catch (parseError) {
            // 如果数据格式错误，也删除
            this.remove(key)
            cleanedCount++
          }
        }
      })
      
      return cleanedCount
    } catch (error) {
      console.error('Storage cleanup error:', error)
      return 0
    }
  }
  
  // 导出数据
  export() {
    try {
      const data = this.getAll()
      return JSON.stringify(data, null, 2)
    } catch (error) {
      console.error('Storage export error:', error)
      return null
    }
  }
  
  // 导入数据
  import(jsonData, options = {}) {
    try {
      const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData
      const { overwrite = false, prefix = '' } = options
      
      let importedCount = 0
      
      Object.entries(data).forEach(([key, value]) => {
        const finalKey = prefix ? `${prefix}_${key}` : key
        
        if (!overwrite && this.has(finalKey)) {
          return // 跳过已存在的键
        }
        
        if (this.set(finalKey, value)) {
          importedCount++
        }
      })
      
      return importedCount
    } catch (error) {
      console.error('Storage import error:', error)
      return 0
    }
  }
}

// 创建存储实例
export const localStorage = new StorageManager(StorageType.LOCAL)
export const sessionStorage = new StorageManager(StorageType.SESSION)

// 便捷函数
export const storage = {
  // 本地存储
  local: {
    set: (key, value, options) => localStorage.set(key, value, options),
    get: (key, defaultValue) => localStorage.get(key, defaultValue),
    remove: (key) => localStorage.remove(key),
    has: (key) => localStorage.has(key),
    clear: () => localStorage.clear(),
    keys: () => localStorage.keys(),
    getAll: () => localStorage.getAll(),
    getSize: () => localStorage.getSize(),
    cleanup: () => localStorage.cleanup()
  },
  
  // 会话存储
  session: {
    set: (key, value, options) => sessionStorage.set(key, value, options),
    get: (key, defaultValue) => sessionStorage.get(key, defaultValue),
    remove: (key) => sessionStorage.remove(key),
    has: (key) => sessionStorage.has(key),
    clear: () => sessionStorage.clear(),
    keys: () => sessionStorage.keys(),
    getAll: () => sessionStorage.getAll(),
    getSize: () => sessionStorage.getSize(),
    cleanup: () => sessionStorage.cleanup()
  }
}

// 特定功能的存储工具
export const userStorage = {
  // 保存用户令牌
  setToken: (token, expires = 7 * 24 * 60 * 60 * 1000) => {
    return storage.local.set(StorageKeys.USER_TOKEN, token, { expires })
  },
  
  // 获取用户令牌
  getToken: () => {
    return storage.local.get(StorageKeys.USER_TOKEN)
  },
  
  // 移除用户令牌
  removeToken: () => {
    return storage.local.remove(StorageKeys.USER_TOKEN)
  },
  
  // 保存用户信息
  setUserInfo: (userInfo) => {
    return storage.local.set(StorageKeys.USER_INFO, userInfo)
  },
  
  // 获取用户信息
  getUserInfo: () => {
    return storage.local.get(StorageKeys.USER_INFO)
  },
  
  // 移除用户信息
  removeUserInfo: () => {
    return storage.local.remove(StorageKeys.USER_INFO)
  },
  
  // 保存用户偏好设置
  setPreferences: (preferences) => {
    return storage.local.set(StorageKeys.USER_PREFERENCES, preferences)
  },
  
  // 获取用户偏好设置
  getPreferences: () => {
    return storage.local.get(StorageKeys.USER_PREFERENCES, {})
  },
  
  // 清除所有用户数据
  clearUserData: () => {
    userStorage.removeToken()
    userStorage.removeUserInfo()
    storage.local.remove(StorageKeys.USER_PREFERENCES)
    storage.local.remove(StorageKeys.USER_SETTINGS)
  }
}

// 应用设置存储
export const appStorage = {
  // 主题设置
  setTheme: (theme) => {
    return storage.local.set(StorageKeys.THEME, theme)
  },
  
  getTheme: () => {
    return storage.local.get(StorageKeys.THEME, 'light')
  },
  
  // 语言设置
  setLanguage: (language) => {
    return storage.local.set(StorageKeys.LANGUAGE, language)
  },
  
  getLanguage: () => {
    return storage.local.get(StorageKeys.LANGUAGE, 'zh-CN')
  },
  
  // 侧边栏状态
  setSidebarCollapsed: (collapsed) => {
    return storage.local.set(StorageKeys.SIDEBAR_COLLAPSED, collapsed)
  },
  
  getSidebarCollapsed: () => {
    return storage.local.get(StorageKeys.SIDEBAR_COLLAPSED, false)
  }
}

// 缓存存储
export const cacheStorage = {
  // 图谱数据缓存
  setGraphData: (data, expires = 30 * 60 * 1000) => {
    return storage.session.set(StorageKeys.GRAPH_DATA, data, { expires })
  },
  
  getGraphData: () => {
    return storage.session.get(StorageKeys.GRAPH_DATA)
  },
  
  // 测验进度缓存
  setQuizProgress: (quizId, progress) => {
    const key = `${StorageKeys.QUIZ_PROGRESS}_${quizId}`
    return storage.local.set(key, progress, { expires: 24 * 60 * 60 * 1000 })
  },
  
  getQuizProgress: (quizId) => {
    const key = `${StorageKeys.QUIZ_PROGRESS}_${quizId}`
    return storage.local.get(key)
  },
  
  removeQuizProgress: (quizId) => {
    const key = `${StorageKeys.QUIZ_PROGRESS}_${quizId}`
    return storage.local.remove(key)
  },
  
  // 搜索历史
  addSearchHistory: (query, maxHistory = 10) => {
    const history = storage.local.get(StorageKeys.SEARCH_HISTORY, [])
    
    // 移除重复项
    const filteredHistory = history.filter(item => item !== query)
    
    // 添加到开头
    filteredHistory.unshift(query)
    
    // 限制数量
    const limitedHistory = filteredHistory.slice(0, maxHistory)
    
    return storage.local.set(StorageKeys.SEARCH_HISTORY, limitedHistory)
  },
  
  getSearchHistory: () => {
    return storage.local.get(StorageKeys.SEARCH_HISTORY, [])
  },
  
  clearSearchHistory: () => {
    return storage.local.remove(StorageKeys.SEARCH_HISTORY)
  }
}

// 表单草稿存储
export const draftStorage = {
  // 保存表单草稿
  saveDraft: (formId, data) => {
    const key = `${StorageKeys.FORM_DRAFT}_${formId}`
    return storage.local.set(key, data, { expires: 7 * 24 * 60 * 60 * 1000 })
  },
  
  // 获取表单草稿
  getDraft: (formId) => {
    const key = `${StorageKeys.FORM_DRAFT}_${formId}`
    return storage.local.get(key)
  },
  
  // 删除表单草稿
  removeDraft: (formId) => {
    const key = `${StorageKeys.FORM_DRAFT}_${formId}`
    return storage.local.remove(key)
  },
  
  // 获取所有草稿
  getAllDrafts: () => {
    const keys = storage.local.keys()
    const draftKeys = keys.filter(key => key.startsWith(StorageKeys.FORM_DRAFT))
    const drafts = {}
    
    draftKeys.forEach(key => {
      const formId = key.replace(`${StorageKeys.FORM_DRAFT}_`, '')
      drafts[formId] = storage.local.get(key)
    })
    
    return drafts
  },
  
  // 清除所有草稿
  clearAllDrafts: () => {
    const keys = storage.local.keys()
    const draftKeys = keys.filter(key => key.startsWith(StorageKeys.FORM_DRAFT))
    
    draftKeys.forEach(key => {
      storage.local.remove(key.replace(`${storage.local.prefix}`, ''))
    })
  }
}

// Vue 组合式函数
export const useStorage = (key, defaultValue = null, storageType = 'local') => {
  const storageInstance = storageType === 'session' ? storage.session : storage.local
  
  const storedValue = ref(storageInstance.get(key, defaultValue))
  
  const setValue = (value, options) => {
    storedValue.value = value
    storageInstance.set(key, value, options)
  }
  
  const removeValue = () => {
    storedValue.value = defaultValue
    storageInstance.remove(key)
  }
  
  // 监听值的变化并自动保存
  watch(storedValue, (newValue) => {
    if (newValue !== defaultValue) {
      storageInstance.set(key, newValue)
    }
  }, { deep: true })
  
  return {
    value: storedValue,
    setValue,
    removeValue
  }
}

// 自动清理过期数据（在应用启动时调用）
export const initStorageCleanup = () => {
  try {
    // 清理本地存储
    const localCleaned = localStorage.cleanup()
    
    // 清理会话存储
    const sessionCleaned = sessionStorage.cleanup()
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`Storage cleanup completed: ${localCleaned + sessionCleaned} expired items removed`)
    }
  } catch (error) {
    console.error('Storage cleanup error:', error)
  }
}

export default storage