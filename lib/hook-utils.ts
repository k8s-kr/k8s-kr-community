import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { dataService } from '@/lib/services/data-service'
import { errorHandler, ErrorType, EnhancedError } from '@/lib/api/error-handler'
import { paginationUtils, searchUtils } from '@/lib/helpers'
import { PAGINATION } from '@/lib/constants'

// 공통 상태 관리 인터페이스
export interface CommonState<T> {
  data: T[]
  filteredData: T[]
  loading: boolean
  error: string | null
  page: number
  searchQuery: string
}

// 공통 페이지네이션 상태
export interface PaginationState {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

// 공통 데이터 로딩 훅
export const useDataLoader = <T>(
  loadFn: () => Promise<T[]>,
  deps: any[] = []
) => {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await loadFn()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : '데이터를 불러오는 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }, deps)

  useEffect(() => {
    load()
  }, [load])

  return { data, setData, loading, error, refresh: load }
}

// 공통 검색 및 필터링 훅
export const useSearchAndFilter = <T>(
  allData: T[],
  filterFn: (data: T[], query: string) => T[],
  initialPage: number = PAGINATION.DEFAULT_PAGE,
  limit: number = PAGINATION.POSTS_PER_PAGE
) => {
  const [filteredData, setFilteredData] = useState<T[]>([])
  const [page, setPage] = useState(initialPage)
  const [searchQuery, setSearchQuery] = useState('')

  // 필터링 로직
  useEffect(() => {
    let filtered = [...allData]

    if (searchQuery.trim()) {
      filtered = filterFn(filtered, searchQuery)
    }

    setFilteredData(filtered)

    // 페이지가 범위를 벗어나면 첫 페이지로
    const totalPages = Math.ceil(filtered.length / limit)
    if (page > totalPages && totalPages > 0) {
      setPage(1)
    }
  }, [allData, searchQuery, filterFn, page, limit])

  // 페이지네이션
  const paginatedResult = paginationUtils.paginate(filteredData, page, limit)

  const search = useCallback((query: string) => {
    setSearchQuery(query)
    setPage(1)
  }, [])

  return {
    paginatedData: paginatedResult.data,
    pagination: paginatedResult.pagination,
    searchQuery,
    setSearchQuery: search,
    setPage
  }
}

// 공통 CRUD 작업 훅
export const useCrudOperations = <T extends { id: string }>(
  createFn: (data: Omit<T, 'id'>) => Promise<T | null>,
  updateFn: (id: string, updates: Partial<T>) => Promise<T | null>,
  deleteFn: (id: string) => Promise<boolean>,
  setAllData: (updater: (prev: T[]) => T[]) => void
) => {
  const [error, setError] = useState<string | null>(null)

  const create = useCallback(async (data: Omit<T, 'id'>): Promise<T | null> => {
    try {
      setError(null)
      const result = await createFn(data)
      if (result) {
        setAllData(prev => [result, ...prev])
      }
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : '생성 중 오류가 발생했습니다.')
      return null
    }
  }, [createFn, setAllData])

  const update = useCallback(async (id: string, updates: Partial<T>): Promise<T | null> => {
    try {
      setError(null)
      const result = await updateFn(id, updates)
      if (result) {
        setAllData(prev => prev.map(item => item.id === id ? result : item))
      }
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : '수정 중 오류가 발생했습니다.')
      return null
    }
  }, [updateFn, setAllData])

  const remove = useCallback(async (id: string): Promise<boolean> => {
    try {
      setError(null)
      const success = await deleteFn(id)
      if (success) {
        setAllData(prev => prev.filter(item => item.id !== id))
      }
      return success
    } catch (err) {
      setError(err instanceof Error ? err.message : '삭제 중 오류가 발생했습니다.')
      return false
    }
  }, [deleteFn, setAllData])

  return { create, update, remove, error, setError }
}

// 세션 기반 인증 체크 훅
export const useAuthCheck = () => {
  const { data: session } = useSession()

  const requireAuth = useCallback((action: string = '이 작업'): boolean => {
    if (!session?.user) {
      throw new Error(`${action}을 위해서는 로그인이 필요합니다.`)
    }
    return true
  }, [session])

  const getCurrentUser = useCallback(() => {
    if (!session?.user) return null
    return {
      id: session.user.email!,
      email: session.user.email!,
      name: session.user.name!,
      image: session.user.image!,
      githubUsername: session.user.githubUsername,
    }
  }, [session])

  return {
    isAuthenticated: !!session?.user,
    currentUser: getCurrentUser(),
    requireAuth
  }
}

// 로딩 상태 관리 훅
export const useLoadingState = () => {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})

  const setLoading = useCallback((key: string, loading: boolean) => {
    setLoadingStates(prev => ({ ...prev, [key]: loading }))
  }, [])

  const isLoading = useCallback((key: string) => {
    return loadingStates[key] || false
  }, [loadingStates])

  const withLoading = useCallback(async <T>(
    key: string,
    asyncFn: () => Promise<T>
  ): Promise<T> => {
    setLoading(key, true)
    try {
      return await asyncFn()
    } finally {
      setLoading(key, false)
    }
  }, [setLoading])

  return { isLoading, setLoading, withLoading }
}