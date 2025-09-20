import { apiClient } from '../index'
import { API_ENDPOINTS } from '@/lib/constants'
import type {
  User,
  UpdateUserForm,
  FollowRelation,
  UserStats,
  PaginatedResponse
} from '@/types'

export const usersApi = {
  // 사용자 목록 조회
  async getUsers(params: {
    page?: number
    limit?: number
    search?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  } = {}): Promise<PaginatedResponse<User>> {
    const response = await apiClient.get<PaginatedResponse<User>>(API_ENDPOINTS.USERS, params)
    return response.data!
  },

  // 개별 사용자 조회
  async getUser(id: string): Promise<User> {
    const response = await apiClient.get<User>(`${API_ENDPOINTS.USERS}/${id}`)
    return response.data!
  },

  // 현재 사용자 정보 조회
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>(`${API_ENDPOINTS.USERS}/me`)
    return response.data!
  },

  // 사용자 정보 수정
  async updateUser(id: string, updates: UpdateUserForm): Promise<User> {
    const response = await apiClient.patch<User>(`${API_ENDPOINTS.USERS}/${id}`, updates)
    return response.data!
  },

  // 현재 사용자 정보 수정
  async updateCurrentUser(updates: UpdateUserForm): Promise<User> {
    const response = await apiClient.patch<User>(`${API_ENDPOINTS.USERS}/me`, updates)
    return response.data!
  },

  // 사용자 바이오 업데이트
  async updateUserBio(userId: string, bio: string): Promise<User> {
    const response = await apiClient.patch<User>(`${API_ENDPOINTS.USERS}/${userId}`, { bio })
    return response.data!
  },

  // 사용자 검색
  async searchUsers(query: string, params: {
    page?: number
    limit?: number
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  } = {}): Promise<PaginatedResponse<User>> {
    const searchParams = {
      q: query,
      ...params
    }

    const response = await apiClient.get<PaginatedResponse<User>>(
      `${API_ENDPOINTS.SEARCH}/users`,
      searchParams
    )
    return response.data!
  },

  // 사용자 통계 조회
  async getUserStats(userId: string): Promise<UserStats> {
    const response = await apiClient.get<UserStats>(`${API_ENDPOINTS.USERS}/${userId}/stats`)
    return response.data!
  },

  // 현재 사용자 통계 조회
  async getCurrentUserStats(): Promise<UserStats> {
    const response = await apiClient.get<UserStats>(`${API_ENDPOINTS.USERS}/me/stats`)
    return response.data!
  },

  // 팔로우 관련 API
  follow: {
    // 팔로우 관계 조회
    async getFollowRelation(userId: string): Promise<FollowRelation> {
      const response = await apiClient.get<FollowRelation>(`${API_ENDPOINTS.USERS}/${userId}/follow`)
      return response.data!
    },

    // 현재 사용자 팔로우 관계 조회
    async getCurrentUserFollowRelation(): Promise<FollowRelation> {
      const response = await apiClient.get<FollowRelation>(`${API_ENDPOINTS.USERS}/me/follow`)
      return response.data!
    },

    // 사용자 팔로우
    async followUser(targetUserId: string): Promise<FollowRelation> {
      const response = await apiClient.post<FollowRelation>(
        `${API_ENDPOINTS.FOLLOWS}`,
        { targetUserId }
      )
      return response.data!
    },

    // 사용자 언팔로우
    async unfollowUser(targetUserId: string): Promise<FollowRelation> {
      const response = await apiClient.delete<FollowRelation>(
        `${API_ENDPOINTS.FOLLOWS}/${targetUserId}`
      )
      return response.data!
    },

    // 팔로워 목록 조회
    async getFollowers(userId: string, params: {
      page?: number
      limit?: number
    } = {}): Promise<PaginatedResponse<User>> {
      const response = await apiClient.get<PaginatedResponse<User>>(
        `${API_ENDPOINTS.USERS}/${userId}/followers`,
        params
      )
      return response.data!
    },

    // 팔로잉 목록 조회
    async getFollowing(userId: string, params: {
      page?: number
      limit?: number
    } = {}): Promise<PaginatedResponse<User>> {
      const response = await apiClient.get<PaginatedResponse<User>>(
        `${API_ENDPOINTS.USERS}/${userId}/following`,
        params
      )
      return response.data!
    },

    // 현재 사용자의 팔로워 목록
    async getCurrentUserFollowers(params: {
      page?: number
      limit?: number
    } = {}): Promise<PaginatedResponse<User>> {
      const response = await apiClient.get<PaginatedResponse<User>>(
        `${API_ENDPOINTS.USERS}/me/followers`,
        params
      )
      return response.data!
    },

    // 현재 사용자의 팔로잉 목록
    async getCurrentUserFollowing(params: {
      page?: number
      limit?: number
    } = {}): Promise<PaginatedResponse<User>> {
      const response = await apiClient.get<PaginatedResponse<User>>(
        `${API_ENDPOINTS.USERS}/me/following`,
        params
      )
      return response.data!
    },

    // 팔로우 상태 확인
    async checkFollowStatus(targetUserId: string): Promise<{ isFollowing: boolean }> {
      const response = await apiClient.get<{ isFollowing: boolean }>(
        `${API_ENDPOINTS.FOLLOWS}/${targetUserId}/status`
      )
      return response.data!
    }
  }
}