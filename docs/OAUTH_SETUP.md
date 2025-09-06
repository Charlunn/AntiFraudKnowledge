# 第三方OAuth登录配置指南

本文档介绍如何配置QQ和微信第三方登录功能。

## 概述

系统支持以下第三方登录方式：
- QQ登录
- 微信登录

## 前置条件

### QQ登录配置

1. 访问 [QQ互联开放平台](https://connect.qq.com/)
2. 注册开发者账号并创建应用
3. 获取以下信息：
   - APP ID
   - APP KEY
4. 配置回调地址：`http://your-domain.com/auth/qq/callback`

### 微信登录配置

1. 访问 [微信开放平台](https://open.weixin.qq.com/)
2. 注册开发者账号并创建网站应用
3. 获取以下信息：
   - AppID
   - AppSecret
4. 配置授权回调域：`your-domain.com`

## 后端配置

### 1. 更新Django设置

在 `backend/KnowledgeBackend/settings.py` 中添加OAuth配置：

```python
# OAuth配置
OAUTH_SETTINGS = {
    'QQ': {
        'APP_ID': os.environ.get('QQ_APP_ID', '你的QQ应用ID'),
        'APP_KEY': os.environ.get('QQ_APP_KEY', '你的QQ应用密钥'),
        'REDIRECT_URI': 'http://localhost:3001/auth/qq/callback',
    },
    'WECHAT': {
        'APP_ID': os.environ.get('WECHAT_APP_ID', '你的微信应用ID'),
        'APP_SECRET': os.environ.get('WECHAT_APP_SECRET', '你的微信应用密钥'),
        'REDIRECT_URI': 'http://localhost:3001/auth/wechat/callback',
    }
}
```

### 2. 环境变量配置

创建 `.env` 文件（如果不存在）并添加：

```bash
# QQ登录配置
QQ_APP_ID=你的QQ应用ID
QQ_APP_KEY=你的QQ应用密钥

# 微信登录配置
WECHAT_APP_ID=你的微信应用ID
WECHAT_APP_SECRET=你的微信应用密钥
```

### 3. 更新第三方OAuth视图

编辑 `backend/users/third_party_oauth.py`，将配置信息替换为实际值：

```python
from django.conf import settings

class QQOAuthLoginView(APIView):
    def post(self, request):
        # 使用settings中的配置
        app_id = settings.OAUTH_SETTINGS['QQ']['APP_ID']
        app_key = settings.OAUTH_SETTINGS['QQ']['APP_KEY']
        # ... 其他代码
```

## 前端配置

### 1. 更新OAuth配置文件

编辑 `frontend/config/oauth.js`：

```javascript
export const OAUTH_CONFIG = {
  QQ: {
    APP_ID: '你的QQ应用ID', // 替换为实际的APP ID
    REDIRECT_URI: '/auth/qq/callback',
    SCOPE: 'get_user_info',
    AUTH_URL: 'https://graph.qq.com/oauth2.0/authorize'
  },
  WECHAT: {
    APP_ID: '你的微信应用ID', // 替换为实际的APP ID
    REDIRECT_URI: '/auth/wechat/callback',
    SCOPE: 'snsapi_login',
    AUTH_URL: 'https://open.weixin.qq.com/connect/qrconnect'
  }
}
```

### 2. 环境变量配置（可选）

在 `frontend/.env` 中添加：

```bash
NUXT_PUBLIC_QQ_APP_ID=你的QQ应用ID
NUXT_PUBLIC_WECHAT_APP_ID=你的微信应用ID
```

然后在配置文件中使用：

```javascript
export const OAUTH_CONFIG = {
  QQ: {
    APP_ID: process.env.NUXT_PUBLIC_QQ_APP_ID || '你的QQ应用ID',
    // ...
  },
  // ...
}
```

## 测试配置

### 1. 启动服务

```bash
# 启动后端
cd backend
python manage.py runserver

# 启动前端
cd frontend
npm run dev
```

### 2. 测试登录流程

1. 访问 `http://localhost:3001/login`
2. 点击QQ或微信登录按钮
3. 完成第三方授权
4. 检查是否成功跳转回应用并登录

## 生产环境部署

### 1. 更新回调地址

在第三方平台中将回调地址更新为生产环境地址：
- QQ：`https://your-domain.com/auth/qq/callback`
- 微信：`https://your-domain.com/auth/wechat/callback`

### 2. 更新配置

确保生产环境的配置文件中使用正确的域名和HTTPS协议。

### 3. 安全注意事项

- 不要在前端代码中暴露APP SECRET
- 使用环境变量存储敏感信息
- 确保回调地址使用HTTPS
- 定期更新应用密钥

## 故障排除

### 常见问题

1. **授权失败**
   - 检查APP ID是否正确
   - 确认回调地址配置正确
   - 检查应用状态是否为已审核

2. **回调页面404**
   - 确认前端路由配置正确
   - 检查回调页面文件是否存在

3. **用户信息获取失败**
   - 检查APP SECRET配置
   - 确认API权限设置正确

### 调试方法

1. 查看浏览器开发者工具的网络请求
2. 检查后端日志输出
3. 使用第三方平台提供的调试工具

## 相关链接

- [QQ互联开发文档](https://wiki.connect.qq.com/)
- [微信开放平台文档](https://developers.weixin.qq.com/doc/oplatform/Website_App/WeChat_Login/Wechat_Login.html)
- [Django OAuth2 Provider文档](https://django-oauth-toolkit.readthedocs.io/)