import { ApiResponse } from '@/types'

export interface ApiClientConfig {
  baseURL: string
  timeout?: number
  headers?: Record<string, string>
  retries?: number
  retryDelay?: number
}

export interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  headers?: Record<string, string>
  params?: Record<string, any>
  body?: any
  timeout?: number
  signal?: AbortSignal
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
    public response?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }

  static fromResponse(response: Response, data?: any): ApiError {
    const message = data?.message || data?.error || `HTTP ${response.status}: ${response.statusText}`
    return new ApiError(message, response.status, data?.code, data)
  }

  static network(message: string = 'Network error occurred'): ApiError {
    return new ApiError(message, 0, 'NETWORK_ERROR')
  }

  static timeout(message: string = 'Request timeout'): ApiError {
    return new ApiError(message, 0, 'TIMEOUT')
  }

  static cancelled(message: string = 'Request cancelled'): ApiError {
    return new ApiError(message, 0, 'CANCELLED')
  }
}

export class ApiClient {
  private config: Required<ApiClientConfig>

  constructor(config: ApiClientConfig) {
    this.config = {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
      retries: 3,
      retryDelay: 1000,
      ...config,
    }
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  private shouldRetry(error: ApiError, attempt: number): boolean {
    if (attempt >= this.config.retries) return false

    // Retry on network errors or 5xx server errors
    return (
      error.status === 0 ||
      (error.status !== undefined && error.status >= 500) ||
      error.code === 'NETWORK_ERROR'
    )
  }

  private buildURL(endpoint: string, params?: Record<string, any>): string {
    const url = new URL(endpoint, this.config.baseURL)

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value))
        }
      })
    }

    return url.toString()
  }

  private async executeRequest<T>(
    url: string,
    config: RequestConfig,
    attempt: number = 1
  ): Promise<ApiResponse<T>> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), config.timeout || this.config.timeout)

    try {
      const response = await fetch(url, {
        method: config.method || 'GET',
        headers: {
          ...this.config.headers,
          ...config.headers,
        },
        body: config.body ? JSON.stringify(config.body) : undefined,
        signal: config.signal || controller.signal,
      })

      clearTimeout(timeoutId)

      let data: any
      const contentType = response.headers.get('content-type')

      if (contentType?.includes('application/json')) {
        data = await response.json()
      } else {
        data = await response.text()
      }

      if (!response.ok) {
        const error = ApiError.fromResponse(response, data)

        if (this.shouldRetry(error, attempt)) {
          await this.sleep(this.config.retryDelay * attempt)
          return this.executeRequest(url, config, attempt + 1)
        }

        throw error
      }

      // API가 ApiResponse 형태로 응답하는 경우
      if (data && typeof data === 'object' && 'success' in data) {
        return data as ApiResponse<T>
      }

      // 단순 데이터 응답인 경우 ApiResponse로 래핑
      return {
        success: true,
        data: data as T
      }

    } catch (error) {
      clearTimeout(timeoutId)

      if (error instanceof ApiError) {
        throw error
      }

      let apiError: ApiError

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          apiError = ApiError.cancelled()
        } else if (error.message.includes('fetch')) {
          apiError = ApiError.network(error.message)
        } else {
          apiError = new ApiError(error.message)
        }
      } else {
        apiError = new ApiError('Unknown error occurred')
      }

      if (this.shouldRetry(apiError, attempt)) {
        await this.sleep(this.config.retryDelay * attempt)
        return this.executeRequest(url, config, attempt + 1)
      }

      throw apiError
    }
  }

  async request<T = any>(endpoint: string, config: RequestConfig = {}): Promise<ApiResponse<T>> {
    const url = this.buildURL(endpoint, config.params)
    return this.executeRequest<T>(url, config)
  }

  async get<T = any>(endpoint: string, params?: Record<string, any>, config: Omit<RequestConfig, 'method' | 'params'> = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'GET', params })
  }

  async post<T = any>(endpoint: string, body?: any, config: Omit<RequestConfig, 'method' | 'body'> = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'POST', body })
  }

  async put<T = any>(endpoint: string, body?: any, config: Omit<RequestConfig, 'method' | 'body'> = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'PUT', body })
  }

  async patch<T = any>(endpoint: string, body?: any, config: Omit<RequestConfig, 'method' | 'body'> = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'PATCH', body })
  }

  async delete<T = any>(endpoint: string, config: Omit<RequestConfig, 'method'> = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' })
  }

  // 인증 토큰 설정
  setAuthToken(token: string) {
    this.config.headers['Authorization'] = `Bearer ${token}`
  }

  // 인증 토큰 제거
  removeAuthToken() {
    delete this.config.headers['Authorization']
  }

  // 요청 취소를 위한 AbortController 생성
  createAbortController(): AbortController {
    return new AbortController()
  }
}