import { env, envUtils } from '@/lib/config/environment'
import { postsApi, usersApi } from '@/lib/api/services'
import { dataTransformers } from '@/lib/api/transformers'
import { ApiError } from '@/lib/api/client'
import { storageService as localStorage } from './storage'
import type {
  Post,
  User,
  FollowRelation,
  PaginatedResponse,
  UsePostsOptions,
  CreatePostForm,
  UpdatePostForm,
  CreateCommentForm,
  UpdateUserForm,
  UserStats
} from '@/types'

// 통합 데이터 서비스 인터페이스
export interface IDataService {
  // Posts
  getPosts(options?: UsePostsOptions): Promise<PaginatedResponse<Post> | Post[]>
  getPost(id: string): Promise<Post | null>
  createPost(post: CreatePostForm): Promise<Post>
  updatePost(id: string, updates: Partial<UpdatePostForm>): Promise<Post | null>
  deletePost(id: string): Promise<boolean>
  togglePostLike(postId: string): Promise<Post | boolean>
  getPostsByUser(userId: string, options?: UsePostsOptions): Promise<PaginatedResponse<Post> | Post[]>

  // Comments
  addComment(postId: string, content: string, parentId?: string): Promise<boolean>

  // Users
  getUsers(options?: { page?: number; limit?: number; search?: string }): Promise<PaginatedResponse<User> | User[]>
  getUser(id: string): Promise<User | null>
  updateUser(id: string, updates: UpdateUserForm): Promise<User | null>
  updateUserBio(userId: string, bio: string): Promise<boolean>
  getUserStats(userId: string): Promise<UserStats | null>

  // Follows
  getFollowRelation(userId: string): Promise<FollowRelation>
  followUser(userId: string, targetUserId: string): Promise<boolean>
  unfollowUser(userId: string, targetUserId: string): Promise<boolean>

  // Search
  searchPosts(query: string, options?: UsePostsOptions): Promise<PaginatedResponse<Post> | Post[]>
  searchUsers(query: string, options?: { page?: number; limit?: number }): Promise<PaginatedResponse<User> | User[]>
}

// 하이브리드 데이터 서비스 (API + LocalStorage fallback)
export class HybridDataService implements IDataService {
  private useAPI: boolean
  private fallbackToLocalStorage: boolean

  constructor(
    useAPI: boolean = envUtils.shouldUseAPI(),
    fallbackToLocalStorage: boolean = envUtils.shouldUseLocalStorage()
  ) {
    this.useAPI = useAPI
    this.fallbackToLocalStorage = fallbackToLocalStorage

    if (envUtils.isDevelopment()) {
      console.log('🔄 DataService initialized:', {
        useAPI: this.useAPI,
        fallbackToLocalStorage: this.fallbackToLocalStorage
      })
    }
  }

  // API 호출을 시도하고 실패하면 로컬 스토리지로 fallback
  private async executeWithFallback<T>(
    apiCall: () => Promise<T>,
    localStorageCall: () => Promise<T>,
    errorMessage: string = 'Operation failed'
  ): Promise<T> {
    if (!this.useAPI) {
      return localStorageCall()
    }

    try {
      return await apiCall()
    } catch (error) {
      if (envUtils.isDevelopment()) {
        console.warn(`API call failed, ${this.fallbackToLocalStorage ? 'falling back to localStorage' : 'throwing error'}:`, error)
      }

      if (this.fallbackToLocalStorage) {
        try {
          return await localStorageCall()
        } catch (localError) {
          if (envUtils.isDevelopment()) {
            console.error('LocalStorage fallback also failed:', localError)
          }
          throw new Error(`${errorMessage}: Both API and localStorage failed`)
        }
      }

      throw error
    }
  }

  // Posts
  async getPosts(options: UsePostsOptions = {}): Promise<PaginatedResponse<Post> | Post[]> {
    return this.executeWithFallback(
      async () => {
        const response = await postsApi.getPosts(options)
        return dataTransformers.pagination.fromApi(response, dataTransformers.post.fromApi)
      },
      async () => {
        const posts = await localStorage.getPosts()
        // 로컬 스토리지에서는 간단한 페이지네이션 시뮬레이션
        if (options.page || options.limit) {
          const page = options.page || 1
          const limit = options.limit || 10
          const startIndex = (page - 1) * limit
          const endIndex = startIndex + limit
          const paginatedPosts = posts.slice(startIndex, endIndex)

          return {
            data: paginatedPosts,
            pagination: {
              page,
              limit,
              total: posts.length,
              totalPages: Math.ceil(posts.length / limit),
              hasNext: endIndex < posts.length,
              hasPrev: page > 1
            }
          }
        }
        return {
          data: posts,
          pagination: {
            page: 1,
            limit: posts.length,
            total: posts.length,
            totalPages: 1,
            hasNext: false,
            hasPrev: false
          }
        }
      },
      'Failed to fetch posts'
    )
  }

  async getPost(id: string): Promise<Post | null> {
    return this.executeWithFallback(
      async () => {
        const response = await postsApi.getPost(id)
        return dataTransformers.post.fromApi(response)
      },
      () => localStorage.getPost(id),
      'Failed to fetch post'
    )
  }

  async createPost(postData: CreatePostForm): Promise<Post> {
    return this.executeWithFallback(
      async () => {
        const apiData = dataTransformers.post.createToApi(postData)
        const response = await postsApi.createPost(apiData)
        return dataTransformers.post.fromApi(response)
      },
      async () => {
        // CreatePostForm을 localStorage에서 필요한 형태로 변환
        const localPost = {
          ...postData,
          author: {
            id: 'current-user',
            email: 'current-user@example.com',
            name: 'Current User'
          },
          likes: [],
          comments: []
        }
        return localStorage.createPost(localPost)
      },
      'Failed to create post'
    )
  }

  async updatePost(id: string, updates: Partial<UpdatePostForm>): Promise<Post | null> {
    return this.executeWithFallback(
      async () => {
        const apiData = dataTransformers.post.updateToApi(updates as UpdatePostForm)
        const response = await postsApi.updatePost(id, apiData)
        return dataTransformers.post.fromApi(response)
      },
      () => localStorage.updatePost(id, updates as Partial<Post>),
      'Failed to update post'
    )
  }

  async deletePost(id: string): Promise<boolean> {
    return this.executeWithFallback(
      async () => {
        await postsApi.deletePost(id)
        return true
      },
      () => localStorage.deletePost(id),
      'Failed to delete post'
    )
  }

  async togglePostLike(postId: string): Promise<Post | boolean> {
    return this.executeWithFallback(
      async () => {
        const response = await postsApi.toggleLike(postId)
        return dataTransformers.post.fromApi(response)
      },
      async () => {
        // 로컬 스토리지에서는 간단한 좋아요 토글 구현
        const post = await localStorage.getPost(postId)
        if (!post) return false

        const currentUserEmail = 'current-user@example.com' // 실제로는 세션에서 가져와야 함
        const isLiked = post.likes.includes(currentUserEmail)
        const updatedLikes = isLiked
          ? post.likes.filter(email => email !== currentUserEmail)
          : [...post.likes, currentUserEmail]

        const updatedPost = await localStorage.updatePost(postId, { likes: updatedLikes })
        return !!updatedPost
      },
      'Failed to toggle post like'
    )
  }

  async getPostsByUser(userId: string, options: UsePostsOptions = {}): Promise<PaginatedResponse<Post> | Post[]> {
    return this.executeWithFallback(
      async () => {
        const response = await postsApi.getPostsByUser(userId, options)
        return dataTransformers.pagination.fromApi(response, dataTransformers.post.fromApi)
      },
      () => localStorage.getPostsByUser(userId),
      'Failed to fetch user posts'
    )
  }

  // Comments
  async addComment(postId: string, content: string, parentId?: string): Promise<boolean> {
    return this.executeWithFallback(
      async () => {
        const commentData = dataTransformers.comment.createToApi({ content, postId, parentId })
        await postsApi.comments.createComment(postId, commentData)
        return true
      },
      async () => {
        // 로컬 스토리지에서 댓글 추가 로직
        const post = await localStorage.getPost(postId)
        if (!post) return false

        const newComment = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          content,
          author: {
            id: 'current-user',
            email: 'current-user@example.com',
            name: 'Current User'
          },
          postId,
          parentId,
          createdAt: new Date().toISOString(),
          likes: []
        }

        const updatedComments = [...post.comments, newComment]
        const updatedPost = await localStorage.updatePost(postId, { comments: updatedComments })
        return !!updatedPost
      },
      'Failed to add comment'
    )
  }

  // Users
  async getUsers(options: { page?: number; limit?: number; search?: string } = {}): Promise<PaginatedResponse<User> | User[]> {
    return this.executeWithFallback(
      async () => {
        const response = await usersApi.getUsers(options)
        return dataTransformers.pagination.fromApi(response, dataTransformers.user.fromApi)
      },
      async () => {
        let users = await localStorage.getUsers()

        // 검색 필터링
        if (options.search) {
          const query = options.search.toLowerCase()
          users = users.filter(user =>
            user.name.toLowerCase().includes(query) ||
            user.email.toLowerCase().includes(query)
          )
        }

        // 페이지네이션
        if (options.page || options.limit) {
          const page = options.page || 1
          const limit = options.limit || 10
          const startIndex = (page - 1) * limit
          const endIndex = startIndex + limit
          const paginatedUsers = users.slice(startIndex, endIndex)

          return {
            data: paginatedUsers,
            pagination: {
              page,
              limit,
              total: users.length,
              totalPages: Math.ceil(users.length / limit),
              hasNext: endIndex < users.length,
              hasPrev: page > 1
            }
          }
        }

        return users
      },
      'Failed to fetch users'
    )
  }

  async getUser(id: string): Promise<User | null> {
    return this.executeWithFallback(
      async () => {
        const response = await usersApi.getUser(id)
        return dataTransformers.user.fromApi(response)
      },
      () => localStorage.getUser(id),
      'Failed to fetch user'
    )
  }

  async updateUser(id: string, updates: UpdateUserForm): Promise<User | null> {
    return this.executeWithFallback(
      async () => {
        const apiData = dataTransformers.user.updateToApi(updates)
        const response = await usersApi.updateUser(id, apiData)
        return dataTransformers.user.fromApi(response)
      },
      async () => {
        // 로컬 스토리지에서는 사용자 업데이트 제한적 지원
        const user = await localStorage.getUser(id)
        if (!user) return null

        const updatedUser = { ...user, ...updates }
        // 실제로는 localStorage에 사용자 데이터를 별도 저장해야 함
        return updatedUser
      },
      'Failed to update user'
    )
  }

  async updateUserBio(userId: string, bio: string): Promise<boolean> {
    return this.executeWithFallback(
      async () => {
        await usersApi.updateUserBio(userId, bio)
        return true
      },
      () => localStorage.updateUserBio(userId, bio),
      'Failed to update user bio'
    )
  }

  async getUserStats(userId: string): Promise<UserStats | null> {
    return this.executeWithFallback(
      async () => {
        const response = await usersApi.getUserStats(userId)
        return dataTransformers.stats.fromApi(response)
      },
      async () => {
        // 로컬 스토리지에서 통계 계산
        const posts = await localStorage.getPostsByUser(userId)
        const followRelation = await localStorage.getFollowRelation(userId)

        let totalComments = 0
        let totalLikes = 0

        posts.forEach(post => {
          totalComments += post.comments.length
          totalLikes += post.likes.length
        })

        return {
          totalPosts: posts.length,
          totalComments,
          totalLikes,
          totalFollowers: followRelation.followers.length,
          totalFollowing: followRelation.following.length
        }
      },
      'Failed to fetch user stats'
    )
  }

  // Follows
  async getFollowRelation(userId: string): Promise<FollowRelation> {
    return this.executeWithFallback(
      async () => {
        const response = await usersApi.follow.getFollowRelation(userId)
        return dataTransformers.follow.fromApi(response)
      },
      () => localStorage.getFollowRelation(userId),
      'Failed to fetch follow relation'
    )
  }

  async followUser(userId: string, targetUserId: string): Promise<boolean> {
    return this.executeWithFallback(
      async () => {
        await usersApi.follow.followUser(targetUserId)
        return true
      },
      () => localStorage.followUser(userId, targetUserId),
      'Failed to follow user'
    )
  }

  async unfollowUser(userId: string, targetUserId: string): Promise<boolean> {
    return this.executeWithFallback(
      async () => {
        await usersApi.follow.unfollowUser(targetUserId)
        return true
      },
      () => localStorage.unfollowUser(userId, targetUserId),
      'Failed to unfollow user'
    )
  }

  // Search
  async searchPosts(query: string, options: UsePostsOptions = {}): Promise<PaginatedResponse<Post> | Post[]> {
    return this.executeWithFallback(
      async () => {
        const response = await postsApi.searchPosts(query, options)
        return dataTransformers.pagination.fromApi(response, dataTransformers.post.fromApi)
      },
      () => localStorage.searchPosts(query),
      'Failed to search posts'
    )
  }

  async searchUsers(query: string, options: { page?: number; limit?: number } = {}): Promise<PaginatedResponse<User> | User[]> {
    return this.executeWithFallback(
      async () => {
        const response = await usersApi.searchUsers(query, options)
        return dataTransformers.pagination.fromApi(response, dataTransformers.user.fromApi)
      },
      async () => {
        const users = await localStorage.getUsers()
        return users.filter(user =>
          user.name.toLowerCase().includes(query.toLowerCase()) ||
          user.email.toLowerCase().includes(query.toLowerCase())
        )
      },
      'Failed to search users'
    )
  }

  // 설정 변경 메서드
  setUseAPI(useAPI: boolean) {
    this.useAPI = useAPI
    if (envUtils.isDevelopment()) {
      console.log('🔄 DataService API usage changed:', useAPI)
    }
  }

  setFallbackToLocalStorage(fallback: boolean) {
    this.fallbackToLocalStorage = fallback
    if (envUtils.isDevelopment()) {
      console.log('🔄 DataService fallback changed:', fallback)
    }
  }
}

// 싱글톤 인스턴스
export const dataService = new HybridDataService()

// 하위 호환성을 위한 기존 storageService 유지
export const storageService = dataService