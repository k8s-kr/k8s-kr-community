import { useState, useEffect, useCallback } from 'react'
import { dataService } from '@/lib/services/data-service'
import { errorHandler, EnhancedError } from '@/lib/api/error-handler'
import type { PaginatedResponse } from '@/types'

// API 데이터 로딩 훅의 옵션 타입
export interface UseApiDataOptions<T> {
  // 자동 로드 여부
  autoLoad?: boolean
  // 캐시 키 (동일한 키의 데이터는 캐시됨)
  cacheKey?: string
  // 캐시 만료 시간 (ms)
  cacheTime?: number
  // 재시도 옵션
  retry?: {
    enabled?: boolean
    maxAttempts?: number
    delay?: number
  }
  // 데이터 변환 함수
  transform?: (data: any) => T
  // 의존성 배열 (변경 시 다시 로드)
  deps?: any[]
}

// API 데이터 로딩 결과 타입
export interface UseApiDataResult<T> {
  data: T | null
  loading: boolean
  error: EnhancedError | null
  refresh: () => Promise<void>
  mutate: (newData: T | null) => void
}

// 페이지네이션 지원 API 데이터 로딩 결과 타입
export interface UseApiPaginatedDataResult<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  } | null
  loading: boolean
  error: EnhancedError | null
  refresh: () => Promise<void>
  setPage: (page: number) => void
  setLimit: (limit: number) => void
}

// 간단한 캐시 구현
class SimpleCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>()

  set(key: string, data: any, ttl: number = 5 * 60 * 1000) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }

  get(key: string): any | null {
    const item = this.cache.get(key)
    if (!item) return null

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }

    return item.data
  }

  delete(key: string) {
    this.cache.delete(key)
  }

  clear() {
    this.cache.clear()
  }
}

const cache = new SimpleCache()

// 기본 API 데이터 로딩 훅
export function useApiData<T>(
  apiCall: () => Promise<T>,
  options: UseApiDataOptions<T> = {}
): UseApiDataResult<T> {
  const {
    autoLoad = true,
    cacheKey,
    cacheTime = 5 * 60 * 1000, // 5분 기본 캐시
    retry = { enabled: true, maxAttempts: 3, delay: 1000 },
    transform,
    deps = []
  } = options

  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<EnhancedError | null>(null)

  // 캐시에서 데이터 로드
  useEffect(() => {
    if (cacheKey) {
      const cachedData = cache.get(cacheKey)
      if (cachedData) {
        setData(transform ? transform(cachedData) : cachedData)
      }
    }
  }, [cacheKey, transform])

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await errorHandler.withRetry(
        apiCall,
        {
          operation: 'api_data_load',
          timestamp: new Date().toISOString()
        },
        retry.enabled ? retry.maxAttempts : 1
      )

      const transformedData = transform ? transform(result) : result
      setData(transformedData)

      // 캐시에 저장
      if (cacheKey) {
        cache.set(cacheKey, result, cacheTime)
      }
    } catch (err) {
      const enhancedError = err instanceof EnhancedError
        ? err
        : new EnhancedError(err, errorHandler.classifyError(err), {
            operation: 'api_data_load',
            timestamp: new Date().toISOString()
          })

      setError(enhancedError)
      console.error('API data loading failed:', enhancedError)
    } finally {
      setLoading(false)
    }
  }, [apiCall, transform, cacheKey, cacheTime, retry, ...deps])

  // 자동 로드
  useEffect(() => {
    if (autoLoad) {
      loadData()
    }
  }, [autoLoad, loadData])

  // 데이터 직접 변경 (Optimistic updates용)
  const mutate = useCallback((newData: T | null) => {
    setData(newData)
    if (cacheKey && newData) {
      cache.set(cacheKey, newData, cacheTime)
    }
  }, [cacheKey, cacheTime])

  return {
    data,
    loading,
    error,
    refresh: loadData,
    mutate
  }
}

// 페이지네이션 지원 API 데이터 로딩 훅
export function useApiPaginatedData<T>(
  apiCall: (page: number, limit: number) => Promise<PaginatedResponse<T> | T[]>,
  options: UseApiDataOptions<T> & {
    initialPage?: number
    initialLimit?: number
  } = {}
): UseApiPaginatedDataResult<T> {
  const {
    initialPage = 1,
    initialLimit = 10,
    autoLoad = true,
    cacheKey,
    cacheTime = 5 * 60 * 1000,
    retry = { enabled: true, maxAttempts: 3, delay: 1000 },
    transform,
    deps = []
  } = options

  const [data, setData] = useState<T[]>([])
  const [pagination, setPagination] = useState<UseApiPaginatedDataResult<T>['pagination']>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<EnhancedError | null>(null)
  const [page, setPage] = useState(initialPage)
  const [limit, setLimit] = useState(initialLimit)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const cacheKeyWithParams = cacheKey ? `${cacheKey}_${page}_${limit}` : undefined

      // 캐시 확인
      if (cacheKeyWithParams) {
        const cachedData = cache.get(cacheKeyWithParams)
        if (cachedData) {
          if (Array.isArray(cachedData)) {
            setData(cachedData)
            setPagination(null)
          } else {
            setData(cachedData.data || [])
            setPagination(cachedData.pagination || null)
          }
          setLoading(false)
          return
        }
      }

      const result = await errorHandler.withRetry(
        () => apiCall(page, limit),
        {
          operation: 'api_paginated_data_load',
          data: { page, limit },
          timestamp: new Date().toISOString()
        },
        retry.enabled ? retry.maxAttempts : 1
      )

      let finalData: T[]
      let finalPagination: any = null

      if (Array.isArray(result)) {
        finalData = result
      } else {
        finalData = result.data || []
        finalPagination = result.pagination
      }

      if (transform) {
        finalData = finalData.map(transform)
      }

      setData(finalData)
      setPagination(finalPagination)

      // 캐시에 저장
      if (cacheKeyWithParams) {
        cache.set(cacheKeyWithParams, result, cacheTime)
      }
    } catch (err) {
      const enhancedError = err instanceof EnhancedError
        ? err
        : new EnhancedError(err, errorHandler.classifyError(err), {
            operation: 'api_paginated_data_load',
            data: { page, limit },
            timestamp: new Date().toISOString()
          })

      setError(enhancedError)
      console.error('API paginated data loading failed:', enhancedError)
    } finally {
      setLoading(false)
    }
  }, [apiCall, page, limit, transform, cacheKey, cacheTime, retry, ...deps])

  // 자동 로드
  useEffect(() => {
    if (autoLoad) {
      loadData()
    }
  }, [autoLoad, loadData])

  const handleSetPage = useCallback((newPage: number) => {
    setPage(newPage)
  }, [])

  const handleSetLimit = useCallback((newLimit: number) => {
    setLimit(newLimit)
    setPage(1) // 페이지 크기 변경 시 첫 페이지로
  }, [])

  return {
    data,
    pagination,
    loading,
    error,
    refresh: loadData,
    setPage: handleSetPage,
    setLimit: handleSetLimit
  }
}

// API 뮤테이션 훅 (POST, PUT, DELETE 등)
export interface UseApiMutationOptions<TData, TVariables> {
  onSuccess?: (data: TData, variables: TVariables) => void
  onError?: (error: EnhancedError, variables: TVariables) => void
  onSettled?: (data: TData | null, error: EnhancedError | null, variables: TVariables) => void
  // Optimistic update 함수
  optimisticUpdate?: (variables: TVariables) => void
  // 성공 후 무효화할 캐시 키들
  invalidateKeys?: string[]
}

export interface UseApiMutationResult<TData, TVariables> {
  mutate: (variables: TVariables) => Promise<TData>
  mutateAsync: (variables: TVariables) => Promise<TData>
  loading: boolean
  error: EnhancedError | null
  data: TData | null
  reset: () => void
}

export function useApiMutation<TData = any, TVariables = any>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: UseApiMutationOptions<TData, TVariables> = {}
): UseApiMutationResult<TData, TVariables> {
  const {
    onSuccess,
    onError,
    onSettled,
    optimisticUpdate,
    invalidateKeys = []
  } = options

  const [data, setData] = useState<TData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<EnhancedError | null>(null)

  const mutate = useCallback(async (variables: TVariables): Promise<TData> => {
    setLoading(true)
    setError(null)

    // Optimistic update
    if (optimisticUpdate) {
      optimisticUpdate(variables)
    }

    try {
      const result = await mutationFn(variables)
      setData(result)

      // 캐시 무효화
      invalidateKeys.forEach(key => {
        cache.delete(key)
      })

      onSuccess?.(result, variables)
      onSettled?.(result, null, variables)

      return result
    } catch (err) {
      const enhancedError = err instanceof EnhancedError
        ? err
        : new EnhancedError(err, errorHandler.classifyError(err), {
            operation: 'api_mutation',
            data: variables,
            timestamp: new Date().toISOString()
          })

      setError(enhancedError)
      onError?.(enhancedError, variables)
      onSettled?.(null, enhancedError, variables)

      throw enhancedError
    } finally {
      setLoading(false)
    }
  }, [mutationFn, onSuccess, onError, onSettled, optimisticUpdate, invalidateKeys])

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setLoading(false)
  }, [])

  return {
    mutate,
    mutateAsync: mutate,
    loading,
    error,
    data,
    reset
  }
}

// 캐시 관리 유틸리티
export const cacheUtils = {
  // 특정 키의 캐시 삭제
  invalidate: (key: string) => {
    cache.delete(key)
  },

  // 패턴에 맞는 캐시들 삭제
  invalidatePattern: (pattern: string) => {
    const regex = new RegExp(pattern)
    cache.clear() // 간단한 구현, 실제로는 키 패턴 매칭 필요
  },

  // 모든 캐시 삭제
  clear: () => {
    cache.clear()
  },

  // 캐시 상태 확인
  has: (key: string) => {
    return cache.get(key) !== null
  }
}