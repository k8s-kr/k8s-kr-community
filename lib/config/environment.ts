// 환경 변수 타입 정의
export interface EnvironmentConfig {
  // API 설정
  API_BASE_URL: string
  API_TIMEOUT: number
  API_RETRIES: number

  // 인증 설정
  NEXTAUTH_URL: string
  NEXTAUTH_SECRET: string

  // GitHub OAuth 설정
  GITHUB_ID?: string
  GITHUB_SECRET?: string

  // 개발 관련 설정
  NODE_ENV: 'development' | 'production' | 'test'
  ENABLE_API: boolean
  USE_LOCAL_STORAGE: boolean

  // 기타 설정
  APP_NAME: string
  APP_VERSION: string
}

// 환경 변수 기본값
const defaultConfig: Partial<EnvironmentConfig> = {
  API_TIMEOUT: 10000,
  API_RETRIES: 3,
  APP_NAME: 'Kubernetes Community',
  APP_VERSION: '1.0.0',
  ENABLE_API: false,
  USE_LOCAL_STORAGE: true,
}

// 환경 변수 파싱 유틸리티
function parseBoolean(value: string | undefined, defaultValue: boolean = false): boolean {
  if (!value) return defaultValue
  return value.toLowerCase() === 'true'
}

function parseNumber(value: string | undefined, defaultValue: number): number {
  if (!value) return defaultValue
  const parsed = parseInt(value, 10)
  return isNaN(parsed) ? defaultValue : parsed
}

function parseString(value: string | undefined, defaultValue: string): string {
  return value || defaultValue
}

// 환경 변수 로드 및 검증
function loadEnvironmentConfig(): EnvironmentConfig {
  const config: EnvironmentConfig = {
    // API 설정
    API_BASE_URL: parseString(
      process.env.NEXT_PUBLIC_API_BASE_URL,
      process.env.NODE_ENV === 'production'
        ? 'https://api.kubernetes-community.com'
        : 'http://localhost:3001/api'
    ),
    API_TIMEOUT: parseNumber(process.env.NEXT_PUBLIC_API_TIMEOUT, defaultConfig.API_TIMEOUT!),
    API_RETRIES: parseNumber(process.env.NEXT_PUBLIC_API_RETRIES, defaultConfig.API_RETRIES!),

    // 인증 설정
    NEXTAUTH_URL: parseString(
      process.env.NEXTAUTH_URL,
      process.env.NODE_ENV === 'production'
        ? 'https://kubernetes-community.com'
        : 'http://localhost:3000'
    ),
    NEXTAUTH_SECRET: parseString(process.env.NEXTAUTH_SECRET, 'development-secret-key'),

    // GitHub OAuth 설정
    GITHUB_ID: process.env.GITHUB_ID,
    GITHUB_SECRET: process.env.GITHUB_SECRET,

    // 개발 관련 설정
    NODE_ENV: (process.env.NODE_ENV as 'development' | 'production' | 'test') || 'development',
    ENABLE_API: parseBoolean(process.env.NEXT_PUBLIC_ENABLE_API, defaultConfig.ENABLE_API!),
    USE_LOCAL_STORAGE: parseBoolean(process.env.NEXT_PUBLIC_USE_LOCAL_STORAGE, defaultConfig.USE_LOCAL_STORAGE!),

    // 기타 설정
    APP_NAME: parseString(process.env.NEXT_PUBLIC_APP_NAME, defaultConfig.APP_NAME!),
    APP_VERSION: parseString(process.env.NEXT_PUBLIC_APP_VERSION, defaultConfig.APP_VERSION!),
  }

  // 필수 환경 변수 검증
  if (config.ENABLE_API && !config.API_BASE_URL) {
    throw new Error('API_BASE_URL is required when ENABLE_API is true')
  }

  if (config.NODE_ENV === 'production') {
    if (!config.NEXTAUTH_SECRET || config.NEXTAUTH_SECRET === 'development-secret-key') {
      throw new Error('NEXTAUTH_SECRET must be set in production')
    }
  }

  return config
}

// 환경 설정 싱글톤
export const env = loadEnvironmentConfig()

// 환경별 유틸리티 함수
export const envUtils = {
  isDevelopment: () => env.NODE_ENV === 'development',
  isProduction: () => env.NODE_ENV === 'production',
  isTest: () => env.NODE_ENV === 'test',

  shouldUseAPI: () => env.ENABLE_API,
  shouldUseLocalStorage: () => env.USE_LOCAL_STORAGE,

  getApiBaseUrl: () => env.API_BASE_URL,
  getAuthUrl: () => env.NEXTAUTH_URL,

  // 로깅 레벨 결정
  getLogLevel: () => {
    if (env.NODE_ENV === 'production') return 'error'
    if (env.NODE_ENV === 'test') return 'silent'
    return 'debug'
  },

  // 피처 플래그
  isFeatureEnabled: (feature: string): boolean => {
    const envKey = `NEXT_PUBLIC_FEATURE_${feature.toUpperCase()}`
    return parseBoolean(process.env[envKey], false)
  }
}

// 개발용 환경 설정 출력
if (envUtils.isDevelopment()) {
  console.log('🔧 Environment Configuration:', {
    NODE_ENV: env.NODE_ENV,
    API_BASE_URL: env.API_BASE_URL,
    ENABLE_API: env.ENABLE_API,
    USE_LOCAL_STORAGE: env.USE_LOCAL_STORAGE,
  })
}