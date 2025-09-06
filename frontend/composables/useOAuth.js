/**
 * OAuth功能管理 Composable
 * 统一管理第三方登录功能的显示/隐藏逻辑
 */
export const useOAuth = () => {
  // 从环境变量获取OAuth功能开关状态
  const isOAuthEnabled = () => {
    const config = useRuntimeConfig()
    // 检查环境变量，默认为false（禁用）
    // 在客户端只使用 config.public.enableOAuthLogin
    return config.public.enableOAuthLogin === true
  }

  // 获取可用的OAuth平台列表
  const getAvailableOAuthPlatforms = () => {
    if (!isOAuthEnabled()) {
      return []
    }
    
    // 返回所有支持的OAuth平台
    return [
      {
        name: 'qq',
        displayName: 'QQ登录',
        icon: 'fab fa-qq',
        color: '#1296db'
      },
      {
        name: 'wechat',
        displayName: '微信登录',
        icon: 'fab fa-weixin',
        color: '#07c160'
      },
      {
        name: 'douyin',
        displayName: '抖音登录',
        icon: 'fab fa-tiktok',
        color: '#fe2c55'
      },
      {
        name: 'alipay',
        displayName: '支付宝登录',
        icon: 'fab fa-alipay',
        color: '#1677ff'
      }
    ]
  }

  // 检查是否应该显示OAuth相关UI组件
  const shouldShowOAuthUI = () => {
    return isOAuthEnabled()
  }

  // 检查是否应该显示OAuth分割线
  const shouldShowOAuthDivider = () => {
    return isOAuthEnabled() && getAvailableOAuthPlatforms().length > 0
  }

  // 获取用户头像的默认策略
  const getDefaultAvatarStrategy = () => {
    if (isOAuthEnabled()) {
      return 'oauth_or_default' // 优先使用OAuth头像，否则使用默认头像
    }
    return 'default_only' // 仅使用默认头像
  }

  // 处理用户头像显示逻辑
  const getUserAvatarUrl = (user) => {
    if (!user) return '/default-avatar.svg'
    
    // 如果OAuth功能关闭，只使用本地上传的头像或默认头像
    if (!isOAuthEnabled()) {
      return user.avatar || '/default-avatar.svg'
    }
    
    // OAuth功能开启时，优先使用第三方头像，然后是本地头像，最后是默认头像
    return user.avatar_url || user.avatar || '/default-avatar.svg'
  }

  // 检查用户是否需要完善头像信息
  const shouldPromptAvatarUpload = (user) => {
    if (!user) return false
    
    // 如果OAuth功能关闭且用户没有本地头像，提示上传
    if (!isOAuthEnabled()) {
      return !user.avatar
    }
    
    // OAuth功能开启时，如果既没有第三方头像也没有本地头像，提示上传
    return !user.avatar_url && !user.avatar
  }

  // 处理OAuth登录
  const handleOAuthLogin = (platform) => {
    if (!isOAuthEnabled()) {
      console.warn('OAuth功能已禁用')
      return
    }
    
    // 执行OAuth登录逻辑
    const { $router } = useNuxtApp()
    $router.push(`/auth/oauth/${platform}`)
  }

  return {
    isOAuthEnabled,
    shouldShowOAuthUI,
    shouldShowOAuthDivider,
    getAvailableOAuthPlatforms,
    getDefaultAvatarStrategy,
    getUserAvatarUrl,
    shouldPromptAvatarUpload,
    handleOAuthLogin
  }
}