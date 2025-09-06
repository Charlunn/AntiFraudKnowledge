# 第三方OAuth平台申请配置指南

本文档详细说明如何在各个第三方平台申请OAuth应用，获取必要的APP_ID和密钥。

## 📋 概述

我们的反欺诈知识平台支持以下四个第三方登录平台：
- QQ互联
- 微信开放平台
- 抖音开放平台
- 支付宝开放平台

每个平台都需要预先申请开发者账号并创建应用，获取相应的APP_ID和密钥。

## 🔐 QQ互联申请流程

### 申请地址
- 官网：https://connect.qq.com/
- 管理中心：https://connect.qq.com/manage.html

### 申请步骤
1. **注册开发者账号**
   - 使用QQ号登录QQ互联官网
   - 完成开发者资质认证（个人或企业）

2. **创建应用**
   - 进入管理中心，点击"创建应用"
   - 选择"网站应用"
   - 填写应用信息：
     - 应用名称：反欺诈知识平台
     - 应用简介：提供反欺诈知识学习的在线平台
     - 应用官网：您的域名

3. **配置回调地址**
   ```
   开发环境：http://localhost:3001/auth/qq/callback
   生产环境：https://yourdomain.com/auth/qq/callback
   ```

4. **获取配置信息**
   - APP ID：应用的唯一标识
   - APP Key：应用密钥（后端使用）

### 审核时间
- 个人开发者：1-3个工作日
- 企业开发者：3-7个工作日

## 🟢 微信开放平台申请流程

### 申请地址
- 官网：https://open.weixin.qq.com/
- 管理中心：https://open.weixin.qq.com/cgi-bin/applist

### 申请步骤
1. **注册开发者账号**
   - 使用微信扫码登录
   - 完成开发者资质认证（需要300元认证费）

2. **创建网站应用**
   - 选择"网站应用"类型
   - 填写应用信息：
     - 应用名称：反欺诈知识平台
     - 应用简介：反欺诈知识学习平台
     - 应用官网：您的域名
     - 应用图标：上传应用图标

3. **配置授权回调域**
   ```
   开发环境：localhost:3001
   生产环境：yourdomain.com
   ```

4. **获取配置信息**
   - AppID：应用唯一标识
   - AppSecret：应用密钥

### 审核时间
- 7个工作日左右

### 注意事项
- 需要企业资质或个人开发者认证
- 认证费用：300元/年

## 🎵 抖音开放平台申请流程

### 申请地址
- 官网：https://developer.open-douyin.com/
- 开发者后台：https://developer.open-douyin.com/app

### 申请步骤
1. **注册开发者账号**
   - 使用手机号注册
   - 完成实名认证

2. **创建应用**
   - 选择"网页应用"
   - 填写应用信息：
     - 应用名称：反欺诈知识平台
     - 应用类型：教育学习
     - 应用简介：提供反欺诈知识的在线学习平台

3. **配置回调地址**
   ```
   开发环境：http://localhost:3001/auth/douyin/callback
   生产环境：https://yourdomain.com/auth/douyin/callback
   ```

4. **申请权限**
   - 申请"用户信息"权限
   - 提交权限申请理由

5. **获取配置信息**
   - Client Key：应用标识
   - Client Secret：应用密钥

### 审核时间
- 应用审核：3-5个工作日
- 权限审核：7-14个工作日

## 💰 支付宝开放平台申请流程

### 申请地址
- 官网：https://open.alipay.com/
- 开发者中心：https://openhome.alipay.com/develop/manage

### 申请步骤
1. **注册开发者账号**
   - 使用支付宝账号登录
   - 完成开发者入驻（个人或企业）

2. **创建应用**
   - 选择"网页&移动应用"
   - 填写应用信息：
     - 应用名称：反欺诈知识平台
     - 应用类型：生活服务
     - 应用简介：反欺诈知识学习平台

3. **配置授权回调地址**
   ```
   开发环境：http://localhost:3001/auth/alipay/callback
   生产环境：https://yourdomain.com/auth/alipay/callback
   ```

4. **上线应用**
   - 完成开发配置
   - 提交应用审核
   - 等待审核通过后上线

5. **获取配置信息**
   - APPID：应用唯一标识
   - 应用私钥：用于签名
   - 支付宝公钥：用于验签

### 审核时间
- 应用审核：1-3个工作日

## ⚙️ 配置文件设置

获取到各平台的APP_ID后，需要在以下文件中配置：

### 1. 前端环境变量配置

编辑 `frontend/.env` 文件：
```env
# QQ互联应用ID
NUXT_QQ_APP_ID=你的QQ_APP_ID

# 微信开放平台应用ID
NUXT_WECHAT_APP_ID=你的微信_AppID

# 抖音开放平台应用ID
NUXT_DOUYIN_APP_ID=你的抖音_Client_Key

# 支付宝开放平台应用ID
NUXT_ALIPAY_APP_ID=你的支付宝_APPID
```

### 2. 后端环境变量配置

编辑 `backend/.env` 文件：
```env
# QQ互联配置
QQ_APP_ID=你的QQ_APP_ID
QQ_APP_KEY=你的QQ_APP_KEY

# 微信开放平台配置
WECHAT_APP_ID=你的微信_AppID
WECHAT_APP_SECRET=你的微信_AppSecret

# 抖音开放平台配置
DOUYIN_APP_ID=你的抖音_Client_Key
DOUYIN_APP_SECRET=你的抖音_Client_Secret

# 支付宝开放平台配置
ALIPAY_APP_ID=你的支付宝_APPID
ALIPAY_APP_PRIVATE_KEY=你的应用私钥
ALIPAY_PUBLIC_KEY=支付宝公钥
```

## 🚀 开发测试

在开发阶段，您可以：

1. **使用演示配置**：当前系统已配置演示用的APP_ID，可以测试登录流程
2. **本地测试**：配置localhost回调地址进行本地开发测试
3. **沙箱环境**：部分平台提供沙箱环境用于测试

## ⚠️ 注意事项

1. **域名要求**：生产环境必须使用HTTPS域名
2. **回调地址**：必须与申请时填写的回调地址完全一致
3. **密钥安全**：APP_SECRET等密钥信息只能在后端使用，不能暴露在前端
4. **审核周期**：建议提前申请，预留足够的审核时间
5. **费用说明**：
   - QQ互联：免费
   - 微信开放平台：300元/年认证费
   - 抖音开放平台：免费
   - 支付宝开放平台：免费

## 📞 技术支持

如果在申请过程中遇到问题，可以：
- 查看各平台的官方文档
- 联系平台技术支持
- 参考本项目的OAuth集成代码示例

---

**提示**：当前系统已经完成了OAuth集成的技术实现，您只需要申请获取真实的APP_ID即可启用第三方登录功能。