// 格式化工具 - 提供日期、数字、文本等格式化功能

// 日期格式化
export const formatDate = {
  // 格式化为 YYYY-MM-DD
  toDateString: (date) => {
    if (!date) return ''
    const d = new Date(date)
    if (isNaN(d.getTime())) return ''
    
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    
    return `${year}-${month}-${day}`
  },
  
  // 格式化为 YYYY-MM-DD HH:mm:ss
  toDateTimeString: (date) => {
    if (!date) return ''
    const d = new Date(date)
    if (isNaN(d.getTime())) return ''
    
    const dateStr = formatDate.toDateString(date)
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    const seconds = String(d.getSeconds()).padStart(2, '0')
    
    return `${dateStr} ${hours}:${minutes}:${seconds}`
  },
  
  // 格式化为 HH:mm
  toTimeString: (date) => {
    if (!date) return ''
    const d = new Date(date)
    if (isNaN(d.getTime())) return ''
    
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    
    return `${hours}:${minutes}`
  },
  
  // 相对时间格式化（如：刚刚、5分钟前、2小时前）
  toRelativeTime: (date) => {
    if (!date) return ''
    const d = new Date(date)
    if (isNaN(d.getTime())) return ''
    
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    const months = Math.floor(days / 30)
    const years = Math.floor(days / 365)
    
    if (seconds < 60) return '刚刚'
    if (minutes < 60) return `${minutes}分钟前`
    if (hours < 24) return `${hours}小时前`
    if (days < 30) return `${days}天前`
    if (months < 12) return `${months}个月前`
    return `${years}年前`
  },
  
  // 友好的日期格式（如：今天、昨天、明天）
  toFriendlyDate: (date) => {
    if (!date) return ''
    const d = new Date(date)
    if (isNaN(d.getTime())) return ''
    
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(today.getDate() - 1)
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)
    
    const dateStr = formatDate.toDateString(date)
    const todayStr = formatDate.toDateString(today)
    const yesterdayStr = formatDate.toDateString(yesterday)
    const tomorrowStr = formatDate.toDateString(tomorrow)
    
    if (dateStr === todayStr) return '今天'
    if (dateStr === yesterdayStr) return '昨天'
    if (dateStr === tomorrowStr) return '明天'
    
    // 如果是本年，不显示年份
    if (d.getFullYear() === today.getFullYear()) {
      const month = d.getMonth() + 1
      const day = d.getDate()
      return `${month}月${day}日`
    }
    
    return dateStr
  },
  
  // 格式化为中文日期
  toChineseDate: (date) => {
    if (!date) return ''
    const d = new Date(date)
    if (isNaN(d.getTime())) return ''
    
    const year = d.getFullYear()
    const month = d.getMonth() + 1
    const day = d.getDate()
    
    return `${year}年${month}月${day}日`
  },
  
  // 格式化持续时间（秒转换为时分秒）
  toDuration: (seconds) => {
    if (typeof seconds !== 'number' || seconds < 0) return '0秒'
    
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    
    if (hours > 0) {
      return `${hours}小时${minutes}分钟${secs}秒`
    } else if (minutes > 0) {
      return `${minutes}分钟${secs}秒`
    } else {
      return `${secs}秒`
    }
  },
  
  // 格式化为简短持续时间（如：1h 30m）
  toShortDuration: (seconds) => {
    if (typeof seconds !== 'number' || seconds < 0) return '0s'
    
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    
    if (hours > 0) {
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`
    } else if (minutes > 0) {
      return secs > 0 ? `${minutes}m ${secs}s` : `${minutes}m`
    } else {
      return `${secs}s`
    }
  }
}

// 数字格式化
export const formatNumber = {
  // 千分位分隔符
  toThousands: (num, decimals = 0) => {
    if (typeof num !== 'number') return '0'
    
    return num.toLocaleString('zh-CN', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    })
  },
  
  // 格式化为百分比
  toPercent: (num, decimals = 1) => {
    if (typeof num !== 'number') return '0%'
    
    return `${(num * 100).toFixed(decimals)}%`
  },
  
  // 格式化文件大小
  toFileSize: (bytes) => {
    if (typeof bytes !== 'number' || bytes < 0) return '0 B'
    
    const units = ['B', 'KB', 'MB', 'GB', 'TB']
    let size = bytes
    let unitIndex = 0
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }
    
    return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`
  },
  
  // 格式化为货币
  toCurrency: (num, currency = 'CNY', decimals = 2) => {
    if (typeof num !== 'number') return '¥0.00'
    
    const formatter = new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    })
    
    return formatter.format(num)
  },
  
  // 格式化为简短数字（如：1.2K、3.4M）
  toShortNumber: (num) => {
    if (typeof num !== 'number') return '0'
    
    const abs = Math.abs(num)
    const sign = num < 0 ? '-' : ''
    
    if (abs >= 1e9) {
      return `${sign}${(abs / 1e9).toFixed(1)}B`
    } else if (abs >= 1e6) {
      return `${sign}${(abs / 1e6).toFixed(1)}M`
    } else if (abs >= 1e3) {
      return `${sign}${(abs / 1e3).toFixed(1)}K`
    } else {
      return `${sign}${abs}`
    }
  },
  
  // 格式化分数
  toScore: (score, total = 100, decimals = 1) => {
    if (typeof score !== 'number' || typeof total !== 'number') return '0/100'
    
    return `${score.toFixed(decimals)}/${total}`
  },
  
  // 格式化为序数（第1、第2）
  toOrdinal: (num) => {
    if (typeof num !== 'number' || num < 1) return ''
    
    return `第${num}`
  }
}

// 文本格式化
export const formatText = {
  // 截断文本
  truncate: (text, length = 100, suffix = '...') => {
    if (typeof text !== 'string') return ''
    if (text.length <= length) return text
    
    return text.substring(0, length) + suffix
  },
  
  // 首字母大写
  capitalize: (text) => {
    if (typeof text !== 'string' || text.length === 0) return ''
    
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
  },
  
  // 每个单词首字母大写
  titleCase: (text) => {
    if (typeof text !== 'string') return ''
    
    return text.replace(/\w\S*/g, (txt) => {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    })
  },
  
  // 转换为驼峰命名
  toCamelCase: (text) => {
    if (typeof text !== 'string') return ''
    
    return text.replace(/[-_\s]+(.)?/g, (_, char) => {
      return char ? char.toUpperCase() : ''
    })
  },
  
  // 转换为短横线命名
  toKebabCase: (text) => {
    if (typeof text !== 'string') return ''
    
    return text
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/[_\s]+/g, '-')
      .toLowerCase()
  },
  
  // 转换为下划线命名
  toSnakeCase: (text) => {
    if (typeof text !== 'string') return ''
    
    return text
      .replace(/([a-z])([A-Z])/g, '$1_$2')
      .replace(/[-\s]+/g, '_')
      .toLowerCase()
  },
  
  // 移除HTML标签
  stripHtml: (html) => {
    if (typeof html !== 'string') return ''
    
    return html.replace(/<[^>]*>/g, '')
  },
  
  // 转义HTML
  escapeHtml: (text) => {
    if (typeof text !== 'string') return ''
    
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }
    
    return text.replace(/[&<>"']/g, (char) => map[char])
  },
  
  // 反转义HTML
  unescapeHtml: (text) => {
    if (typeof text !== 'string') return ''
    
    const map = {
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&quot;': '"',
      '&#39;': "'"
    }
    
    return text.replace(/&(amp|lt|gt|quot|#39);/g, (match) => map[match])
  },
  
  // 格式化手机号（隐藏中间4位）
  maskPhone: (phone) => {
    if (typeof phone !== 'string' || phone.length !== 11) return phone
    
    return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
  },
  
  // 格式化邮箱（隐藏用户名部分）
  maskEmail: (email) => {
    if (typeof email !== 'string' || !email.includes('@')) return email
    
    const [username, domain] = email.split('@')
    if (username.length <= 2) return email
    
    const maskedUsername = username.charAt(0) + '*'.repeat(username.length - 2) + username.charAt(username.length - 1)
    return `${maskedUsername}@${domain}`
  },
  
  // 格式化身份证号（隐藏中间部分）
  maskIdCard: (idCard) => {
    if (typeof idCard !== 'string' || idCard.length !== 18) return idCard
    
    return idCard.replace(/(\d{6})\d{8}(\d{4})/, '$1********$2')
  },
  
  // 高亮搜索关键词
  highlightKeywords: (text, keywords, className = 'highlight') => {
    if (typeof text !== 'string' || !keywords) return text
    
    const keywordArray = Array.isArray(keywords) ? keywords : [keywords]
    let result = text
    
    keywordArray.forEach(keyword => {
      if (keyword && keyword.trim()) {
        const regex = new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
        result = result.replace(regex, `<span class="${className}">$1</span>`)
      }
    })
    
    return result
  },
  
  // 生成摘要
  generateSummary: (text, maxLength = 200) => {
    if (typeof text !== 'string') return ''
    
    // 移除HTML标签
    const cleanText = formatText.stripHtml(text)
    
    // 按句子分割
    const sentences = cleanText.split(/[。！？.!?]/).filter(s => s.trim())
    
    let summary = ''
    for (const sentence of sentences) {
      if (summary.length + sentence.length <= maxLength) {
        summary += sentence + '。'
      } else {
        break
      }
    }
    
    return summary || formatText.truncate(cleanText, maxLength)
  }
}

// 地址格式化
export const formatAddress = {
  // 格式化完整地址
  toFullAddress: (province, city, district, detail) => {
    const parts = [province, city, district, detail].filter(part => part && part.trim())
    return parts.join('')
  },
  
  // 格式化简短地址（省市）
  toShortAddress: (province, city) => {
    const parts = [province, city].filter(part => part && part.trim())
    return parts.join('')
  }
}

// 状态格式化
export const formatStatus = {
  // 格式化用户状态
  userStatus: (status) => {
    const statusMap = {
      'active': '活跃',
      'inactive': '非活跃',
      'banned': '已封禁',
      'pending': '待审核'
    }
    return statusMap[status] || status
  },
  
  // 格式化订单状态
  orderStatus: (status) => {
    const statusMap = {
      'pending': '待支付',
      'paid': '已支付',
      'shipped': '已发货',
      'delivered': '已送达',
      'cancelled': '已取消',
      'refunded': '已退款'
    }
    return statusMap[status] || status
  },
  
  // 格式化测验状态
  quizStatus: (status) => {
    const statusMap = {
      'not_started': '未开始',
      'in_progress': '进行中',
      'completed': '已完成',
      'expired': '已过期'
    }
    return statusMap[status] || status
  }
}

// 颜色格式化
export const formatColor = {
  // 根据分数获取颜色
  getScoreColor: (score, total = 100) => {
    const percentage = (score / total) * 100
    
    if (percentage >= 90) return 'text-green-600'
  if (percentage >= 80) return 'text-primary'
    if (percentage >= 70) return 'text-yellow-600'
    if (percentage >= 60) return 'text-orange-600'
    return 'text-red-600'
  },
  
  // 根据状态获取颜色
  getStatusColor: (status) => {
    const colorMap = {
      'success': 'text-green-600',
      'warning': 'text-yellow-600',
      'error': 'text-red-600',
      'info': 'text-primary',
      'pending': 'text-gray-600',
      'active': 'text-green-600',
      'inactive': 'text-gray-600'
    }
    return colorMap[status] || 'text-gray-600'
  }
}

// 导出所有格式化函数
export const formatters = {
  date: formatDate,
  number: formatNumber,
  text: formatText,
  address: formatAddress,
  status: formatStatus,
  color: formatColor
}

// Vue 过滤器（用于模板中）
export const filters = {
  // 日期过滤器
  date: formatDate.toDateString,
  datetime: formatDate.toDateTimeString,
  time: formatDate.toTimeString,
  relativeTime: formatDate.toRelativeTime,
  friendlyDate: formatDate.toFriendlyDate,
  duration: formatDate.toDuration,
  
  // 数字过滤器
  thousands: formatNumber.toThousands,
  percent: formatNumber.toPercent,
  fileSize: formatNumber.toFileSize,
  currency: formatNumber.toCurrency,
  shortNumber: formatNumber.toShortNumber,
  
  // 文本过滤器
  truncate: formatText.truncate,
  capitalize: formatText.capitalize,
  titleCase: formatText.titleCase,
  maskPhone: formatText.maskPhone,
  maskEmail: formatText.maskEmail
}

export default formatters