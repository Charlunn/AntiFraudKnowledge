/**
 * 社区功能相关API工具类
 * 提供社区帖子、评论、点赞等功能
 */

import { apiClient } from './base';
import type {
  CommunityPost,
  CommunityComment,
  ApiResponse,
  PaginatedResponse
} from '~/types/api';

/**
 * 获取社区帖子列表
 * @param category - 帖子分类（可选）
 * @param sortBy - 排序方式（latest, popular, hot）
 * @param page - 页码（可选）
 * @param pageSize - 每页数量（可选）
 * @returns 帖子列表
 * 
 * @example
 * ```typescript
 * // 获取最新帖子
 * const posts = await fetchCommunityPosts();
 * 
 * // 获取指定分类的热门帖子
 * const hotPosts = await fetchCommunityPosts('discussion', 'hot');
 * 
 * // 分页获取帖子
 * const pagedPosts = await fetchCommunityPosts(undefined, 'latest', 1, 10);
 * ```
 */
export async function fetchCommunityPosts(
  category?: string,
  sortBy: 'latest' | 'popular' | 'hot' = 'latest',
  page?: number,
  pageSize?: number,
  search?: string,
  tags?: string
): Promise<ApiResponse<PaginatedResponse<CommunityPost>>> {
  const params: Record<string, any> = {};
  
  // 后端使用ordering参数进行排序
  if (sortBy === 'latest') {
    params.ordering = '-created_at';
  } else if (sortBy === 'popular') {
    params.ordering = '-view_count';
  } else if (sortBy === 'hot') {
    params.ordering = '-like_count';
  }
  
  if (category) {
    params.category = category;
  }
  
  if (search) {
    params.search = search;
  }
  
  if (tags) {
    params.tags = tags;
  }
  
  if (page) {
    params.page = page;
  }
  
  if (pageSize) {
    params.page_size = pageSize;
  }
  
  return await apiClient.get<PaginatedResponse<CommunityPost>>('/community/posts/', { params });
}

/**
 * 获取帖子详情
 * @param postId - 帖子ID
 * @returns 帖子详细信息
 * 
 * @example
 * ```typescript
 * const post = await fetchPostDetail(123);
 * console.log('帖子详情:', post.data);
 * ```
 */
export async function fetchPostDetail(
  postId: number
): Promise<ApiResponse<CommunityPost>> {
  if (!postId) {
    throw new Error('帖子ID不能为空');
  }
  
  return await apiClient.get<CommunityPost>(`/community/posts/${postId}/`);
}

/**
 * 创建新帖子
 * @param postData - 帖子数据
 * @returns 创建结果
 * 
 * @example
 * ```typescript
 * const newPost = await createPost({
 *   title: '分享一个反欺诈案例',
 *   content: '详细内容...',
 *   category: 'case-study',
 *   tags: ['反欺诈', '案例分析']
 * });
 * console.log('帖子创建成功:', newPost.data);
 * ```
 */
export async function createPost(
  postData: {
    title: string;
    content: string;
    category: number; // 后端需要分类ID，不是字符串
    tags?: string; // 后端接收字符串格式的标签，用逗号分隔
    status?: 'draft' | 'published'; // 帖子状态
  }
): Promise<ApiResponse<CommunityPost>> {
  if (!postData.title || postData.title.trim() === '') {
    throw new Error('帖子标题不能为空');
  }
  
  if (!postData.content || postData.content.trim() === '') {
    throw new Error('帖子内容不能为空');
  }
  
  return await apiClient.post<CommunityPost>('/community/posts/create/', postData);
}

/**
 * 更新帖子
 * @param postId - 帖子ID
 * @param postData - 更新的帖子数据
 * @returns 更新结果
 * 
 * @example
 * ```typescript
 * const updatedPost = await updatePost(123, {
 *   title: '更新后的标题',
 *   content: '更新后的内容'
 * });
 * ```
 */
export async function updatePost(
  postId: number,
  postData: Partial<{
    title: string;
    content: string;
    category: number; // 后端需要分类ID
    tags: string; // 后端接收字符串格式的标签
    status: 'draft' | 'published';
  }>
): Promise<ApiResponse<CommunityPost>> {
  if (!postId) {
    throw new Error('帖子ID不能为空');
  }
  
  return await apiClient.patch<CommunityPost>(`/community/posts/${postId}/update/`, postData);
}

/**
 * 删除帖子
 * @param postId - 帖子ID
 * @returns 删除结果
 * 
 * @example
 * ```typescript
 * await deletePost(123);
 * console.log('帖子删除成功');
 * ```
 */
export async function deletePost(
  postId: number
): Promise<ApiResponse<void>> {
  if (!postId) {
    throw new Error('帖子ID不能为空');
  }
  
  return await apiClient.delete<void>(`/community/posts/${postId}/delete/`);
}

/**
 * 点赞/取消点赞帖子
 * @param postId - 帖子ID
 * @returns 点赞结果
 * 
 * @example
 * ```typescript
 * const result = await togglePostLike(123);
 * console.log('点赞状态:', result.data.liked);
 * ```
 */
export async function togglePostLike(
  postId: number
): Promise<ApiResponse<{ liked: boolean; like_count: number }>> {
  if (!postId) {
    throw new Error('帖子ID不能为空');
  }
  
  return await apiClient.post(`/community/posts/${postId}/like/`);
}

/**
 * 获取帖子评论列表
 * @param postId - 帖子ID
 * @param page - 页码（可选）
 * @param pageSize - 每页数量（可选）
 * @returns 评论列表
 * 
 * @example
 * ```typescript
 * const comments = await fetchPostComments(123);
 * console.log('评论列表:', comments.data);
 * ```
 */
export async function fetchPostComments(
  postId: number,
  page?: number,
  pageSize?: number
): Promise<ApiResponse<PaginatedResponse<CommunityComment>>> {
  if (!postId) {
    throw new Error('帖子ID不能为空');
  }
  
  const params: Record<string, any> = {};
  
  if (page) {
    params.page = page;
  }
  
  if (pageSize) {
    params.page_size = pageSize;
  }
  
  return await apiClient.get<PaginatedResponse<CommunityComment>>(`/community/posts/${postId}/comments/`, { params });
}

/**
 * 创建评论
 * @param postId - 帖子ID
 * @param content - 评论内容
 * @param parentId - 父评论ID（回复评论时使用）
 * @returns 创建结果
 * 
 * @example
 * ```typescript
 * // 创建顶级评论
 * const comment = await createComment(123, '很有用的分享！');
 * 
 * // 回复评论
 * const reply = await createComment(123, '我也这么认为', 456);
 * ```
 */
export async function createComment(
  postId: number,
  content: string,
  parentId?: number
): Promise<ApiResponse<CommunityComment>> {
  if (!postId) {
    throw new Error('帖子ID不能为空');
  }
  
  if (!content || content.trim() === '') {
    throw new Error('评论内容不能为空');
  }
  
  const data: any = {
    content: content.trim()
  };
  
  if (parentId) {
    data.parent_comment = parentId; // 后端使用parent_comment字段
  }
  
  return await apiClient.post<CommunityComment>(`/community/posts/${postId}/comments/`, data);
}

/**
 * 更新评论
 * @param commentId - 评论ID
 * @param content - 新的评论内容
 * @returns 更新结果
 * 
 * @example
 * ```typescript
 * const updatedComment = await updateComment(456, '更新后的评论内容');
 * console.log('评论更新成功:', updatedComment.data);
 * ```
 */
export async function updateComment(
  commentId: number,
  content: string
): Promise<ApiResponse<CommunityComment>> {
  if (!commentId) {
    throw new Error('评论ID不能为空');
  }
  
  if (!content || content.trim() === '') {
    throw new Error('评论内容不能为空');
  }
  
  return await apiClient.patch<CommunityComment>(`/community/comments/${commentId}/update/`, {
    content: content.trim()
  });
}

/**
 * 删除评论
 * @param commentId - 评论ID
 * @returns 删除结果
 * 
 * @example
 * ```typescript
 * await deleteComment(456);
 * console.log('评论删除成功');
 * ```
 */
export async function deleteComment(
  commentId: number
): Promise<ApiResponse<void>> {
  if (!commentId) {
    throw new Error('评论ID不能为空');
  }
  
  return await apiClient.delete<void>(`/community/comments/${commentId}/delete/`);
}

/**
 * 点赞/取消点赞评论
 * @param commentId - 评论ID
 * @returns 点赞结果
 * 
 * @example
 * ```typescript
 * const result = await toggleCommentLike(456);
 * console.log('点赞状态:', result.data.liked);
 * ```
 */
export async function toggleCommentLike(
  commentId: number
): Promise<ApiResponse<{ liked: boolean; like_count: number }>> {
  if (!commentId) {
    throw new Error('评论ID不能为空');
  }
  
  return await apiClient.post(`/community/comments/${commentId}/like/`);
}

/**
 * 搜索帖子
 * @param query - 搜索关键词
 * @param category - 搜索分类（可选）
 * @param page - 页码（可选）
 * @param pageSize - 每页数量（可选）
 * @returns 搜索结果
 * 
 * @example
 * ```typescript
 * const results = await searchPosts('反欺诈技巧');
 * console.log('搜索结果:', results.data);
 * ```
 */
export async function searchPosts(
  query: string,
  category?: string,
  page?: number,
  pageSize?: number
): Promise<ApiResponse<PaginatedResponse<CommunityPost>>> {
  if (!query || query.trim() === '') {
    throw new Error('搜索关键词不能为空');
  }
  
  const params: Record<string, any> = {
    q: query.trim()
  };
  
  if (category) {
    params.category = category;
  }
  
  if (page) {
    params.page = page;
  }
  
  if (pageSize) {
    params.page_size = pageSize;
  }
  
  return await apiClient.get<PaginatedResponse<CommunityPost>>('/community/search/', { params });
}

/**
 * 获取社区分类列表
 * @returns 分类列表
 * 
 * @example
 * ```typescript
 * const categories = await fetchCommunityCategories();
 * console.log('社区分类:', categories.data);
 * ```
 */
export async function fetchCommunityCategories(): Promise<ApiResponse<Array<{
  id: number; // 后端返回数字ID
  name: string;
  description: string;
  created_at: string; // 后端返回创建时间而不是post_count
}>>> {
  return await apiClient.get('/community/categories/');
}

// 注意：后端暂未提供热门标签API
// export async function fetchPopularTags() { ... }

// 注意：后端暂未提供举报帖子API
// export async function reportPost() { ... }

// 注意：后端暂未提供举报评论API
// export async function reportComment() { ... }