"use client"

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Heart, MessageSquare, MoreHorizontal, Edit, Trash2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatDate, textUtils, categoryUtils, userUtils } from '@/lib/helpers'
import { createClickHandler, getButtonVariant, renderIf, renderTags, createSkeleton } from '@/lib/ui-utils'
import type { PostCardProps } from '@/types'

export function PostCard({
  post,
  showAuthor = true,
  showStats = true,
  onLike,
  onComment,
  onEdit,
  onDelete,
  currentUserId,
}: PostCardProps & {
  onEdit?: (postId: string) => void
  onDelete?: (postId: string) => void
  currentUserId?: string
}) {
  const isLiked = currentUserId ? post.likes.includes(currentUserId) : false
  const isAuthor = currentUserId === post.author.email || currentUserId === post.author.id

  const handleLike = createClickHandler(onLike, post.id)
  const handleComment = createClickHandler(onComment, post.id)
  const handleEdit = createClickHandler(onEdit, post.id)
  const handleDelete = createClickHandler(onDelete, post.id)

  return (
    <Link href={`/posts/${post.id}`}>
      <Card className="hover:shadow-md transition-all duration-200 cursor-pointer group">
        <CardHeader className="space-y-3">
          {/* 헤더: 카테고리, 시간, 메뉴 */}
          <div className="flex items-center justify-between">
            <Badge className={categoryUtils.getColor(post.category)}>
              {categoryUtils.getLabel(post.category)}
            </Badge>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {formatDate.relative(post.createdAt)}
              </span>
              {isAuthor && (onEdit || onDelete) && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => e.preventDefault()}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {onEdit && (
                      <DropdownMenuItem onClick={handleEdit}>
                        <Edit className="mr-2 h-4 w-4" />
                        수정
                      </DropdownMenuItem>
                    )}
                    {onDelete && (
                      <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        삭제
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>

          {/* 제목 */}
          <CardTitle className="text-lg line-clamp-2">{post.title}</CardTitle>

          {/* 내용 미리보기 */}
          <p className="text-sm text-muted-foreground line-clamp-2">
            {textUtils.truncate(textUtils.stripHtml(post.content), 150)}
          </p>

          {/* 태그 */}
          {renderIf(post.tags.length > 0, (() => {
            const { visibleTags, hasMore, remainingCount } = renderTags(post.tags, 3)
            return (
              <div className="flex flex-wrap gap-1">
                {visibleTags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 text-xs bg-muted text-muted-foreground rounded-md"
                  >
                    #{tag}
                  </span>
                ))}
                {hasMore && (
                  <span className="px-2 py-1 text-xs bg-muted text-muted-foreground rounded-md">
                    +{remainingCount}
                  </span>
                )}
              </div>
            )
          })())}
        </CardHeader>

        <CardContent className="pt-0">
          <div className="flex items-center justify-between">
            {/* 작성자 정보 */}
            {showAuthor && (
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={userUtils.getAvatarUrl(post.author)} />
                  <AvatarFallback className="text-xs">
                    {userUtils.getInitials(post.author)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-muted-foreground">
                  {userUtils.getDisplayName(post.author)}
                </span>
              </div>
            )}

            {/* 통계 및 액션 */}
            {showStats && (
              <div className="flex items-center gap-4">
                {/* 좋아요 */}
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-8 px-2 gap-1 ${isLiked ? 'text-red-500' : 'text-muted-foreground'}`}
                  onClick={handleLike}
                  disabled={!onLike}
                >
                  <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                  <span className="text-xs">{post.likes.length}</span>
                </Button>

                {/* 댓글 */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 gap-1 text-muted-foreground"
                  onClick={handleComment}
                  disabled={!onComment}
                >
                  <MessageSquare className="h-4 w-4" />
                  <span className="text-xs">{post.comments.length}</span>
                </Button>

                {/* 읽기 시간 */}
                <span className="text-xs text-muted-foreground">
                  {textUtils.readingTime(post.content)}분
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

// 게시글 카드 스켈레톤
export function PostCardSkeleton() {
  return (
    <Card>
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between">
          {createSkeleton('h-6 w-16 rounded')}
          {createSkeleton('h-4 w-20 rounded')}
        </div>
        {createSkeleton('h-6 w-3/4 rounded')}
        <div className="space-y-2">
          {createSkeleton('h-4 w-full rounded')}
          {createSkeleton('h-4 w-2/3 rounded')}
        </div>
        <div className="flex gap-1">
          {createSkeleton('h-6 w-12 rounded')}
          {createSkeleton('h-6 w-16 rounded')}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {createSkeleton('h-6 w-6 rounded-full')}
            {createSkeleton('h-4 w-20 rounded')}
          </div>
          <div className="flex items-center gap-4">
            {createSkeleton('h-4 w-8 rounded')}
            {createSkeleton('h-4 w-8 rounded')}
            {createSkeleton('h-4 w-12 rounded')}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}