import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { dataService } from '@/lib/services/data-service'
import { paginationUtils, searchUtils } from '@/lib/helpers'
import { PAGINATION } from '@/lib/constants'
import { useApiPaginatedData, useApiMutation, cacheUtils } from '@/lib/hooks/use-api-data'
import { useAuthCheck } from '@/lib/hook-utils'
import type { Post, PostCategory, PaginatedResponse, UsePostsOptions, CreatePostForm, UpdatePostForm } from '@/types'

export interface UsePostsReturn {
  // 데이터
  posts: Post[]
  currentPost: Post | null

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
  } | null

  // 액션
  createPost: (postData: CreatePostForm) => Promise<Post>
  updatePost: (id: string, updates: Partial<UpdatePostForm>) => Promise<Post>
  deletePost: (id: string) => Promise<boolean>
  getPost: (id: string) => Promise<Post | null>
  toggleLike: (postId: string) => Promise<boolean>
  addComment: (postId: string, content: string, parentId?: string) => Promise<boolean>

  // 필터링 & 검색
  setCategory: (category: PostCategory | null) => void
  setSearchQuery: (query: string) => void
  setPage: (page: number) => void
  setSortBy: (sortBy: 'createdAt' | 'likes' | 'comments') => void
  setSortOrder: (order: 'asc' | 'desc') => void

  // 새로고침
  refresh: () => Promise<void>
}

export const usePosts = (options: UsePostsOptions = { page: 1, limit: 10 }): UsePostsReturn => {
  const {
    page: initialPage = PAGINATION.DEFAULT_PAGE,
    limit = PAGINATION.POSTS_PER_PAGE,
    category: initialCategory,
    author: initialAuthor,
    sortBy: initialSortBy = 'createdAt',
    sortOrder: initialSortOrder = 'desc'
  } = options

  // 상태 관리
  const [currentPost, setCurrentPost] = useState<Post | null>(null)
  const [category, setCategory] = useState<PostCategory | null>(initialCategory || null)
  const [searchQuery, setSearchQueryState] = useState('')
  const [sortBy, setSortBy] = useState<'createdAt' | 'likes' | 'comments'>(initialSortBy as 'createdAt' | 'likes' | 'comments')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(initialSortOrder)

  // 인증 체크
  const { requireAuth, currentUser } = useAuthCheck()

  // API 데이터 로딩 (페이지네이션 지원)
  const {
    data: posts,
    pagination,
    loading,
    error: apiError,
    refresh,
    setPage
  } = useApiPaginatedData<Post>(
    async (page, limit) => {
      const apiOptions = {
        page,
        limit,
        category: category || undefined,
        author: initialAuthor,
        sortBy,
        sortOrder,
        search: searchQuery
      }
      return await dataService.getPosts(apiOptions) as PaginatedResponse<Post>
    },
    {
      initialPage,
      initialLimit: limit,
      cacheKey: `posts_${category || 'all'}_${sortBy}_${sortOrder}`,
      deps: [category, initialAuthor, sortBy, sortOrder, searchQuery]
    }
  )

  const error = apiError?.userMessage || null

  // 게시글 생성 뮤테이션
  const createPostMutation = useApiMutation<Post, CreatePostForm>(
    async (postData) => {
      requireAuth('게시글 작성')
      return await dataService.createPost(postData)
    },
    {
      onSuccess: () => {
        // 성공 시 캐시 무효화 및 데이터 새로고침
        cacheUtils.invalidatePattern('posts_')
        refresh()
      },
      invalidateKeys: [`posts_${category || 'all'}_${sortBy}_${sortOrder}`]
    }
  )

  // 게시글 수정 뮤테이션
  const updatePostMutation = useApiMutation<Post, { id: string; updates: Partial<UpdatePostForm> }>(
    async ({ id, updates }) => {
      const result = await dataService.updatePost(id, updates)
      if (!result) throw new Error('게시글 수정에 실패했습니다.')
      return result
    },
    {
      onSuccess: (updatedPost) => {
        // 현재 게시글이 수정된 게시글이면 업데이트
        if (currentPost?.id === updatedPost.id) {
          setCurrentPost(updatedPost)
        }
        cacheUtils.invalidatePattern('posts_')
        refresh()
      }
    }
  )

  // 게시글 삭제 뮤테이션
  const deletePostMutation = useApiMutation<boolean, string>(
    async (id) => {
      return await dataService.deletePost(id)
    },
    {
      onSuccess: (_, deletedId) => {
        if (currentPost?.id === deletedId) {
          setCurrentPost(null)
        }
        cacheUtils.invalidatePattern('posts_')
        refresh()
      }
    }
  )

  // 개별 게시글 가져오기
  const getPost = useCallback(async (id: string): Promise<Post | null> => {
    try {
      const post = await dataService.getPost(id)
      if (post) {
        setCurrentPost(post)
      }
      return post
    } catch (err) {
      console.error('게시글 로드 오류:', err)
      return null
    }
  }, [])

  // 좋아요 토글 뮤테이션
  const toggleLikeMutation = useApiMutation<Post | boolean, string>(
    async (postId) => {
      requireAuth('좋아요')
      return await dataService.togglePostLike(postId)
    },
    {
      onSuccess: () => {
        cacheUtils.invalidatePattern('posts_')
        refresh()
      }
    }
  )

  const toggleLike = useCallback(async (postId: string): Promise<boolean> => {
    try {
      await toggleLikeMutation.mutate(postId)
      return true
    } catch (err) {
      console.error('좋아요 토글 오류:', err)
      return false
    }
  }, [toggleLikeMutation.mutate])

  // 댓글 추가 뮤테이션
  const addCommentMutation = useApiMutation<boolean, { postId: string; content: string; parentId?: string }>(
    async ({ postId, content, parentId }) => {
      requireAuth('댓글 작성')
      return await dataService.addComment(postId, content, parentId)
    },
    {
      onSuccess: () => {
        cacheUtils.invalidatePattern('posts_')
        refresh()
      }
    }
  )

  const addComment = useCallback(async (postId: string, content: string, parentId?: string): Promise<boolean> => {
    try {
      await addCommentMutation.mutate({ postId, content, parentId })
      return true
    } catch (err) {
      console.error('댓글 추가 오류:', err)
      return false
    }
  }, [addCommentMutation.mutate])

  // 검색 설정
  const setSearchQuery = useCallback((query: string) => {
    setSearchQueryState(query)
    setPage(1) // 검색 시 첫 페이지로 리셋
  }, [setPage])

  return {
    // 데이터
    posts,
    currentPost,

    // 상태
    loading: loading || createPostMutation.loading || updatePostMutation.loading || deletePostMutation.loading,
    error,

    // 페이지네이션
    pagination,

    // 액션
    createPost: createPostMutation.mutate,
    updatePost: (id: string, updates: Partial<UpdatePostForm>) => updatePostMutation.mutate({ id, updates }),
    deletePost: deletePostMutation.mutate,
    getPost,
    toggleLike,
    addComment,

    // 필터링 & 검색
    setCategory,
    setSearchQuery,
    setPage,
    setSortBy,
    setSortOrder,

    // 새로고침
    refresh,
  }
}