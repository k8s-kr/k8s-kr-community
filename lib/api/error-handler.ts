import { ApiError } from './client'
import { errorTransformers } from './transformers'
import { envUtils } from '@/lib/config/environment'

// 에러 타입 정의
export enum ErrorType {
  NETWORK = 'NETWORK',
  TIMEOUT = 'TIMEOUT',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  VALIDATION = 'VALIDATION',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  RATE_LIMIT = 'RATE_LIMIT',
  SERVER_ERROR = 'SERVER_ERROR',
  UNKNOWN = 'UNKNOWN'
}

export interface ErrorContext {
  operation: string
  userId?: string
  data?: any
  timestamp: string
}

export interface ErrorHandlerConfig {
  enableLogging: boolean
  enableRetry: boolean
  maxRetries: number
  retryDelay: number
  enableFallback: boolean
  showUserFriendlyMessages: boolean
}

export class ErrorHandler {
  private config: ErrorHandlerConfig

  constructor(config: Partial<ErrorHandlerConfig> = {}) {
    this.config = {
      enableLogging: envUtils.isDevelopment(),
      enableRetry: true,
      maxRetries: 3,
      retryDelay: 1000,
      enableFallback: true,
      showUserFriendlyMessages: true,
      ...config
    }
  }

  // 에러 타입 분류
  classifyError(error: any): ErrorType {
    if (error instanceof ApiError) {
      if (error.status === 0 || error.code === 'NETWORK_ERROR') {
        return ErrorType.NETWORK
      }
      if (error.code === 'TIMEOUT') {
        return ErrorType.TIMEOUT
      }
      if (error.status === 401) {
        return ErrorType.AUTHENTICATION
      }
      if (error.status === 403) {
        return ErrorType.AUTHORIZATION
      }
      if (error.status === 404) {
        return ErrorType.NOT_FOUND
      }
      if (error.status === 409) {
        return ErrorType.CONFLICT
      }
      if (error.status === 422) {
        return ErrorType.VALIDATION
      }
      if (error.status === 429) {
        return ErrorType.RATE_LIMIT
      }
      if (error.status && error.status >= 500) {
        return ErrorType.SERVER_ERROR
      }
    }

    if (error.name === 'TypeError' || error.message?.includes('network')) {
      return ErrorType.NETWORK
    }

    return ErrorType.UNKNOWN
  }

  // 재시도 가능한 에러인지 확인
  isRetryable(errorType: ErrorType): boolean {
    return [
      ErrorType.NETWORK,
      ErrorType.TIMEOUT,
      ErrorType.SERVER_ERROR,
      ErrorType.RATE_LIMIT
    ].includes(errorType)
  }

  // 사용자 친화적 메시지 생성
  getUserFriendlyMessage(errorType: ErrorType, originalMessage?: string): string {
    const friendlyMessages = {
      [ErrorType.NETWORK]: '네트워크 연결을 확인해주세요.',
      [ErrorType.TIMEOUT]: '요청 시간이 초과되었습니다. 다시 시도해주세요.',
      [ErrorType.AUTHENTICATION]: '로그인이 필요합니다.',
      [ErrorType.AUTHORIZATION]: '권한이 없습니다.',
      [ErrorType.VALIDATION]: '입력한 정보를 확인해주세요.',
      [ErrorType.NOT_FOUND]: '요청한 리소스를 찾을 수 없습니다.',
      [ErrorType.CONFLICT]: '이미 존재하는 데이터입니다.',
      [ErrorType.RATE_LIMIT]: '너무 많은 요청을 보냈습니다. 잠시 후 다시 시도해주세요.',
      [ErrorType.SERVER_ERROR]: '서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
      [ErrorType.UNKNOWN]: '알 수 없는 오류가 발생했습니다.'
    }

    if (this.config.showUserFriendlyMessages) {
      return friendlyMessages[errorType]
    }

    return originalMessage || friendlyMessages[errorType]
  }

  // 에러 로깅
  logError(error: any, context: ErrorContext): void {
    if (!this.config.enableLogging) return

    const errorType = this.classifyError(error)
    const logData = {
      type: errorType,
      message: error.message,
      status: error.status,
      code: error.code,
      context,
      stack: envUtils.isDevelopment() ? error.stack : undefined,
      timestamp: new Date().toISOString()
    }

    if (errorType === ErrorType.SERVER_ERROR || errorType === ErrorType.UNKNOWN) {
      console.error('🚨 Critical Error:', logData)
    } else if (envUtils.isDevelopment()) {
      console.warn('⚠️ API Error:', logData)
    }

    // 프로덕션에서는 외부 로깅 서비스로 전송
    if (envUtils.isProduction()) {
      this.sendToLoggingService(logData)
    }
  }

  // 에러 처리 메인 함수
  async handleError<T>(
    error: any,
    context: ErrorContext,
    fallbackFn?: () => Promise<T> | T
  ): Promise<never | T> {
    const errorType = this.classifyError(error)

    // 에러 로깅
    this.logError(error, context)

    // 재시도 가능한 에러면서 재시도가 활성화된 경우
    if (this.config.enableRetry && this.isRetryable(errorType)) {
      // 재시도는 호출하는 곳에서 처리하도록 함
      throw new EnhancedError(error, errorType, context, { canRetry: true })
    }

    // Fallback 함수가 있고 fallback이 활성화된 경우
    if (this.config.enableFallback && fallbackFn) {
      try {
        return await fallbackFn()
      } catch (fallbackError) {
        this.logError(fallbackError, { ...context, operation: `${context.operation}_fallback` })
        throw new EnhancedError(fallbackError, this.classifyError(fallbackError), context)
      }
    }

    // 최종 에러 던지기
    throw new EnhancedError(error, errorType, context)
  }

  // 재시도 로직
  async withRetry<T>(
    operation: () => Promise<T>,
    context: ErrorContext,
    maxRetries?: number
  ): Promise<T> {
    const retries = maxRetries ?? this.config.maxRetries
    let lastError: any

    for (let attempt = 1; attempt <= retries + 1; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error
        const errorType = this.classifyError(error)

        if (attempt > retries || !this.isRetryable(errorType)) {
          break
        }

        if (this.config.enableLogging) {
          console.warn(`🔄 Retry attempt ${attempt}/${retries} for ${context.operation}`)
        }

        // 지수 백오프
        const delay = this.config.retryDelay * Math.pow(2, attempt - 1)
        await this.sleep(delay)
      }
    }

    throw lastError
  }

  // 배치 작업 에러 처리
  async handleBatchOperation<T, R>(
    items: T[],
    operation: (item: T) => Promise<R>,
    context: ErrorContext
  ): Promise<{ results: R[]; errors: Array<{ item: T; error: any }> }> {
    const results: R[] = []
    const errors: Array<{ item: T; error: any }> = []

    for (const item of items) {
      try {
        const result = await operation(item)
        results.push(result)
      } catch (error) {
        errors.push({ item, error })
        this.logError(error, {
          ...context,
          operation: `${context.operation}_batch_item`,
          data: item
        })
      }
    }

    return { results, errors }
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  private async sendToLoggingService(logData: any): Promise<void> {
    try {
      // 실제 로깅 서비스 연동 (예: Sentry, LogRocket 등)
      // await fetch('/api/logs', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(logData)
      // })
    } catch (error) {
      console.error('Failed to send error to logging service:', error)
    }
  }
}

// 강화된 에러 클래스
export class EnhancedError extends Error {
  public readonly errorType: ErrorType
  public readonly context: ErrorContext
  public readonly userMessage: string
  public readonly canRetry: boolean
  public readonly originalError: any

  constructor(
    originalError: any,
    errorType: ErrorType,
    context: ErrorContext,
    options: { canRetry?: boolean } = {}
  ) {
    const message = originalError.message || 'Unknown error occurred'
    super(message)

    this.name = 'EnhancedError'
    this.originalError = originalError
    this.errorType = errorType
    this.context = context
    this.canRetry = options.canRetry || false

    // 사용자 친화적 메시지 생성
    const errorHandler = new ErrorHandler()
    this.userMessage = errorHandler.getUserFriendlyMessage(errorType, message)

    // 스택 트레이스 보존
    if (originalError.stack) {
      this.stack = originalError.stack
    }
  }

  // API 에러로부터 생성
  static fromApiError(apiError: ApiError, context: ErrorContext): EnhancedError {
    const errorHandler = new ErrorHandler()
    const errorType = errorHandler.classifyError(apiError)
    return new EnhancedError(apiError, errorType, context)
  }

  // 에러 정보를 JSON으로 직렬화
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      userMessage: this.userMessage,
      errorType: this.errorType,
      context: this.context,
      canRetry: this.canRetry,
      timestamp: new Date().toISOString()
    }
  }
}

// 싱글톤 에러 핸들러
export const errorHandler = new ErrorHandler()

// 유틸리티 함수들
export const errorUtils = {
  // React 컴포넌트에서 사용할 에러 처리
  handleComponentError: (error: any, componentName: string) => {
    const context: ErrorContext = {
      operation: `component_${componentName}`,
      timestamp: new Date().toISOString()
    }

    return errorHandler.handleError(error, context)
  },

  // Hook에서 사용할 에러 처리
  handleHookError: (error: any, hookName: string, data?: any) => {
    const context: ErrorContext = {
      operation: `hook_${hookName}`,
      data,
      timestamp: new Date().toISOString()
    }

    return errorHandler.handleError(error, context)
  },

  // API 서비스에서 사용할 에러 처리
  handleServiceError: (error: any, serviceName: string, methodName: string, data?: any) => {
    const context: ErrorContext = {
      operation: `${serviceName}_${methodName}`,
      data,
      timestamp: new Date().toISOString()
    }

    return errorHandler.handleError(error, context)
  }
}