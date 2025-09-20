"use client"

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { UserPlus, UserMinus, Mail, Github, ExternalLink } from 'lucide-react'
import { userUtils, textUtils } from '@/lib/helpers'
import { createClickHandler, getButtonVariant, renderIf, LoadingSpinner, createSkeleton } from '@/lib/ui-utils'
import type { UserCardProps } from '@/types'

export function UserCard({
  user,
  showFollowButton = true,
  showStats = true,
  showBio = true,
  showContact = false,
  isFollowing = false,
  isLoading = false,
  stats,
  onFollow,
  onUnfollow,
  className,
  variant = 'default'
}: UserCardProps & {
  showBio?: boolean
  showContact?: boolean
  isFollowing?: boolean
  isLoading?: boolean
  stats?: {
    posts?: number
    followers?: number
    following?: number
  }
  onUnfollow?: (userId: string) => void
  className?: string
  variant?: 'default' | 'compact' | 'detailed'
}) {
  const handleFollowClick = createClickHandler(
    (id) => isFollowing ? onUnfollow?.(id) : onFollow?.(id),
    user.id
  )

  if (variant === 'compact') {
    return (
      <Card className={`hover:shadow-sm transition-shadow ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={userUtils.getAvatarUrl(user)} />
                <AvatarFallback>{userUtils.getInitials(user)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="font-medium truncate">{userUtils.getDisplayName(user)}</p>
                <p className="text-sm text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
            {showFollowButton && onFollow && (
              <Button
                variant={isFollowing ? "outline" : "default"}
                size="sm"
                onClick={handleFollowClick}
                disabled={isLoading}
              >
                {isLoading ? (
                  <LoadingSpinner size="sm" />
                ) : isFollowing ? (
                  <>
                    <UserMinus className="h-4 w-4 mr-2" />
                    언팔로우
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    팔로우
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`hover:shadow-md transition-all duration-200 ${className}`}>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* 사용자 기본 정보 */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={userUtils.getAvatarUrl(user)} />
                <AvatarFallback className="text-lg">
                  {userUtils.getInitials(user)}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <div>
                  <h3 className="text-lg font-semibold">{userUtils.getDisplayName(user)}</h3>
                  {user.githubUsername && (
                    <p className="text-sm text-muted-foreground">@{user.githubUsername}</p>
                  )}
                </div>

                {/* 연락처 정보 */}
                {showContact && (
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      <span>{user.email}</span>
                    </div>
                    {user.githubUsername && (
                      <div className="flex items-center gap-1">
                        <Github className="h-4 w-4" />
                        <span>GitHub</span>
                        <Button variant="ghost" size="sm" asChild className="h-auto p-1">
                          <a
                            href={`https://github.com/${user.githubUsername}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {showFollowButton && onFollow && (
              <Button
                variant={isFollowing ? "outline" : "default"}
                size="sm"
                onClick={handleFollowClick}
                disabled={isLoading}
              >
                {isLoading ? (
                  <LoadingSpinner size="sm" />
                ) : isFollowing ? (
                  <>
                    <UserMinus className="h-4 w-4 mr-2" />
                    언팔로우
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    팔로우
                  </>
                )}
              </Button>
            )}
          </div>

          {/* 바이오 */}
          {renderIf(Boolean(showBio && user.bio), (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {textUtils.truncate(user.bio!, 150)}
              </p>
            </div>
          ))}

          {/* 통계 */}
          {renderIf(Boolean(showStats && stats), (
            <div className="flex items-center gap-4">
              {renderIf(Boolean(stats?.posts !== undefined), (
                <div className="text-center">
                  <div className="text-lg font-semibold">{stats?.posts}</div>
                  <div className="text-xs text-muted-foreground">게시글</div>
                </div>
              ))}
              {renderIf(Boolean(stats?.followers !== undefined), (
                <div className="text-center">
                  <div className="text-lg font-semibold">{stats?.followers}</div>
                  <div className="text-xs text-muted-foreground">팔로워</div>
                </div>
              ))}
              {renderIf(Boolean(stats?.following !== undefined), (
                <div className="text-center">
                  <div className="text-lg font-semibold">{stats?.following}</div>
                  <div className="text-xs text-muted-foreground">팔로잉</div>
                </div>
              ))}
            </div>
          ))}

          {/* 프로필 링크 */}
          {renderIf(variant === 'detailed', (
            <div className="pt-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/profile/${user.id}`}>
                  프로필 보기
                </Link>
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// 사용자 카드 스켈레톤
export function UserCardSkeleton({ variant = 'default' }: { variant?: 'default' | 'compact' }) {
  if (variant === 'compact') {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {createSkeleton('h-10 w-10 rounded-full')}
              <div className="space-y-1">
                {createSkeleton('h-4 w-24 rounded')}
                {createSkeleton('h-3 w-32 rounded')}
              </div>
            </div>
            {createSkeleton('h-8 w-20 rounded')}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              {createSkeleton('h-16 w-16 rounded-full')}
              <div className="space-y-2">
                {createSkeleton('h-5 w-32 rounded')}
                {createSkeleton('h-4 w-24 rounded')}
                {createSkeleton('h-4 w-40 rounded')}
              </div>
            </div>
            {createSkeleton('h-9 w-24 rounded')}
          </div>
          <div className="space-y-2">
            {createSkeleton('h-4 w-full rounded')}
            {createSkeleton('h-4 w-3/4 rounded')}
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center space-y-1">
              {createSkeleton('h-6 w-8 rounded')}
              {createSkeleton('h-3 w-12 rounded')}
            </div>
            <div className="text-center space-y-1">
              {createSkeleton('h-6 w-8 rounded')}
              {createSkeleton('h-3 w-12 rounded')}
            </div>
            <div className="text-center space-y-1">
              {createSkeleton('h-6 w-8 rounded')}
              {createSkeleton('h-3 w-12 rounded')}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}