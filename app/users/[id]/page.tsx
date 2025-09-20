"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ArrowLeft, UserPlus, UserMinus, Github, ExternalLink, Settings } from 'lucide-react'
import Link from 'next/link'
import { PostCard } from '@/components/ui/post-card'
import { LoadingSpinner } from '@/lib/ui-utils'
import { BUTTON_LABELS, LABELS, LOADING_MESSAGES, STATUS_MESSAGES, USER_MESSAGES, CONSOLE_ERROR_MESSAGES } from '@/lib/constants/messages'
import { userUtils } from '@/lib/helpers'
import type { User, Post } from '@/types'

interface UserStats {
  posts: number
  followers: number
  following: number
}

export default function UserProfilePage() {
  const { data: session } = useSession()
  const params = useParams()
  const router = useRouter()
  const userId = params.id as string

  const [user, setUser] = useState<User | null>(null)
  const [userPosts, setUserPosts] = useState<Post[]>([])
  const [userStats, setUserStats] = useState<UserStats>({ posts: 0, followers: 0, following: 0 })
  const [isFollowing, setIsFollowing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isFollowLoading, setIsFollowLoading] = useState(false)

  const isOwnProfile = session?.user?.email === userId || session?.user?.email === user?.email

  // 사용자 정보 로드
  useEffect(() => {
    const loadUserProfile = async () => {
      setIsLoading(true)
      try {
        // 사용자 정보 로드
        const posts = JSON.parse(localStorage.getItem('posts') || '[]')
        const users = JSON.parse(localStorage.getItem('users') || '[]')

        // 사용자 찾기 (ID 또는 이메일로)
        let foundUser = users.find((u: User) => u.id === userId || u.email === userId)

        // 사용자가 없으면 게시글 작성자에서 찾기
        if (!foundUser) {
          const authorPost = posts.find((p: Post) => p.author.email === userId || p.author.id === userId)
          if (authorPost) {
            foundUser = authorPost.author
          }
        }

        if (!foundUser) {
          router.push('/404')
          return
        }

        setUser(foundUser)

        // 사용자의 게시글 로드
        const userPostsList = posts.filter((post: Post) =>
          post.author.email === foundUser.email || post.author.id === foundUser.id
        )
        setUserPosts(userPostsList)

        // 통계 로드
        const followData = JSON.parse(localStorage.getItem(`follow_${foundUser.email}`) || '{"followers": [], "following": []}')
        setUserStats({
          posts: userPostsList.length,
          followers: followData.followers?.length || 0,
          following: followData.following?.length || 0
        })

        // 팔로우 상태 확인
        if (session?.user?.email) {
          const currentUserFollowData = JSON.parse(localStorage.getItem(`follow_${session.user.email}`) || '{"followers": [], "following": []}')
          setIsFollowing(currentUserFollowData.following?.includes(foundUser.email) || false)
        }

      } catch (error) {
        console.error('프로필 로드 오류:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (userId) {
      loadUserProfile()
    }
  }, [userId, session, router])

  // 팔로우/언팔로우 처리
  const handleFollowToggle = async () => {
    if (!session?.user?.email || !user) return

    setIsFollowLoading(true)
    try {
      const currentUserEmail = session.user.email
      const targetUserEmail = user.email

      // 현재 사용자의 팔로잉 데이터
      const currentUserFollowData = JSON.parse(localStorage.getItem(`follow_${currentUserEmail}`) || '{"followers": [], "following": []}')
      // 대상 사용자의 팔로워 데이터
      const targetUserFollowData = JSON.parse(localStorage.getItem(`follow_${targetUserEmail}`) || '{"followers": [], "following": []}')

      if (isFollowing) {
        // 언팔로우
        currentUserFollowData.following = currentUserFollowData.following.filter((email: string) => email !== targetUserEmail)
        targetUserFollowData.followers = targetUserFollowData.followers.filter((email: string) => email !== currentUserEmail)
        setIsFollowing(false)
      } else {
        // 팔로우
        if (!currentUserFollowData.following.includes(targetUserEmail)) {
          currentUserFollowData.following.push(targetUserEmail)
        }
        if (!targetUserFollowData.followers.includes(currentUserEmail)) {
          targetUserFollowData.followers.push(currentUserEmail)
        }
        setIsFollowing(true)
      }

      // 로컬 스토리지에 저장
      localStorage.setItem(`follow_${currentUserEmail}`, JSON.stringify(currentUserFollowData))
      localStorage.setItem(`follow_${targetUserEmail}`, JSON.stringify(targetUserFollowData))

      // 통계 업데이트
      setUserStats(prev => ({
        ...prev,
        followers: targetUserFollowData.followers.length
      }))

    } catch (error) {
      console.error('팔로우 처리 오류:', error)
    } finally {
      setIsFollowLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-muted-foreground">{LOADING_MESSAGES.PROFILE}</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {STATUS_MESSAGES.NO_DATA}
          </h1>
          <Button asChild>
            <Link href="/posts">
              <ArrowLeft className="w-4 h-4 mr-2" />
              돌아가기
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* 뒤로가기 버튼 */}
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href="/posts">
            <ArrowLeft className="w-4 h-4 mr-2" />
            돌아가기
          </Link>
        </Button>
      </div>

      {/* 프로필 카드 */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user.image || ''} alt={user.name || ''} />
                <AvatarFallback className="text-lg">
                  {userUtils.getInitials(user)}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">{user.name || 'Unknown User'}</CardTitle>
                <p className="text-muted-foreground">@{user.email?.split('@')[0]}</p>
                {user.githubUsername && (
                  <div className="flex items-center mt-2 text-sm text-muted-foreground">
                    <Github className="w-4 h-4 mr-1" />
                    <a
                      href={`https://github.com/${user.githubUsername}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      {user.githubUsername}
                    </a>
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </div>
                )}
              </div>
            </div>

            {/* 액션 버튼 */}
            <div className="flex items-center space-x-2">
              {isOwnProfile ? (
                <Button asChild>
                  <Link href="/profile">
                    <Settings className="w-4 h-4 mr-2" />
                    {BUTTON_LABELS.EDIT_PROFILE}
                  </Link>
                </Button>
              ) : session ? (
                <Button
                  onClick={handleFollowToggle}
                  disabled={isFollowLoading}
                  variant={isFollowing ? "outline" : "default"}
                >
                  {isFollowLoading ? (
                    <LoadingSpinner size="sm" />
                  ) : isFollowing ? (
                    <>
                      <UserMinus className="w-4 h-4 mr-2" />
                      {BUTTON_LABELS.UNFOLLOW}
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      {BUTTON_LABELS.FOLLOW}
                    </>
                  )}
                </Button>
              ) : null}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* 소개 */}
          {user.bio && (
            <div className="mb-6">
              <p className="text-gray-700 dark:text-gray-300">{user.bio}</p>
            </div>
          )}

          {/* 통계 */}
          <div className="flex items-center space-x-6 text-sm">
            <div className="text-center">
              <div className="font-semibold text-lg">{userStats.posts}</div>
              <div className="text-muted-foreground">{LABELS.POSTS}</div>
            </div>
            <Link href={`/users/${userId}/followers`} className="text-center hover:opacity-80 transition-opacity">
              <div className="font-semibold text-lg">{userStats.followers}</div>
              <div className="text-muted-foreground hover:text-foreground transition-colors">{LABELS.FOLLOWERS}</div>
            </Link>
            <Link href={`/users/${userId}/following`} className="text-center hover:opacity-80 transition-opacity">
              <div className="font-semibold text-lg">{userStats.following}</div>
              <div className="text-muted-foreground hover:text-foreground transition-colors">{LABELS.FOLLOWING}</div>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* 사용자 게시글 */}
      <Card>
        <CardHeader>
          <CardTitle>{user.name}님의 게시글</CardTitle>
        </CardHeader>
        <CardContent>
          {userPosts.length > 0 ? (
            <div className="space-y-4">
              {userPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  showAuthor={false}
                  currentUserId={session?.user?.email ?? undefined}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">{STATUS_MESSAGES.NO_POSTS}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}