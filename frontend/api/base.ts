/**
 * 统一的API基础类
 * 提供完善的请求拦截、响应处理和错误处理机制
 */

import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { useRuntimeConfig } from '#imports';
import type {
  ApiResponse,
  ApiError,
  RequestConfig,
  RequestInterceptor,
  ResponseInterceptor,
  HttpMethod
} from '~/types/api';

/**
 * API错误类
 * 统一的错误处理类，提供详细的错误信息
 */
export class ApiException extends Error {
  public readonly status: number;
  public readonly code?: string;
  public readonly details?: Record<string, any>;

  constructor(error: ApiError) {
    super(error.message);
    this.name = 'ApiException';
    this.status = error.status;
    this.code = error.code;
    this.details = error.details;
  }

  /**
   * 判断是否为网络错误
   */
  isNetworkError(): boolean {
    return this.status === 0 || this.status >= 500;
  }

  /**
   * 判断是否为认证错误
   */
  isAuthError(): boolean {
    return this.status === 401;
  }

  /**
   * 判断是否为权限错误
   */
  isPermissionError(): boolean {
    return this.status === 403;
  }

  /**
   * 判断是否为资源不存在错误
   */
  isNotFoundError(): boolean {
    return this.status === 404;
  }

  /**
   * 判断是否为验证错误
   */
  isValidationError(): boolean {
    return this.status === 400;
  }
}

/**
 * API客户端基础类
 * 提供统一的HTTP请求封装和错误处理
 */
export class ApiClient {
  private axiosInstance: AxiosInstance;
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];

  constructor(baseURL?: string, timeout: number = 30000) {
    this.axiosInstance = axios.create({
      baseURL: baseURL || this.getBaseURL(),
      timeout,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    this.setupInterceptors();
  }

  /**
   * 获取基础URL
   */
  private getBaseURL(): string {
    try {
      // 检查是否在浏览器环境中
      if (typeof window === 'undefined') {
        return 'http://127.0.0.1:8000/api';
      }
      
      const config = useRuntimeConfig();
      return config?.public?.apiBase || 'http://127.0.0.1:8000/api';
    } catch {
      return 'http://127.0.0.1:8000/api';
    }
  }

  /**
   * 设置拦截器
   */
  private setupInterceptors(): void {
    // 请求拦截器
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        // 添加认证token
        if (process.client) {
          try {
            // 优先从cookie获取token
            const accessTokenCookie = useCookie('access-token');
            if (accessTokenCookie.value) {
              config.headers.Authorization = `Bearer ${accessTokenCookie.value}`;
            } else {
              // 备选方案：从localStorage获取
              const { userStorage } = await import('~/utils/storage');
              const token = userStorage.getToken();
              if (token) {
                config.headers.Authorization = `Bearer ${token}`;
              }
            }
          } catch (error) {
            console.warn('无法获取认证状态:', error);
          }
        }

        // 执行自定义请求拦截器
        for (const interceptor of this.requestInterceptors) {
          config = interceptor(config) || config;
        }

        return config;
      },
      (error) => {
        console.error('请求配置错误:', error);
        return Promise.reject(this.createApiError(error));
      }
    );

    // 响应拦截器
    this.axiosInstance.interceptors.response.use(
      (response) => {
        // 执行自定义响应拦截器
        for (const interceptor of this.responseInterceptors) {
          if (interceptor.onFulfilled) {
            response = interceptor.onFulfilled(response) || response;
          }
        }
        return response;
      },
      async (error) => {
        const originalRequest: any = error.config;

        // 若401且尚未重试，尝试刷新令牌并重试
        if (error.response && error.response.status === 401 && !originalRequest?._retry) {
          originalRequest._retry = true;
          try {
            const { useAuth } = await import('~/composables/useAuth');
            const { refreshAccessToken, accessToken } = useAuth();
            const newToken = await refreshAccessToken();
            if (newToken) {
              originalRequest.headers = {
                ...(originalRequest.headers || {}),
                Authorization: `Bearer ${newToken}`
              };
              return this.axiosInstance(originalRequest);
            }
          } catch (refreshErr) {
            console.warn('刷新令牌失败:', refreshErr);
          }
        }

        // 执行自定义响应拦截器
        for (const interceptor of this.responseInterceptors) {
          if (interceptor.onRejected) {
            error = interceptor.onRejected(error) || error;
          }
        }

        return Promise.reject(await this.handleResponseError(error));
      }
    );
  }

  /**
   * 处理响应错误
   */
  private async handleResponseError(error: any): Promise<ApiException> {
    if (error.response) {
      const { status, data } = error.response;
      
      // 处理认证错误
      if (status === 401) {
        if (process.client) {
          try {
            // 使用 navigateTo 重定向到登录页面，避免直接使用 store
            await navigateTo('/login');
            console.error('认证失败，请重新登录');
          } catch (e) {
            console.warn('无法处理认证错误:', e);
            // 作为备选方案，直接清除本地存储
            if (typeof localStorage !== 'undefined') {
              localStorage.removeItem('access-token');
              localStorage.removeItem('user-info');
            }
          }
        }
      }

      return this.createApiError({
        message: this.getErrorMessage(status, data),
        status,
        code: data?.code,
        details: data
      });
    } else if (error.request) {
      return this.createApiError({
        message: '网络错误，请检查您的网络连接',
        status: 0,
        code: 'NETWORK_ERROR'
      });
    } else {
      return this.createApiError({
        message: error.message || '请求配置错误',
        status: 0,
        code: 'CONFIG_ERROR'
      });
    }
  }

  /**
   * 获取错误消息
   */
  private getErrorMessage(status: number, data: any): string {
    if (data?.message) {
      return data.message;
    }

    switch (status) {
      case 400:
        return '请求参数错误';
      case 401:
        return '认证失败，请重新登录';
      case 403:
        return '权限不足';
      case 404:
        return '请求的资源不存在';
      case 422:
        return '数据验证失败';
      case 429:
        return '请求过于频繁，请稍后再试';
      case 500:
        return '服务器内部错误';
      case 502:
        return '网关错误';
      case 503:
        return '服务暂时不可用';
      case 504:
        return '网关超时';
      default:
        return `请求失败 (${status})`;
    }
  }

  /**
   * 创建API错误对象
   */
  private createApiError(error: Partial<ApiError>): ApiException {
    return new ApiException({
      message: error.message || '未知错误',
      status: error.status || 0,
      code: error.code,
      details: error.details
    });
  }

  /**
   * 添加请求拦截器
   */
  public addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.requestInterceptors.push(interceptor);
  }

  /**
   * 添加响应拦截器
   */
  public addResponseInterceptor(interceptor: ResponseInterceptor): void {
    this.responseInterceptors.push(interceptor);
  }

  /**
   * GET请求
   */
  public async get<T = any>(
    url: string,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.axiosInstance.get(url, config);
    return response.data;
  }

  /**
   * POST请求
   */
  public async post<T = any>(
    url: string,
    data?: any,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.axiosInstance.post(url, data, config);
    return response.data;
  }

  /**
   * PUT请求
   */
  public async put<T = any>(
    url: string,
    data?: any,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.axiosInstance.put(url, data, config);
    return response.data;
  }

  /**
   * PATCH请求
   */
  public async patch<T = any>(
    url: string,
    data?: any,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.axiosInstance.patch(url, data, config);
    return response.data;
  }

  /**
   * DELETE请求
   */
  public async delete<T = any>(
    url: string,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.axiosInstance.delete(url, config);
    return response.data;
  }

  /**
   * 通用请求方法
   */
  public async request<T = any>(
    method: HttpMethod,
    url: string,
    data?: any,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    const requestConfig: AxiosRequestConfig = {
      method,
      url,
      ...config
    };

    if (data && ['POST', 'PUT', 'PATCH'].includes(method)) {
      requestConfig.data = data;
    } else if (data) {
      requestConfig.params = data;
    }

    const response = await this.axiosInstance.request(requestConfig);
    return response.data;
  }

  /**
   * 上传文件
   */
  public async upload<T = any>(
    url: string,
    file: File,
    fieldName: string = 'file',
    additionalData?: Record<string, any>
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append(fieldName, file);

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }

    const response = await this.axiosInstance.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return response.data;
  }

  /**
   * 获取原始axios实例
   */
  public getAxiosInstance(): AxiosInstance {
    return this.axiosInstance;
  }
}

// 创建默认的API客户端实例
export const apiClient = new ApiClient();

// 导出便捷方法
export const { get, post, put, patch, delete: del, request, upload } = apiClient;