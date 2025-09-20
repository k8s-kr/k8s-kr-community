import { apiClient } from '../index'
import { API_ENDPOINTS } from '@/lib/constants'
import type {
  Post,
  CreatePostForm,
  UpdatePostForm,
  PaginatedResponse,
  UsePostsOptions,
  Comment,
  CreateCommentForm
} from '@/types'

export const postsApi = {
  // 게시글 목록 조회
  async getPosts(options: UsePostsOptions = { page: 1, limit: 10 }): Promise<PaginatedResponse<Post>> {
    const params = {
      page: options.page,
      limit: options.limit,
      category: options.category,
      author: options.author,
      sortBy: options.sortBy,
      sortOrder: options.sortOrder,
      search: options.search || undefined,
      tags: options.tags?.join(','),
    }

    const response = await apiClient.get<PaginatedResponse<Post>>(API_ENDPOINTS.POSTS, params)
    return response.data!
  },

  // 개별 게시글 조회
  async getPost(id: string): Promise<Post> {
    const response = await apiClient.get<Post>(`${API_ENDPOINTS.POSTS}/${id}`)
    return response.data!
  },

  // 게시글 생성
  async createPost(postData: CreatePostForm): Promise<Post> {
    const response = await apiClient.post<Post>(API_ENDPOINTS.POSTS, postData)
    return response.data!
  },

  // 게시글 수정
  async updatePost(id: string, updates: Partial<UpdatePostForm>): Promise<Post> {
    const response = await apiClient.patch<Post>(`${API_ENDPOINTS.POSTS}/${id}`, updates)
    return response.data!
  },

  // 게시글 삭제
  async deletePost(id: string): Promise<void> {
    await apiClient.delete(`${API_ENDPOINTS.POSTS}/${id}`)
  },

  // 게시글 좋아요 토글
  async toggleLike(postId: string): Promise<Post> {
    const response = await apiClient.post<Post>(`${API_ENDPOINTS.POSTS}/${postId}/like`)
    return response.data!
  },

  // 사용자별 게시글 조회
  async getPostsByUser(userId: string, options: UsePostsOptions = { page: 1, limit: 10 }): Promise<PaginatedResponse<Post>> {
    const params = {
      page: options.page,
      limit: options.limit,
      sortBy: options.sortBy,
      sortOrder: options.sortOrder,
    }

    const response = await apiClient.get<PaginatedResponse<Post>>(
      `${API_ENDPOINTS.USERS}/${userId}/posts`,
      params
    )
    return response.data!
  },

  // 게시글 검색
  async searchPosts(query: string, options: UsePostsOptions = { page: 1, limit: 10 }): Promise<PaginatedResponse<Post>> {
    const params = {
      q: query,
      page: options.page,
      limit: options.limit,
      category: options.category,
      sortBy: options.sortBy,
      sortOrder: options.sortOrder,
    }

    const response = await apiClient.get<PaginatedResponse<Post>>(
      `${API_ENDPOINTS.SEARCH}/posts`,
      params
    )
    return response.data!
  },

  // 댓글 관련 API
  comments: {
    // 댓글 목록 조회
    async getComments(postId: string): Promise<Comment[]> {
      const response = await apiClient.get<Comment[]>(`${API_ENDPOINTS.POSTS}/${postId}/comments`)
      return response.data!
    },

    // 댓글 생성
    async createComment(postId: string, commentData: CreateCommentForm): Promise<Comment> {
      const response = await apiClient.post<Comment>(
        `${API_ENDPOINTS.POSTS}/${postId}/comments`,
        commentData
      )
      return response.data!
    },

    // 댓글 수정
    async updateComment(commentId: string, content: string): Promise<Comment> {
      const response = await apiClient.patch<Comment>(
        `${API_ENDPOINTS.COMMENTS}/${commentId}`,
        { content }
      )
      return response.data!
    },

    // 댓글 삭제
    async deleteComment(commentId: string): Promise<void> {
      await apiClient.delete(`${API_ENDPOINTS.COMMENTS}/${commentId}`)
    },

    // 댓글 좋아요 토글
    async toggleLike(commentId: string): Promise<Comment> {
      const response = await apiClient.post<Comment>(`${API_ENDPOINTS.COMMENTS}/${commentId}/like`)
      return response.data!
    },
  }
}