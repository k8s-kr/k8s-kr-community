// 전역 타입 정의

// User 관련 타입
export interface User {
  id: string
  email: string
  name: string
  image?: string
  githubUsername?: string
  bio?: string
  createdAt?: string
  updatedAt?: string
}

// Post 관련 타입
export interface Post {
  id: string
  title: string
  content: string
  category: PostCategory
  tags: string[]
  author: User
  createdAt: string
  updatedAt?: string
  likes: string[] // user IDs
  comments: Comment[]
  status: PostStatus
}

export type PostCategory =
  | 'announcement'
  | 'discussion'
  | 'tutorial'
  | 'tip'
  | 'experience'
  | 'question'

export type PostStatus = 'draft' | 'published' | 'archived'

// Comment 관련 타입
export interface Comment {
  id: string
  content: string
  author: User
  postId: string
  parentId?: string // 대댓글을 위한 부모 댓글 ID
  createdAt: string
  updatedAt?: string
  likes: string[] // user IDs
}

// Follow 관련 타입
export interface FollowRelation {
  userId: string
  followers: string[] // user IDs
  following: string[] // user IDs
}

// Pagination 관련 타입
export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// API 응답 타입
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Form 관련 타입
export interface CreatePostForm {
  title: string
  content: string
  category: PostCategory
  tags: string[]
  status: PostStatus
}

export interface UpdatePostForm extends Partial<CreatePostForm> {
  id: string
}

export interface CreateCommentForm {
  content: string
  postId: string
  parentId?: string
}

export interface UpdateUserForm {
  name?: string
  bio?: string
}

// Search 관련 타입
export interface SearchParams {
  query: string
  category?: PostCategory
  tags?: string[]
  author?: string
  sortBy?: 'createdAt' | 'likes' | 'comments'
  sortOrder?: 'asc' | 'desc'
}

export interface SearchResult {
  posts: Post[]
  users: User[]
  total: number
}

// Statistics 관련 타입
export interface UserStats {
  totalPosts: number
  totalComments: number
  totalLikes: number
  totalFollowers: number
  totalFollowing: number
}

export interface PostStats {
  totalLikes: number
  totalComments: number
  totalViews?: number
}

// Error 관련 타입
export interface AppError {
  code: string
  message: string
  details?: any
}

// Hook 관련 타입
export interface UsePostsOptions extends PaginationParams {
  category?: PostCategory
  tags?: string[]
  author?: string
  search?: string
}

export interface UseUserOptions {
  includeStats?: boolean
  includeFollowData?: boolean
}

// Component Props 타입
export interface PostCardProps {
  post: Post
  showAuthor?: boolean
  showStats?: boolean
  onLike?: (postId: string) => void
  onComment?: (postId: string) => void
}

export interface UserCardProps {
  user: User
  showFollowButton?: boolean
  showStats?: boolean
  onFollow?: (userId: string) => void
}

export interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  disabled?: boolean
}