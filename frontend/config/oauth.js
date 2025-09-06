// 第三方OAuth登录配置
// 注意：这些配置应该根据实际申请的应用信息进行修改

// OAuth功能开关检查
const isOAuthEnabled = () => {
  return process.env.ENABLE_OAUTH_LOGIN === 'true'
}

export const OAUTH_CONFIG = {
  // QQ登录配置
  QQ: {
    APP_ID: process.env.NUXT_QQ_APP_ID || 'demo_qq_app_id', // 需要在 https://connect.qq.com/ 申请
    APP_KEY: '你的QQ应用密钥', // 仅后端使用，前端不需要
    REDIRECT_URI: '/auth/qq/callback',
    SCOPE: 'get_user_info',
    AUTH_URL: 'https://graph.qq.com/oauth2.0/authorize'
  },
  
  // 微信登录配置
  WECHAT: {
    APP_ID: process.env.NUXT_WECHAT_APP_ID || 'demo_wechat_app_id', // 需要在 https://open.weixin.qq.com/ 申请
    APP_SECRET: '你的微信应用密钥', // 仅后端使用，前端不需要
    REDIRECT_URI: '/auth/wechat/callback',
    SCOPE: 'snsapi_login',
    AUTH_URL: 'https://open.weixin.qq.com/connect/qrconnect'
  },
  
  // 抖音登录配置
  DOUYIN: {
    APP_ID: process.env.NUXT_DOUYIN_APP_ID || 'demo_douyin_app_id', // 需要在 https://developer.open-douyin.com/ 申请
    APP_SECRET: '你的抖音应用密钥', // 仅后端使用，前端不需要
    REDIRECT_URI: '/auth/douyin/callback',
    SCOPE: 'user_info',
    AUTH_URL: 'https://open.douyin.com/platform/oauth/connect'
  },
  
  // 支付宝登录配置
  ALIPAY: {
    APP_ID: process.env.NUXT_ALIPAY_APP_ID || 'demo_alipay_app_id', // 需要在 https://open.alipay.com/ 申请
    APP_SECRET: '你的支付宝应用密钥', // 仅后端使用，前端不需要
    REDIRECT_URI: '/auth/alipay/callback',
    SCOPE: 'auth_user',
    AUTH_URL: 'https://openauth.alipay.com/oauth2/publicAppAuthorize.htm'
  }
}

// 构建授权URL的辅助函数
export const buildAuthUrl = (provider, baseUrl = window.location.origin) => {
  // 检查OAuth功能是否启用
  if (!isOAuthEnabled()) {
    throw new Error('OAuth功能当前已禁用')
  }
  
  const config = OAUTH_CONFIG[provider.toUpperCase()]
  if (!config) {
    throw new Error(`不支持的OAuth提供商: ${provider}`)
  }
  
  const redirectUri = encodeURIComponent(`${baseUrl}${config.REDIRECT_URI}`)
  const state = `${provider}_login_${Date.now()}`
  
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: config.APP_ID,
    redirect_uri: redirectUri,
    scope: config.SCOPE,
    state: state
  })
  
  if (provider.toUpperCase() === 'WECHAT') {
    // 微信登录需要特殊的参数名
    params.delete('client_id')
    params.set('appid', config.APP_ID)
  } else if (provider.toUpperCase() === 'DOUYIN') {
    // 抖音登录需要特殊的参数名
    params.delete('client_id')
    params.set('client_key', config.APP_ID)
  } else if (provider.toUpperCase() === 'ALIPAY') {
    // 支付宝登录需要特殊的参数名
    params.delete('response_type')
    params.delete('client_id')
    params.set('app_id', config.APP_ID)
  }
  
  return `${config.AUTH_URL}?${params.toString()}`
}

// 导出OAuth功能开关检查函数
export { isOAuthEnabled }

// 开发环境提示
if (process.env.NODE_ENV === 'development') {
  if (isOAuthEnabled()) {
    console.warn('⚠️  请配置正确的OAuth应用ID和密钥')
    console.info('📝 QQ开放平台: https://connect.qq.com/')
    console.info('📝 微信开放平台: https://open.weixin.qq.com/')
    console.info('📝 抖音开放平台: https://developer.open-douyin.com/')
    console.info('📝 支付宝开放平台: https://open.alipay.com/')
  } else {
    console.info('ℹ️  OAuth功能已禁用 (ENABLE_OAUTH_LOGIN=false)')
  }
}