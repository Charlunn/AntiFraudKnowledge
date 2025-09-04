/**
 * 聊天系统相关API工具类
 * 提供发送消息、获取聊天记录等功能
 */

import { apiClient } from './base';
import type {
  ChatMessage,
  ChatSession,
  ApiResponse,
  PaginatedResponse
} from '~/types/api';

/**
 * 发送聊天消息
 * @param message - 消息内容
 * @param sessionId - 会话ID（可选，不传则创建新会话）
 * @returns 发送结果，包含AI回复
 * 
 * @example
 * ```typescript
 * // 发送新消息（创建新会话）
 * const result = await sendMessage('你好，我想了解反欺诈知识');
 * console.log('AI回复:', result.data.response);
 * 
 * // 在现有会话中发送消息
 * const result = await sendMessage('继续解释', 'session-123');
 * ```
 */
export async function sendMessage(
  message: string,
  sessionId?: string
): Promise<ApiResponse<{
  message: ChatMessage;
  response: string;
  session_id: string;
}>> {
  if (!message || message.trim() === '') {
    throw new Error('消息内容不能为空');
  }
  
  const data: any = { message: message.trim() };
  
  if (sessionId) {
    data.session_id = sessionId;
  }
  
  return await apiClient.post('/chat/send/', data);
}

/**
 * 获取聊天会话列表
 * @param page - 页码（可选）
 * @param pageSize - 每页数量（可选）
 * @returns 会话列表
 * 
 * @example
 * ```typescript
 * const sessions = await fetchChatSessions();
 * console.log('聊天会话:', sessions.data);
 * ```
 */
export async function fetchChatSessions(
  page?: number,
  pageSize?: number
): Promise<ApiResponse<PaginatedResponse<ChatSession>>> {
  const params: Record<string, any> = {};
  
  if (page) {
    params.page = page;
  }
  
  if (pageSize) {
    params.page_size = pageSize;
  }
  
  return await apiClient.get<PaginatedResponse<ChatSession>>('/chat/sessions/', { params });
}

/**
 * 获取指定会话的聊天记录
 * @param sessionId - 会话ID
 * @param page - 页码（可选）
 * @param pageSize - 每页数量（可选）
 * @returns 聊天记录列表
 * 
 * @example
 * ```typescript
 * const messages = await fetchChatHistory('session-123');
 * console.log('聊天记录:', messages.data);
 * ```
 */
export async function fetchChatHistory(
  sessionId: string,
  page?: number,
  pageSize?: number
): Promise<ApiResponse<PaginatedResponse<ChatMessage>>> {
  if (!sessionId) {
    throw new Error('会话ID不能为空');
  }
  
  const params: Record<string, any> = {};
  
  if (page) {
    params.page = page;
  }
  
  if (pageSize) {
    params.page_size = pageSize;
  }
  
  return await apiClient.get<PaginatedResponse<ChatMessage>>(`/chat/sessions/${sessionId}/messages/`, { params });
}

/**
 * 创建新的聊天会话
 * @param title - 会话标题（可选）
 * @returns 新会话信息
 * 
 * @example
 * ```typescript
 * const session = await createChatSession('反欺诈咨询');
 * console.log('新会话ID:', session.data.id);
 * ```
 */
export async function createChatSession(
  title?: string
): Promise<ApiResponse<ChatSession>> {
  const data: any = {};
  
  if (title) {
    data.title = title;
  }
  
  return await apiClient.post<ChatSession>('/chat/sessions/', data);
}

/**
 * 删除聊天会话
 * @param sessionId - 会话ID
 * @returns 删除结果
 * 
 * @example
 * ```typescript
 * await deleteChatSession('session-123');
 * console.log('会话删除成功');
 * ```
 */
export async function deleteChatSession(
  sessionId: string
): Promise<ApiResponse<void>> {
  if (!sessionId) {
    throw new Error('会话ID不能为空');
  }
  
  return await apiClient.delete<void>(`/chat/sessions/${sessionId}/`);
}

/**
 * 更新会话标题
 * @param sessionId - 会话ID
 * @param title - 新标题
 * @returns 更新结果
 * 
 * @example
 * ```typescript
 * const updatedSession = await updateSessionTitle('session-123', '新的标题');
 * console.log('标题更新成功:', updatedSession.data.title);
 * ```
 */
export async function updateSessionTitle(
  sessionId: string,
  title: string
): Promise<ApiResponse<ChatSession>> {
  if (!sessionId) {
    throw new Error('会话ID不能为空');
  }
  
  if (!title || title.trim() === '') {
    throw new Error('标题不能为空');
  }
  
  return await apiClient.patch<ChatSession>(`/chat/sessions/${sessionId}/`, {
    title: title.trim()
  });
}

/**
 * 获取聊天统计信息
 * @returns 聊天统计数据
 * 
 * @example
 * ```typescript
 * const stats = await fetchChatStats();
 * console.log('聊天统计:', stats.data);
 * ```
 */
export async function fetchChatStats(): Promise<ApiResponse<{
  total_sessions: number;
  total_messages: number;
  active_sessions: number;
  average_messages_per_session: number;
}>> {
  return await apiClient.get('/chat/stats/');
}

/**
 * 清空指定会话的聊天记录
 * @param sessionId - 会话ID
 * @returns 清空结果
 * 
 * @example
 * ```typescript
 * await clearChatHistory('session-123');
 * console.log('聊天记录已清空');
 * ```
 */
export async function clearChatHistory(
  sessionId: string
): Promise<ApiResponse<void>> {
  if (!sessionId) {
    throw new Error('会话ID不能为空');
  }
  
  return await apiClient.delete<void>(`/chat/sessions/${sessionId}/messages/`);
}

/**
 * 搜索聊天记录
 * @param query - 搜索关键词
 * @param sessionId - 会话ID（可选，不传则搜索所有会话）
 * @param page - 页码（可选）
 * @param pageSize - 每页数量（可选）
 * @returns 搜索结果
 * 
 * @example
 * ```typescript
 * // 搜索所有会话中的消息
 * const results = await searchChatMessages('反欺诈');
 * 
 * // 搜索指定会话中的消息
 * const results = await searchChatMessages('反欺诈', 'session-123');
 * ```
 */
export async function searchChatMessages(
  query: string,
  sessionId?: string,
  page?: number,
  pageSize?: number
): Promise<ApiResponse<PaginatedResponse<ChatMessage>>> {
  if (!query || query.trim() === '') {
    throw new Error('搜索关键词不能为空');
  }
  
  const params: Record<string, any> = {
    q: query.trim()
  };
  
  if (sessionId) {
    params.session_id = sessionId;
  }
  
  if (page) {
    params.page = page;
  }
  
  if (pageSize) {
    params.page_size = pageSize;
  }
  
  return await apiClient.get<PaginatedResponse<ChatMessage>>('/chat/search/', { params });
}