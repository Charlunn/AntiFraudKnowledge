/**
 * 用户认证相关API工具类
 * 提供用户注册、登录、资料管理等功能
 */

// 导入API请求工具
import apiClient from './http.js';

/**
 * 用户注册
 * @param {Object} data - 注册信息
 * @param {string} data.username - 用户名
 * @param {string} data.nickname - 昵称
 * @param {string} data.password - 密码
 * @param {string} data.password2 - 确认密码
 * @param {string} [data.email] - 邮箱（可选）
 * @param {string} [data.phone_number] - 手机号（可选）
 * @returns {Promise} - 注册结果
 * 
 * @example
 * register({ username: 'testuser', nickname: '测试用户', password: 'password123', password2: 'password123' })
 *   .then(response => console.log('注册成功'))
 *   .catch(error => console.error('注册失败', error));
 */
export function register(data) {
  // 参数验证
  if (!data || !data.username || !data.nickname || !data.password || !data.password2) {
    return Promise.reject(new Error('用户名、昵称、密码和确认密码不能为空'));
  }
  return apiClient.post('/users/register/', data);
}

/**
 * 用户登录
 * 支持使用用户名、邮箱或手机号登录
 * @param {string} identifier - 标识符（用户名/邮箱/手机号）
 * @param {string} password - 密码
 * @returns {Promise} - 登录结果，包含访问令牌和刷新令牌
 * 
 * @example
 * login('testuser', 'password123')
 *   .then(response => {
 *     const { access, refresh } = response.data;
 *     useAuthStore().setTokens(access, refresh);
 *   })
 *   .catch(error => console.error('登录失败', error));
 */
export function login(identifier, password) {
  // 参数验证
  if (!identifier || !password) {
    return Promise.reject(new Error('标识符和密码不能为空'));
  }
  
  // 根据标识符类型构建请求体
  const payload = { password };
  if (identifier.includes('@')) {
    payload.email = identifier;
  } else if (/^\d+$/.test(identifier)) {
    payload.phone_number = identifier;
  } else {
    payload.username = identifier;
  }
  
  return apiClient.post('/users/login/', payload);
}

/**
 * 用户登出
 * @param {string} refreshToken - 刷新令牌
 * @returns {Promise} - 登出结果
 * 
 * @example
 * logout(refreshToken)
 *   .then(() => {
 *     useAuthStore().clear();
 *     console.log('登出成功');
 *   })
 *   .catch(error => console.error('登出失败', error));
 */
export function logout(refreshToken) {
  if (!refreshToken) {
    return Promise.reject(new Error('刷新令牌不能为空'));
  }
  return apiClient.post('/users/logout/', { refresh_token: refreshToken });
}

/**
 * 获取用户个人资料
 * 需要登录权限
 * @returns {Promise} - 用户资料信息
 * 
 * @example
 * fetchProfile()
 *   .then(response => console.log('用户资料', response.data))
 *   .catch(error => console.error('获取资料失败', error));
 */
export function fetchProfile() {
  return apiClient.get('/users/profile/');
}

/**
 * 修改密码
 * @param {Object} data - 密码修改信息
 * @param {string} data.old_password - 原密码
 * @param {string} data.new_password - 新密码
 * @returns {Promise} - 修改结果
 * 
 * @example
 * changePassword({ old_password: 'oldpass', new_password: 'newpass' })
 *   .then(() => console.log('密码修改成功'))
 *   .catch(error => console.error('密码修改失败', error));
 */
export function changePassword(data) {
  if (!data || !data.old_password || !data.new_password) {
    return Promise.reject(new Error('原密码和新密码不能为空'));
  }
  return apiClient.put('/users/change-password/', data);
}

/**
 * 删除用户账号
 * 需要登录权限
 * @returns {Promise} - 删除结果
 * 
 * @example
 * deleteAccount()
 *   .then(() => {
 *     useAuthStore().clear();
 *     console.log('账号删除成功');
 *   })
 *   .catch(error => console.error('账号删除失败', error));
 */
export function deleteAccount() {
  return apiClient.delete('/users/delete-account/');
}

/**
 * 绑定邮箱
 * @param {string} email - 邮箱地址
 * @param {string} code - 验证码
 * @returns {Promise} - 绑定结果
 * 
 * @example
 * bindEmail('user@example.com', '123456')
 *   .then(() => console.log('邮箱绑定成功'))
 *   .catch(error => console.error('邮箱绑定失败', error));
 */
export function bindEmail(email, code) {
  if (!email || !code) {
    return Promise.reject(new Error('邮箱和验证码不能为空'));
  }
  return apiClient.post('/users/bind-email/', { email, code });
}

/**
 * 绑定手机号
 * @param {string} phone_number - 手机号
 * @param {string} code - 验证码
 * @returns {Promise} - 绑定结果
 * 
 * @example
 * bindPhone('13800138000', '123456')
 *   .then(() => console.log('手机号绑定成功'))
 *   .catch(error => console.error('手机号绑定失败', error));
 */
export function bindPhone(phone_number, code) {
  if (!phone_number || !code) {
    return Promise.reject(new Error('手机号和验证码不能为空'));
  }
  return apiClient.post('/users/bind-phone/', { phone_number, code });
}

/**
 * 解绑邮箱
 * @returns {Promise} - 解绑结果
 * 
 * @example
 * unbindEmail()
 *   .then(() => console.log('邮箱解绑成功'))
 *   .catch(error => console.error('邮箱解绑失败', error));
 */
export function unbindEmail() {
  return apiClient.post('/users/unbind-email/');
}

/**
 * 解绑手机号
 * @returns {Promise} - 解绑结果
 * 
 * @example
 * unbindPhone()
 *   .then(() => console.log('手机号解绑成功'))
 *   .catch(error => console.error('手机号解绑失败', error));
 */
export function unbindPhone() {
  return apiClient.post('/users/unbind-phone/');
}

/**
 * 获取用户设置
 * @returns {Promise} - 用户设置信息
 * 
 * @example
 * getSettings()
 *   .then(response => console.log('用户设置', response.data))
 *   .catch(error => console.error('获取设置失败', error));
 */
export function getSettings() {
  return api.get('/users/settings/');
}

/**
 * 更新用户设置
 * @param {Object} data - 设置信息
 * @param {string} [data.language] - 语言设置
 * @param {string} [data.theme] - 主题设置
 * @returns {Promise} - 更新结果
 * 
 * @example
 * updateSettings({ language: 'zh', theme: 'dark' })
 *   .then(() => console.log('设置更新成功'))
 *   .catch(error => console.error('设置更新失败', error));
 */
export function updateSettings(data) {
  if (!data || Object.keys(data).length === 0) {
    return Promise.reject(new Error('设置数据不能为空'));
  }
  return api.put('/users/settings/', data);
}
