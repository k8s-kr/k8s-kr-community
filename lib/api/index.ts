import { ApiClient } from './client'
import { env } from '@/lib/config/environment'

// API 클라이언트 인스턴스 생성
export const apiClient = new ApiClient({
  baseURL: env.API_BASE_URL,
  timeout: env.API_TIMEOUT,
  retries: env.API_RETRIES,
  headers: {
    'Content-Type': 'application/json',
    'X-Client-Version': env.APP_VERSION,
  }
})

// 인증 토큰 관리
export const authApi = {
  setToken: (token: string) => {
    apiClient.setAuthToken(token)
    // 클라이언트 사이드에서만 localStorage 사용
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token)
    }
  },

  removeToken: () => {
    apiClient.removeAuthToken()
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
    }
  },

  getToken: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token')
    }
    return null
  },

  initializeFromStorage: () => {
    const token = authApi.getToken()
    if (token) {
      apiClient.setAuthToken(token)
    }
  }
}

// 클라이언트 사이드 초기화
if (typeof window !== 'undefined') {
  authApi.initializeFromStorage()
}

export { ApiClient, ApiError } from './client'
export * from './services'