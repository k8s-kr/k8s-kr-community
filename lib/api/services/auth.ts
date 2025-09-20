import { apiClient } from '../index'
import { API_ENDPOINTS } from '@/lib/constants'
import type { User } from '@/types'

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  name: string
  githubUsername?: string
}

export interface AuthResponse {
  user: User
  token: string
  refreshToken?: string
  expiresIn: number
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface ResetPasswordRequest {
  email: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

export const authApi = {
  // 로그인
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(`${API_ENDPOINTS.AUTH}/login`, credentials)
    return response.data!
  },

  // 회원가입
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(`${API_ENDPOINTS.AUTH}/register`, userData)
    return response.data!
  },

  // 로그아웃
  async logout(): Promise<void> {
    await apiClient.post(`${API_ENDPOINTS.AUTH}/logout`)
  },

  // 토큰 갱신
  async refreshToken(request: RefreshTokenRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(`${API_ENDPOINTS.AUTH}/refresh`, request)
    return response.data!
  },

  // 현재 사용자 정보 조회
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>(`${API_ENDPOINTS.AUTH}/me`)
    return response.data!
  },

  // 비밀번호 재설정 요청
  async requestPasswordReset(request: ResetPasswordRequest): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>(
      `${API_ENDPOINTS.AUTH}/password/reset`,
      request
    )
    return response.data!
  },

  // 비밀번호 재설정 확인
  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>(
      `${API_ENDPOINTS.AUTH}/password/reset/confirm`,
      { token, newPassword }
    )
    return response.data!
  },

  // 비밀번호 변경
  async changePassword(request: ChangePasswordRequest): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>(
      `${API_ENDPOINTS.AUTH}/password/change`,
      request
    )
    return response.data!
  },

  // 이메일 인증 요청
  async requestEmailVerification(): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>(
      `${API_ENDPOINTS.AUTH}/email/verify/request`
    )
    return response.data!
  },

  // 이메일 인증 확인
  async verifyEmail(token: string): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>(
      `${API_ENDPOINTS.AUTH}/email/verify/confirm`,
      { token }
    )
    return response.data!
  },

  // 계정 삭제
  async deleteAccount(password: string): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(
      `${API_ENDPOINTS.AUTH}/account`,
      { body: { password } }
    )
    return response.data!
  },

  // OAuth 관련
  oauth: {
    // GitHub OAuth URL 가져오기
    async getGitHubAuthUrl(): Promise<{ url: string }> {
      const response = await apiClient.get<{ url: string }>(`${API_ENDPOINTS.AUTH}/oauth/github/url`)
      return response.data!
    },

    // GitHub OAuth 콜백 처리
    async handleGitHubCallback(code: string, state?: string): Promise<AuthResponse> {
      const response = await apiClient.post<AuthResponse>(
        `${API_ENDPOINTS.AUTH}/oauth/github/callback`,
        { code, state }
      )
      return response.data!
    },

    // OAuth 계정 연동
    async linkGitHubAccount(code: string): Promise<User> {
      const response = await apiClient.post<User>(
        `${API_ENDPOINTS.AUTH}/oauth/github/link`,
        { code }
      )
      return response.data!
    },

    // OAuth 계정 연동 해제
    async unlinkGitHubAccount(): Promise<User> {
      const response = await apiClient.delete<User>(`${API_ENDPOINTS.AUTH}/oauth/github/link`)
      return response.data!
    }
  }
}