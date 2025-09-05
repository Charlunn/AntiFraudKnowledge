/**
 * API相关的TypeScript类型定义
 * 提供统一的接口类型和响应格式
 */

// 基础响应接口
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  status?: number;
}

// 分页响应接口
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// 错误响应接口
export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, any>;
  status: number;
}

// 请求配置接口
export interface RequestConfig {
  timeout?: number;
  headers?: Record<string, string>;
  params?: Record<string, any>;
  data?: any;
}

// 用户相关类型
export interface User {
  id: number;
  username: string;
  nickname: string;
  email?: string;
  phone_number?: string;
  avatar?: string;
  created_at: string;
  updated_at: string;
}

export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  nickname: string;
  password: string;
  password2: string;
  email?: string;
  phone_number?: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  user?: User;
}

// 测验相关类型
export interface Question {
  id: number;
  title: string;
  content: string;
  options: string[];
  correct_answer: string;
  level: string;
  category: string;
  created_at: string;
}

export interface QuizSubmission {
  level: string;
  answers: Record<string, string>;
}

export interface QuizResult {
  score: number;
  total: number;
  correct_answers: number;
  incorrect_answers: number;
  details: Array<{
    question_id: number;
    user_answer: string;
    correct_answer: string;
    is_correct: boolean;
  }>;
}

// 成就相关类型
export interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  condition: string;
  points: number;
  created_at: string;
}

export interface UserAchievement {
  id: number;
  achievement: Achievement;
  user: number;
  earned_at: string;
}

// 反馈相关类型
export interface Feedback {
  id: number;
  user: number;
  message: string;
  contact?: string;
  image?: string;
  created_at: string;
}

export interface CreateFeedbackRequest {
  message: string;
  contact?: string;
  image?: File;
}

// 聊天相关类型
export interface ChatMessage {
  id: number;
  user: number;
  message: string;
  response?: string;
  created_at: string;
}

export interface SendMessageRequest {
  message: string;
}

// 社区相关类型
export interface Post {
  id: number;
  title: string;
  content: string;
  author: User;
  category: Category;
  created_at: string;
  updated_at: string;
  likes_count: number;
  comments_count: number;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  created_at: string;
}

// 统计相关类型
export interface PlatformStats {
  total_users: number;
  total_questions: number;
  total_achievements: number;
  total_posts: number;
}

export interface UserStats {
  quiz_attempts: number;
  achievements_earned: number;
  posts_created: number;
  total_score: number;
}

// HTTP方法类型
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

// API端点配置
export interface ApiEndpoint {
  method: HttpMethod;
  url: string;
  requiresAuth?: boolean;
}

// 请求拦截器类型
export type RequestInterceptor = (config: any) => any | Promise<any>;

// 响应拦截器类型
export type ResponseInterceptor = {
  onFulfilled?: (response: any) => any | Promise<any>;
  onRejected?: (error: any) => any | Promise<any>;
};