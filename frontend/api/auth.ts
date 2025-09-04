/**
 * 用户认证相关API工具类
 * 提供用户注册、登录、资料管理等功能
 */

import { apiClient } from './base';
import type {
  User,
  LoginRequest,
  RegisterRequest,
  AuthTokens,
  ApiResponse
} from '~/types/api';

/**
 * 用户注册
 * @param data - 注册信息
 * @returns 注册结果
 * 
 * @example
 * ```typescript
 * const result = await register({
 *   username: 'testuser',
 *   nickname: '测试用户',
 *   password: 'password123',
 *   password2: 'password123'
 * });
 * ```
 */
export async function register(data: RegisterRequest): Promise<ApiResponse<User>> {
  // 参数验证
  if (!data.username || !data.nickname || !data.password || !data.password2) {
    throw new Error('用户名、昵称、密码和确认密码不能为空');
  }
  
  if (data.password !== data.password2) {
    throw new Error('两次输入的密码不一致');
  }
  
  return await apiClient.post<User>('/users/register/', data);
}

/**
 * 用户登录
 * 支持使用用户名、邮箱或手机号登录
 * @param identifier - 标识符（用户名/邮箱/手机号）
 * @param password - 密码
 * @returns 登录结果，包含访问令牌和刷新令牌
 * 
 * @example
 * ```typescript
 * const result = await login('testuser', 'password123');
 * const { access, refresh } = result.data;
 * useAuthStore().setTokens(access, refresh);
 * ```
 */
export async function login(identifier: string, password: string): Promise<ApiResponse<AuthTokens>> {
  // 参数验证
  if (!identifier || !password) {
    throw new Error('标识符和密码不能为空');
  }
  
  // 后端期望的字段名是 account_or_email_or_phone
  const payload = {
    account_or_email_or_phone: identifier,
    password: password
  };
  
  return await apiClient.post<AuthTokens>('/users/login/', payload);
}

/**
 * 用户登出
 * @param refreshToken - 刷新令牌
 * @returns 登出结果
 * 
 * @example
 * ```typescript
 * await logout(refreshToken);
 * useAuthStore().clear();
 * ```
 */
export async function logout(refreshToken: string): Promise<ApiResponse<void>> {
  if (!refreshToken) {
    throw new Error('刷新令牌不能为空');
  }
  return await apiClient.post<void>('/users/logout/', { refresh_token: refreshToken });
}

/**
 * 获取用户个人资料
 * 需要登录权限
 * @returns 用户资料信息
 * 
 * @example
 * ```typescript
 * const profile = await fetchProfile();
 * console.log('用户资料', profile.data);
 * ```
 */
export async function fetchProfile(): Promise<ApiResponse<User>> {
  return await apiClient.get<User>('/users/profile/');
}

/**
 * 修改密码
 * @param data - 密码修改信息
 * @param data.old_password - 原密码
 * @param data.new_password - 新密码
 * @param data.new_password2 - 确认新密码
 * @returns 修改结果
 * 
 * @example
 * changePassword({ old_password: 'oldpass', new_password: 'newpass', new_password2: 'newpass' })
 *   .then(() => console.log('密码修改成功'))
 *   .catch(error => console.error('密码修改失败', error));
 */
export async function changePassword(data: {old_password: string, new_password: string, new_password2: string}): Promise<ApiResponse<void>> {
  if (!data || !data.old_password || !data.new_password || !data.new_password2) {
    throw new Error('原密码、新密码和确认密码不能为空');
  }
  return await apiClient.post<void>('/users/change-password/', data);
}

/**
 * 删除用户账号
 * 需要登录权限
 * @returns 删除结果
 * 
 * @example
 * deleteAccount()
 *   .then(() => {
 *     useAuthStore().clear();
 *     console.log('账号删除成功');
 *   })
 *   .catch(error => console.error('账号删除失败', error));
 */
export async function deleteAccount(): Promise<ApiResponse<void>> {
  return await apiClient.delete<void>('/users/delete-account/');
}

/**
 * 绑定邮箱
 * @param email - 邮箱地址
 * @param code - 验证码
 * @returns 绑定结果
 * 
 * @example
 * bindEmail('user@example.com', '123456')
 *   .then(() => console.log('邮箱绑定成功'))
 *   .catch(error => console.error('邮箱绑定失败', error));
 */
export async function bindEmail(email: string, code: string): Promise<ApiResponse<void>> {
  if (!email || !code) {
    throw new Error('邮箱和验证码不能为空');
  }
  return await apiClient.post<void>('/users/bind-email/', { email, code });
}

/**
 * 绑定手机号
 * @param phone_number - 手机号
 * @param code - 验证码
 * @returns 绑定结果
 * 
 * @example
 * bindPhone('13800138000', '123456')
 *   .then(() => console.log('手机号绑定成功'))
 *   .catch(error => console.error('手机号绑定失败', error));
 */
export async function bindPhone(phone_number: string, code: string): Promise<ApiResponse<void>> {
  if (!phone_number || !code) {
    throw new Error('手机号和验证码不能为空');
  }
  return await apiClient.post<void>('/users/bind-phone/', { phone_number, code });
}

/**
 * 解绑邮箱
 * @returns 解绑结果
 * 
 * @example
 * unbindEmail()
 *   .then(() => console.log('邮箱解绑成功'))
 *   .catch(error => console.error('邮箱解绑失败', error));
 */
export async function unbindEmail(): Promise<ApiResponse<void>> {
  return await apiClient.post<void>('/users/unbind-email/');
}

/**
 * 解绑手机号
 * @returns 解绑结果
 * 
 * @example
 * unbindPhone()
 *   .then(() => console.log('手机号解绑成功'))
 *   .catch(error => console.error('手机号解绑失败', error));
 */
export async function unbindPhone(): Promise<ApiResponse<void>> {
  return await apiClient.post<void>('/users/unbind-phone/');
}

/**
 * 获取用户设置
 * @returns 用户设置信息
 * 
 * @example
 * getSettings()
 *   .then(settings => console.log('用户设置', settings.data))
 *   .catch(error => console.error('获取设置失败', error));
 */
export async function getSettings(): Promise<ApiResponse<{language: string, theme: string}>> {
  return await apiClient.get<{language: string, theme: string}>('/users/settings/');
}

/**
 * 更新用户设置
 * @param data - 设置数据
 * @param data.language - 语言设置（可选）
 * @param data.theme - 主题设置（可选）
 * @returns 更新后的设置信息
 * 
 * @example
 * updateSettings({ language: 'zh-CN', theme: 'dark' })
 *   .then(settings => console.log('设置更新成功', settings.data))
 *   .catch(error => console.error('设置更新失败', error));
 */
export async function updateSettings(data: {language?: string, theme?: string}): Promise<ApiResponse<{language: string, theme: string}>> {
  return await apiClient.put<{language: string, theme: string}>('/users/settings/', data);
}
