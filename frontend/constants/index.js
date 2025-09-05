// 应用常量定义

// API 相关常量
export const API_CONFIG = {
  BASE_URL: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000
}

// 用户角色
export const USER_ROLES = {
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  USER: 'user',
  GUEST: 'guest'
}

// 用户状态
export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  BANNED: 'banned',
  PENDING: 'pending'
}

// 权限列表
export const PERMISSIONS = {
  // 用户管理
  USER_VIEW: 'user:view',
  USER_CREATE: 'user:create',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',
  
  // 内容管理
  POST_VIEW: 'post:view',
  POST_CREATE: 'post:create',
  POST_UPDATE: 'post:update',
  POST_DELETE: 'post:delete',
  POST_MODERATE: 'post:moderate',
  
  // 测验管理
  QUIZ_VIEW: 'quiz:view',
  QUIZ_CREATE: 'quiz:create',
  QUIZ_UPDATE: 'quiz:update',
  QUIZ_DELETE: 'quiz:delete',
  QUIZ_TAKE: 'quiz:take',
  
  // 知识图谱
  GRAPH_VIEW: 'graph:view',
  GRAPH_EDIT: 'graph:edit',
  GRAPH_ADMIN: 'graph:admin',
  
  // 系统管理
  SYSTEM_CONFIG: 'system:config',
  SYSTEM_MONITOR: 'system:monitor',
  SYSTEM_BACKUP: 'system:backup'
}

// 主题配置
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  AUTO: 'auto'
}

// 语言配置
export const LANGUAGES = {
  ZH_CN: 'zh-CN',
  EN_US: 'en-US'
}

// 页面大小选项
export const PAGE_SIZES = [10, 20, 50, 100]

// 默认分页配置
export const DEFAULT_PAGINATION = {
  page: 1,
  pageSize: 20,
  total: 0
}

// 文件上传配置
export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  CHUNK_SIZE: 1024 * 1024 // 1MB
}

// 测验相关常量
export const QUIZ_CONFIG = {
  // 题目类型
  QUESTION_TYPES: {
    SINGLE_CHOICE: 'single_choice',
    MULTIPLE_CHOICE: 'multiple_choice',
    TRUE_FALSE: 'true_false',
    FILL_BLANK: 'fill_blank',
    ESSAY: 'essay'
  },
  
  // 难度等级
  DIFFICULTY_LEVELS: {
    EASY: 'easy',
    MEDIUM: 'medium',
    HARD: 'hard'
  },
  
  // 测验状态
  QUIZ_STATUS: {
    DRAFT: 'draft',
    PUBLISHED: 'published',
    ARCHIVED: 'archived'
  },
  
  // 答题状态
  ATTEMPT_STATUS: {
    NOT_STARTED: 'not_started',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    EXPIRED: 'expired'
  },
  
  // 默认配置
  DEFAULT_TIME_LIMIT: 60, // 分钟
  DEFAULT_PASS_SCORE: 60, // 百分比
  MAX_ATTEMPTS: 3
}

// 测验难度映射
export const QUIZ_DIFFICULTY = {
  beginner: { label: '初级', value: 'beginner' },
  intermediate: { label: '中级', value: 'intermediate' },
  advanced: { label: '高级', value: 'advanced' },
  easy: { label: '简单', value: 'easy' },
  medium: { label: '中等', value: 'medium' },
  hard: { label: '困难', value: 'hard' }
}

// 社区相关常量
export const COMMUNITY_CONFIG = {
  // 帖子类型
  POST_TYPES: {
    DISCUSSION: 'discussion',
    QUESTION: 'question',
    ANNOUNCEMENT: 'announcement',
    TUTORIAL: 'tutorial'
  },
  
  // 帖子状态
  POST_STATUS: {
    DRAFT: 'draft',
    PUBLISHED: 'published',
    HIDDEN: 'hidden',
    DELETED: 'deleted'
  },
  
  // 评论状态
  COMMENT_STATUS: {
    VISIBLE: 'visible',
    HIDDEN: 'hidden',
    DELETED: 'deleted'
  },
  
  // 排序选项
  SORT_OPTIONS: {
    LATEST: 'latest',
    POPULAR: 'popular',
    MOST_LIKED: 'most_liked',
    MOST_VIEWED: 'most_viewed'
  },
  
  // 帖子分类
  CATEGORIES: {
    FRAUD_DETECTION: 'fraud_detection',
    RISK_MANAGEMENT: 'risk_management',
    CASE_STUDY: 'case_study',
    TECHNOLOGY: 'technology',
    REGULATION: 'regulation',
    GENERAL: 'general'
  }
}

// 导出单独的社区常量以便于导入
export const COMMUNITY_CATEGORIES = [
  { value: 'fraud_detection', label: '欺诈检测' },
  { value: 'risk_management', label: '风险管理' },
  { value: 'case_study', label: '案例分析' },
  { value: 'technology', label: '技术讨论' },
  { value: 'regulation', label: '法规政策' },
  { value: 'general', label: '综合讨论' }
]

export const COMMUNITY_SORT_OPTIONS = [
  { value: 'latest', label: '最新发布' },
  { value: 'popular', label: '热门讨论' },
  { value: 'most_liked', label: '最多点赞' },
  { value: 'most_viewed', label: '最多浏览' }
]

// 知识图谱相关常量
export const GRAPH_CONFIG = {
  // 节点类型
  NODE_TYPES: {
    PERSON: 'person',
    ORGANIZATION: 'organization',
    ACCOUNT: 'account',
    TRANSACTION: 'transaction',
    DEVICE: 'device',
    IP_ADDRESS: 'ip_address',
    PHONE: 'phone',
    EMAIL: 'email'
  },
  
  // 关系类型
  RELATIONSHIP_TYPES: {
    OWNS: 'owns',
    TRANSFERS_TO: 'transfers_to',
    CONNECTS_TO: 'connects_to',
    SIMILAR_TO: 'similar_to',
    RELATED_TO: 'related_to'
  },

  // 分析类型
  ANALYSIS_TYPES: {
    FRAUD_DETECTION: 'fraud_detection',
    RISK_ASSESSMENT: 'risk_assessment',
    PATTERN_ANALYSIS: 'pattern_analysis',
    NETWORK_ANALYSIS: 'network_analysis',
    ANOMALY_DETECTION: 'anomaly_detection'
  },
  
  // 布局类型
  LAYOUT_TYPES: {
    FORCE: 'force',
    CIRCULAR: 'circular',
    GRID: 'grid',
    HIERARCHICAL: 'hierarchical'
  },
  
  // 可视化配置
  VISUALIZATION: {
    MIN_NODE_SIZE: 10,
    MAX_NODE_SIZE: 50,
    MIN_LINK_WIDTH: 1,
    MAX_LINK_WIDTH: 10,
    SIMULATION_STRENGTH: -300,
    LINK_DISTANCE: 100
  }
}

// 通知类型
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error'
}

// 通知持续时间
export const NOTIFICATION_DURATION = {
  SHORT: 3000,
  MEDIUM: 5000,
  LONG: 8000,
  PERMANENT: 0
}

// 兼容性导出（复数形式）
export const NOTIFICATION_DURATIONS = NOTIFICATION_DURATION

// 动画持续时间
export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500
}

// 响应式断点
export const BREAKPOINTS = {
  XS: 480,
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  XXL: 1536
}

// 颜色配置
export const COLORS = {
  PRIMARY: '#3b82f6',
  SECONDARY: '#6b7280',
  SUCCESS: '#10b981',
  WARNING: '#f59e0b',
  ERROR: '#ef4444',
  INFO: '#06b6d4'
}

// 图标配置
export const ICONS = {
  // 导航图标
  DASHBOARD: 'mdi:view-dashboard',
  GRAPH: 'mdi:graph',
  QUIZ: 'mdi:quiz',
  COMMUNITY: 'mdi:forum',
  PROFILE: 'mdi:account',
  SETTINGS: 'mdi:cog',
  
  // 操作图标
  ADD: 'mdi:plus',
  EDIT: 'mdi:pencil',
  DELETE: 'mdi:delete',
  SAVE: 'mdi:content-save',
  CANCEL: 'mdi:close',
  SEARCH: 'mdi:magnify',
  FILTER: 'mdi:filter',
  SORT: 'mdi:sort',
  REFRESH: 'mdi:refresh',
  
  // 状态图标
  SUCCESS: 'mdi:check-circle',
  WARNING: 'mdi:alert-circle',
  ERROR: 'mdi:close-circle',
  INFO: 'mdi:information',
  LOADING: 'mdi:loading',
  
  // 文件图标
  FILE: 'mdi:file',
  IMAGE: 'mdi:image',
  PDF: 'mdi:file-pdf',
  WORD: 'mdi:file-word',
  EXCEL: 'mdi:file-excel',
  
  // 社交图标
  LIKE: 'mdi:heart',
  COMMENT: 'mdi:comment',
  SHARE: 'mdi:share',
  BOOKMARK: 'mdi:bookmark',
  
  // 用户图标
  USER: 'mdi:account',
  USERS: 'mdi:account-group',
  LOGIN: 'mdi:login',
  LOGOUT: 'mdi:logout',
  REGISTER: 'mdi:account-plus'
}

// 路由名称
export const ROUTE_NAMES = {
  HOME: 'index',
  LOGIN: 'auth-login',
  REGISTER: 'auth-register',
  DASHBOARD: 'dashboard',
  GRAPH: 'graph',
  QUIZ: 'quiz',
  QUIZ_DETAIL: 'quiz-id',
  QUIZ_START: 'quiz-id-start',
  QUIZ_RESULTS: 'quiz-id-results',
  COMMUNITY: 'community',
  COMMUNITY_POST: 'community-id',
  PROFILE: 'profile',
  PROFILE_SETTINGS: 'profile-settings'
}

// 本地存储键名
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_INFO: 'user_info',
  THEME: 'theme',
  LANGUAGE: 'language',
  SIDEBAR_COLLAPSED: 'sidebar_collapsed'
}

// 错误代码
export const ERROR_CODES = {
  // 网络错误
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
  
  // 认证错误
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  
  // 验证错误
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  
  // 业务错误
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  RESOURCE_CONFLICT: 'RESOURCE_CONFLICT',
  OPERATION_FAILED: 'OPERATION_FAILED',
  
  // 服务器错误
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE'
}

// 正则表达式
export const REGEX_PATTERNS = {
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  PHONE: /^1[3-9]\d{9}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
  USERNAME: /^[a-zA-Z0-9_]{3,20}$/,
  URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  ID_CARD: /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/
}

// 默认配置
export const DEFAULT_CONFIG = {
  // 分页
  PAGINATION: DEFAULT_PAGINATION,
  
  // 表格
  TABLE: {
    pageSize: 20,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: true
  },
  
  // 表单
  FORM: {
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
    validateTrigger: 'blur'
  },
  
  // 上传
  UPLOAD: UPLOAD_CONFIG,
  
  // 编辑器
  EDITOR: {
    height: 300,
    toolbar: [
      'bold', 'italic', 'underline', 'strikethrough',
      'heading', 'quote', 'unordered-list', 'ordered-list',
      'link', 'image', 'code', 'table'
    ]
  }
}

// 菜单配置
export const MENU_CONFIG = {
  MAIN_MENU: [
    {
      key: 'dashboard',
      title: '仪表板',
      icon: ICONS.DASHBOARD,
      path: '/dashboard'
    },
    {
      key: 'graph',
      title: '知识图谱',
      icon: ICONS.GRAPH,
      path: '/graph'
    },
    {
      key: 'quiz',
      title: '测验系统',
      icon: ICONS.QUIZ,
      path: '/quiz'
    },
    {
      key: 'community',
      title: '社区讨论',
      icon: ICONS.COMMUNITY,
      path: '/community'
    }
  ],
  
  USER_MENU: [
    {
      key: 'profile',
      title: '个人中心',
      icon: ICONS.PROFILE,
      path: '/profile'
    },
    {
      key: 'settings',
      title: '设置',
      icon: ICONS.SETTINGS,
      path: '/profile/settings'
    }
  ]
}

// 统计图表配置
export const CHART_CONFIG = {
  COLORS: {
    PRIMARY: ['#3b82f6', '#1d4ed8', '#1e40af'],
    SUCCESS: ['#10b981', '#059669', '#047857'],
    WARNING: ['#f59e0b', '#d97706', '#b45309'],
    ERROR: ['#ef4444', '#dc2626', '#b91c1c']
  },
  
  GRID: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  
  TOOLTIP: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross',
      label: {
        backgroundColor: '#6a7985'
      }
    }
  }
}

// 成就类型常量
export const ACHIEVEMENT_TYPES = {
  LEARNING: 'learning',
  QUIZ: 'quiz',
  COMMUNITY: 'community',
  STREAK: 'streak',
  MILESTONE: 'milestone'
}

// 成就等级
export const ACHIEVEMENT_LEVELS = {
  BRONZE: 'bronze',
  SILVER: 'silver',
  GOLD: 'gold',
  PLATINUM: 'platinum'
}

// 单独导出图谱相关常量
export const GRAPH_NODE_TYPES = GRAPH_CONFIG.NODE_TYPES
export const GRAPH_RELATIONSHIP_TYPES = GRAPH_CONFIG.RELATIONSHIP_TYPES
export const GRAPH_ANALYSIS_TYPES = GRAPH_CONFIG.ANALYSIS_TYPES

// 导出所有常量
export default {
  API_CONFIG,
  USER_ROLES,
  USER_STATUS,
  PERMISSIONS,
  THEMES,
  LANGUAGES,
  PAGE_SIZES,
  DEFAULT_PAGINATION,
  UPLOAD_CONFIG,
  QUIZ_CONFIG,
  COMMUNITY_CONFIG,
  GRAPH_CONFIG,
  NOTIFICATION_TYPES,
  NOTIFICATION_DURATION,
  ANIMATION_DURATION,
  BREAKPOINTS,
  COLORS,
  ICONS,
  ROUTE_NAMES,
  STORAGE_KEYS,
  ERROR_CODES,
  REGEX_PATTERNS,
  DEFAULT_CONFIG,
  MENU_CONFIG,
  CHART_CONFIG
}