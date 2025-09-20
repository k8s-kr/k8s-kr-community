import { z } from 'zod'
import { LIMITS } from './constants'
import type { PostCategory, PostStatus } from '@/types'

// 공통 스키마
const emailSchema = z.string().email('올바른 이메일 형식이 아닙니다.')
const idSchema = z.string().min(1, 'ID가 필요합니다.')

// User 관련 검증
export const userValidation = {
  bio: z.string().max(LIMITS.BIO_MAX, `자기소개는 ${LIMITS.BIO_MAX}자를 넘을 수 없습니다.`).optional(),
  name: z.string().min(1, '이름은 필수입니다.').max(50, '이름은 50자를 넘을 수 없습니다.'),
  email: emailSchema,
}

export const updateUserSchema = z.object({
  name: userValidation.name.optional(),
  bio: userValidation.bio,
})

// Post 관련 검증
export const postValidation = {
  title: z.string()
    .min(1, '제목은 필수입니다.')
    .max(LIMITS.POST_TITLE_MAX, `제목은 ${LIMITS.POST_TITLE_MAX}자를 넘을 수 없습니다.`),

  content: z.string()
    .min(10, '내용은 최소 10자 이상 작성해주세요.')
    .max(LIMITS.POST_CONTENT_MAX, `내용은 ${LIMITS.POST_CONTENT_MAX}자를 넘을 수 없습니다.`),

  category: z.enum(['announcement', 'discussion', 'tutorial', 'tip', 'experience', 'question'] as const),

  tags: z.array(z.string()
    .min(1, '태그는 비어있을 수 없습니다.')
    .max(LIMITS.TAG_LENGTH_MAX, `태그는 ${LIMITS.TAG_LENGTH_MAX}자를 넘을 수 없습니다.`)
  ).max(LIMITS.TAGS_MAX, `태그는 최대 ${LIMITS.TAGS_MAX}개까지 가능합니다.`),

  status: z.enum(['draft', 'published', 'archived'] as const).default('published'),
}

export const createPostSchema = z.object({
  title: postValidation.title,
  content: postValidation.content,
  category: postValidation.category,
  tags: postValidation.tags,
  status: postValidation.status,
})

export const updatePostSchema = z.object({
  id: idSchema,
  title: postValidation.title.optional(),
  content: postValidation.content.optional(),
  category: postValidation.category.optional(),
  tags: postValidation.tags.optional(),
  status: postValidation.status.optional(),
})

// Comment 관련 검증
export const commentValidation = {
  content: z.string()
    .min(1, '댓글 내용은 필수입니다.')
    .max(LIMITS.COMMENT_MAX, `댓글은 ${LIMITS.COMMENT_MAX}자를 넘을 수 없습니다.`),
  postId: idSchema,
  parentId: idSchema.optional(),
}

export const createCommentSchema = z.object({
  content: commentValidation.content,
  postId: commentValidation.postId,
  parentId: commentValidation.parentId,
})

export const updateCommentSchema = z.object({
  id: idSchema,
  content: commentValidation.content,
})

// Search 관련 검증
export const searchSchema = z.object({
  query: z.string().min(1, '검색어를 입력해주세요.').max(100, '검색어는 100자를 넘을 수 없습니다.'),
  category: z.enum(['announcement', 'discussion', 'tutorial', 'tip', 'experience', 'question'] as const).optional(),
  tags: z.array(z.string()).optional(),
  author: z.string().optional(),
  sortBy: z.enum(['createdAt', 'likes', 'comments'] as const).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc'] as const).default('desc'),
})

// Pagination 관련 검증
export const paginationSchema = z.object({
  page: z.number().int().min(1, '페이지는 1 이상이어야 합니다.').default(1),
  limit: z.number().int().min(1, '제한 수는 1 이상이어야 합니다.').max(100, '제한 수는 100을 넘을 수 없습니다.').default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc'] as const).default('desc'),
})

// Follow 관련 검증
export const followSchema = z.object({
  targetUserId: idSchema,
})

// 타입 추론을 위한 타입 정의
export type CreatePostInput = z.infer<typeof createPostSchema>
export type UpdatePostInput = z.infer<typeof updatePostSchema>
export type CreateCommentInput = z.infer<typeof createCommentSchema>
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
export type SearchInput = z.infer<typeof searchSchema>
export type PaginationInput = z.infer<typeof paginationSchema>
export type FollowInput = z.infer<typeof followSchema>

// 검증 헬퍼 함수
export const validateData = <T>(schema: z.ZodSchema<T>, data: unknown): T => {
  try {
    return schema.parse(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map(err => err.message).join(', ')
      throw new Error(errorMessage)
    }
    throw error
  }
}

// 안전한 검증 함수 (에러를 반환)
export const safeValidateData = <T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean
  data?: T
  error?: string
} => {
  try {
    const result = schema.parse(data)
    return { success: true, data: result }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map(err => err.message).join(', ')
      return { success: false, error: errorMessage }
    }
    return { success: false, error: 'Unknown validation error' }
  }
}