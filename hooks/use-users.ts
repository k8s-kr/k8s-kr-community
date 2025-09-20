import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { storageService } from '@/lib/services/storage'
import { paginationUtils, searchUtils } from '@/lib/helpers'
import { PAGINATION } from '@/lib/constants'
import { useDataLoader, useSearchAndFilter, useAuthCheck } from '@/lib/hook-utils'
import type { User, FollowRelation, UserStats, UseUserOptions } from '@/types'

export interface UseUsersReturn {
  // 데이터
  users: User[]
  currentUser: User | null
  followRelation: FollowRelation | null
  userStats: UserStats | null

  // 상태
  loading: boolean
  error: string | null

  // 페이지네이션
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }

  // 액션
  followUser: (targetUserId: string) => Promise<boolean>
  unfollowUser: (targetUserId: string) => Promise<boolean>
  updateUserBio: (bio: string) => Promise<boolean>
  getUser: (userId: string) => Promise<User | null>
  searchUsers: (query: string) => void
  setPage: (page: number) => void

  // 헬퍼
  isFollowing: (targetUserId: string) => boolean
  isFollower: (userId: string) => boolean

  // 새로고침
  refresh: () => Promise<void>
}

export const useUsers = (options: UseUserOptions & { page?: number; limit?: number } = {}): UseUsersReturn => {
  const { data: session } = useSession()
  const {
    includeStats = false,
    includeFollowData = true,
    page: initialPage = PAGINATION.DEFAULT_PAGE,
    limit = PAGINATION.USERS_PER_PAGE
  } = options

  // 데이터 로딩 및 상태 관리
  const { data: allUsers, setData: setAllUsers, loading, error, refresh: loadUsers } = useDataLoader<User>(
    () => storageService.getUsers(),
    []
  )

  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [followRelation, setFollowRelation] = useState<FollowRelation | null>(null)
  const [userStats, setUserStats] = useState<UserStats | null>(null)

  // 인증 체크
  const { requireAuth } = useAuthCheck()

  // 검색 및 필터링
  const {
    paginatedData: users,
    pagination,
    searchQuery,
    setSearchQuery: setSearchQueryFromFilter,
    setPage
  } = useSearchAndFilter(allUsers, searchUtils.filterUsers, initialPage, limit)

  // 팔로우 데이터 로드
  const loadFollowData = useCallback(async () => {
    if (!session?.user?.email || !includeFollowData) return

    try {
      const relation = await storageService.getFollowRelation(session.user.email)
      setFollowRelation(relation)
    } catch (err) {
      console.error('팔로우 데이터 로드 오류:', err)
    }
  }, [session?.user?.email, includeFollowData])

  // 사용자 통계 로드
  const loadUserStats = useCallback(async () => {
    if (!session?.user?.email || !includeStats) return

    try {
      const posts = await storageService.getPostsByUser(session.user.email)
      const followData = await storageService.getFollowRelation(session.user.email)

      let totalComments = 0
      let totalLikes = 0

      posts.forEach(post => {
        totalComments += post.comments.length
        totalLikes += post.likes.length
      })

      const stats: UserStats = {
        totalPosts: posts.length,
        totalComments,
        totalLikes,
        totalFollowers: followData.followers.length,
        totalFollowing: followData.following.length,
      }

      setUserStats(stats)
    } catch (err) {
      console.error('사용자 통계 로드 오류:', err)
    }
  }, [session?.user?.email, includeStats])


  useEffect(() => {
    loadFollowData()
  }, [loadFollowData])

  useEffect(() => {
    loadUserStats()
  }, [loadUserStats])

  // 현재 사용자 설정
  useEffect(() => {
    if (session?.user?.email && allUsers.length > 0) {
      const user = allUsers.find(u => u.email === session.user.email || u.id === session.user.email)
      if (user) {
        setCurrentUser(user)
      } else {
        // 세션 사용자가 allUsers에 없으면 추가 (새 사용자의 경우)
        const newUser: User = {
          id: session.user.email,
          email: session.user.email,
          name: session.user.name!,
          image: session.user.image!,
          githubUsername: session.user.githubUsername,
        }
        setCurrentUser(newUser)
        setAllUsers(prev => [newUser, ...prev])
      }
    }
  }, [session, allUsers])


  // 사용자 팔로우
  const followUser = useCallback(async (targetUserId: string): Promise<boolean> => {
    try {
      requireAuth('팔로우')
      const success = await storageService.followUser(session!.user!.email!, targetUserId)
      if (success) {
        await loadFollowData()
        await loadUserStats()
      }
      return success
    } catch (err) {
      console.error('팔로우 오류:', err)
      return false
    }
  }, [requireAuth, session, loadFollowData, loadUserStats])

  // 사용자 언팔로우
  const unfollowUser = useCallback(async (targetUserId: string): Promise<boolean> => {
    try {
      requireAuth('언팔로우')
      const success = await storageService.unfollowUser(session!.user!.email!, targetUserId)
      if (success) {
        await loadFollowData()
        await loadUserStats()
      }
      return success
    } catch (err) {
      console.error('언팔로우 오류:', err)
      return false
    }
  }, [requireAuth, session, loadFollowData, loadUserStats])

  // 사용자 바이오 업데이트
  const updateUserBio = useCallback(async (bio: string): Promise<boolean> => {
    if (!session?.user?.email) {
      console.error('로그인이 필요합니다.')
      return false
    }

    try {
      const success = await storageService.updateUserBio(session.user.email, bio)
      if (success && currentUser) {
        const updatedUser = { ...currentUser, bio }
        setCurrentUser(updatedUser)
        setAllUsers(prev => prev.map(user =>
          user.email === session.user.email ? updatedUser : user
        ))
      }
      return success
    } catch (err) {
      console.error(err instanceof Error ? err.message : '프로필 업데이트 중 오류가 발생했습니다.')
      return false
    }
  }, [session, currentUser])

  // 개별 사용자 가져오기
  const getUser = useCallback(async (userId: string): Promise<User | null> => {
    try {
      const user = await storageService.getUser(userId)
      return user
    } catch (err) {
      console.error(err instanceof Error ? err.message : '사용자 정보를 불러오는 중 오류가 발생했습니다.')
      return null
    }
  }, [])

  // 검색
  const searchUsers = useCallback((query: string) => {
    setSearchQueryFromFilter(query)
    setPage(1) // 검색 시 첫 페이지로 리셋
  }, [setSearchQueryFromFilter, setPage])

  // 헬퍼 함수들
  const isFollowing = useCallback((targetUserId: string): boolean => {
    return followRelation?.following.includes(targetUserId) || false
  }, [followRelation])

  const isFollower = useCallback((userId: string): boolean => {
    return followRelation?.followers.includes(userId) || false
  }, [followRelation])

  // 새로고침
  const refresh = useCallback(async () => {
    await Promise.all([
      loadUsers(),
      loadFollowData(),
      loadUserStats()
    ])
  }, [loadUsers, loadFollowData, loadUserStats])

  return {
    // 데이터
    users,
    currentUser,
    followRelation,
    userStats,

    // 상태
    loading,
    error,

    // 페이지네이션
    pagination,

    // 액션
    followUser,
    unfollowUser,
    updateUserBio,
    getUser,
    searchUsers,
    setPage,

    // 헬퍼
    isFollowing,
    isFollower,

    // 새로고침
    refresh,
  }
}

// 특정 사용자의 팔로워/팔로잉 목록을 위한 훅
export const useFollowList = (userId: string) => {
  const [followers, setFollowers] = useState<User[]>([])
  const [following, setFollowing] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadFollowList = async () => {
      try {
        setLoading(true)
        const [followData, allUsers] = await Promise.all([
          storageService.getFollowRelation(userId),
          storageService.getUsers()
        ])

        const followerUsers = followData.followers
          .map(id => allUsers.find(user => user.id === id || user.email === id))
          .filter((user): user is User => user !== undefined)

        const followingUsers = followData.following
          .map(id => allUsers.find(user => user.id === id || user.email === id))
          .filter((user): user is User => user !== undefined)

        setFollowers(followerUsers)
        setFollowing(followingUsers)
      } catch (error) {
        console.error('팔로우 목록 로드 오류:', error)
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      loadFollowList()
    }
  }, [userId])

  return { followers, following, loading }
}