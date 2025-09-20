import type {
  Post,
  User,
  Comment,
  PaginatedResponse,
  CreatePostForm,
  UpdatePostForm,
  CreateCommentForm,
  UpdateUserForm
} from '@/types'

// API 응답 데이터 변환 유틸리티
export const dataTransformers = {
  // 게시글 관련 변환
  post: {
    // API 응답을 클라이언트 Post 타입으로 변환
    fromApi: (apiPost: any): Post => ({
      id: apiPost.id || apiPost._id,
      title: apiPost.title,
      content: apiPost.content,
      category: apiPost.category,
      tags: apiPost.tags || [],
      author: dataTransformers.user.fromApi(apiPost.author || apiPost.user),
      createdAt: apiPost.createdAt || apiPost.created_at,
      updatedAt: apiPost.updatedAt || apiPost.updated_at,
      likes: apiPost.likes || apiPost.likedBy || [],
      comments: (apiPost.comments || []).map(dataTransformers.comment.fromApi),
      status: apiPost.status || 'published'
    }),

    // 클라이언트 Post를 API 요청용으로 변환
    toApi: (post: Partial<Post>): any => ({
      title: post.title,
      content: post.content,
      category: post.category,
      tags: post.tags,
      status: post.status
    }),

    // CreatePostForm을 API 요청용으로 변환
    createToApi: (form: CreatePostForm): any => ({
      title: form.title,
      content: form.content,
      category: form.category,
      tags: form.tags,
      status: form.status
    }),

    // UpdatePostForm을 API 요청용으로 변환
    updateToApi: (form: UpdatePostForm): any => {
      const { id, ...updates } = form
      return updates
    }
  },

  // 사용자 관련 변환
  user: {
    // API 응답을 클라이언트 User 타입으로 변환
    fromApi: (apiUser: any): User => ({
      id: apiUser.id || apiUser._id,
      email: apiUser.email,
      name: apiUser.name || apiUser.displayName,
      image: apiUser.image || apiUser.avatar || apiUser.profileImage,
      githubUsername: apiUser.githubUsername || apiUser.github_username,
      bio: apiUser.bio || apiUser.description,
      createdAt: apiUser.createdAt || apiUser.created_at || apiUser.joinedAt,
      updatedAt: apiUser.updatedAt || apiUser.updated_at
    }),

    // UpdateUserForm을 API 요청용으로 변환
    updateToApi: (form: UpdateUserForm): any => ({
      name: form.name,
      bio: form.bio
    })
  },

  // 댓글 관련 변환
  comment: {
    // API 응답을 클라이언트 Comment 타입으로 변환
    fromApi: (apiComment: any): Comment => ({
      id: apiComment.id || apiComment._id,
      content: apiComment.content,
      author: dataTransformers.user.fromApi(apiComment.author || apiComment.user),
      postId: apiComment.postId || apiComment.post_id || apiComment.post,
      parentId: apiComment.parentId || apiComment.parent_id || apiComment.parent,
      createdAt: apiComment.createdAt || apiComment.created_at,
      updatedAt: apiComment.updatedAt || apiComment.updated_at,
      likes: apiComment.likes || apiComment.likedBy || []
    }),

    // CreateCommentForm을 API 요청용으로 변환
    createToApi: (form: CreateCommentForm): any => ({
      content: form.content,
      postId: form.postId,
      parentId: form.parentId
    })
  },

  // 페이지네이션 응답 변환
  pagination: {
    // API 페이지네이션 응답을 클라이언트 타입으로 변환
    fromApi: <T>(
      apiResponse: any,
      itemTransformer: (item: any) => T
    ): PaginatedResponse<T> => {
      const data = apiResponse.data || apiResponse.items || apiResponse.results || []
      const pagination = apiResponse.pagination || apiResponse.meta || {}

      return {
        data: data.map(itemTransformer),
        pagination: {
          page: pagination.page || pagination.currentPage || 1,
          limit: pagination.limit || pagination.pageSize || pagination.perPage || 10,
          total: pagination.total || pagination.totalCount || data.length,
          totalPages: pagination.totalPages || pagination.pageCount || Math.ceil(pagination.total / pagination.limit) || 1,
          hasNext: pagination.hasNext ?? pagination.hasNextPage ?? (pagination.page < pagination.totalPages),
          hasPrev: pagination.hasPrev ?? pagination.hasPrevPage ?? (pagination.page > 1)
        }
      }
    }
  },

  // 검색 결과 변환
  search: {
    fromApi: (apiResponse: any): any => ({
      posts: (apiResponse.posts || []).map(dataTransformers.post.fromApi),
      users: (apiResponse.users || []).map(dataTransformers.user.fromApi),
      total: apiResponse.total || 0
    })
  },

  // 통계 데이터 변환
  stats: {
    fromApi: (apiStats: any): any => ({
      totalPosts: apiStats.totalPosts || apiStats.postsCount || apiStats.posts || 0,
      totalComments: apiStats.totalComments || apiStats.commentsCount || apiStats.comments || 0,
      totalLikes: apiStats.totalLikes || apiStats.likesCount || apiStats.likes || 0,
      totalFollowers: apiStats.totalFollowers || apiStats.followersCount || apiStats.followers || 0,
      totalFollowing: apiStats.totalFollowing || apiStats.followingCount || apiStats.following || 0
    })
  },

  // 팔로우 관계 변환
  follow: {
    fromApi: (apiFollow: any): any => ({
      userId: apiFollow.userId || apiFollow.user_id || apiFollow.user,
      followers: apiFollow.followers || [],
      following: apiFollow.following || []
    })
  }
}

// 에러 응답 변환
export const errorTransformers = {
  // API 에러를 클라이언트 에러 형태로 변환
  fromApi: (apiError: any): { message: string; code?: string; field?: string } => {
    // 일반적인 에러 형태들 처리
    if (typeof apiError === 'string') {
      return { message: apiError }
    }

    if (apiError.message) {
      return {
        message: apiError.message,
        code: apiError.code || apiError.error_code,
        field: apiError.field || apiError.property
      }
    }

    if (apiError.error) {
      return {
        message: apiError.error,
        code: apiError.code || apiError.error_code
      }
    }

    // 유효성 검사 에러 처리
    if (apiError.errors && Array.isArray(apiError.errors)) {
      const firstError = apiError.errors[0]
      return {
        message: firstError.message || firstError.msg || 'Validation error',
        field: firstError.field || firstError.path || firstError.property
      }
    }

    return {
      message: 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR'
    }
  }
}

// 유틸리티 함수들
export const transformerUtils = {
  // 날짜 문자열을 ISO 형태로 정규화
  normalizeDate: (date: string | Date): string => {
    if (date instanceof Date) {
      return date.toISOString()
    }
    return new Date(date).toISOString()
  },

  // 배열 필드 정규화
  normalizeArray: <T>(value: T | T[] | undefined): T[] => {
    if (value === undefined || value === null) return []
    return Array.isArray(value) ? value : [value]
  },

  // 문자열 필드 정규화
  normalizeString: (value: any): string => {
    if (value === null || value === undefined) return ''
    return String(value).trim()
  },

  // 숫자 필드 정규화
  normalizeNumber: (value: any, defaultValue: number = 0): number => {
    const parsed = Number(value)
    return isNaN(parsed) ? defaultValue : parsed
  }
}