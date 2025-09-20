"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { LoadingSpinner } from '@/lib/ui-utils'
import { BUTTON_LABELS, LABELS, LOADING_MESSAGES, STATUS_MESSAGES, USER_MESSAGES, CONSOLE_ERROR_MESSAGES } from '@/lib/constants/messages'
import { userUtils } from '@/lib/helpers'
import type { User } from '@/types'

export default function FollowersPage() {
  const { data: session } = useSession()
  const params = useParams()
  const router = useRouter()
  const userId = params.id as string

  const [targetUser, setTargetUser] = useState<User | null>(null)
  const [followers, setFollowers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // 팔로워 목록 로드
  useEffect(() => {
    const loadFollowers = async () => {
      setIsLoading(true)
      try {
        const posts = JSON.parse(localStorage.getItem('posts') || '[]')
        const users = JSON.parse(localStorage.getItem('users') || '[]')

        // 대상 사용자 찾기
        let foundUser = users.find((u: User) => u.id === userId || u.email === userId)
        if (!foundUser) {
          const authorPost = posts.find((p: any) => p.author.email === userId || p.author.id === userId)
          if (authorPost) {
            foundUser = authorPost.author
          }
        }

        if (!foundUser) {
          router.push('/404')
          return
        }

        setTargetUser(foundUser)

        // 팔로워 데이터 로드 (localStorage의 follow 데이터 구조에 맞춤)
        const followData = JSON.parse(localStorage.getItem('followData') || '{}')
        const userFollowData = followData[foundUser.email] || { followers: [], following: [] }
        const followerEmails = userFollowData.followers || []

        // 팔로워 사용자 정보 가져오기
        const followerUsers: User[] = []
        for (const email of followerEmails) {
          let user = users.find((u: User) => u.email === email)
          if (!user) {
            // 게시글 작성자에서 찾기
            const post = posts.find((p: any) => p.author.email === email)
            if (post) {
              user = post.author
            }
          }
          if (user) {
            followerUsers.push(user)
          }
        }

        setFollowers(followerUsers)

      } catch (error) {
        console.error(CONSOLE_ERROR_MESSAGES.FOLLOWERS_LOAD_ERROR, error)
      } finally {
        setIsLoading(false)
      }
    }

    if (userId) {
      loadFollowers()
    }
  }, [userId, session, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-muted-foreground">{LOADING_MESSAGES.USERS}</p>
        </div>
      </div>
    )
  }

  if (!targetUser) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {STATUS_MESSAGES.NO_DATA}
          </h1>
          <Button asChild>
            <Link href="/posts">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {USER_MESSAGES.BACK}
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* 뒤로가기 버튼 */}
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href={`/users/${userId}`}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {targetUser.name}{USER_MESSAGES.BACK_TO_PROFILE}
          </Link>
        </Button>
      </div>

      {/* 팔로워 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>{targetUser.name}{USER_MESSAGES.FOLLOWERS_TITLE} {LABELS.FOLLOWERS} ({followers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {followers.length > 0 ? (
            <div className="space-y-4">
              {followers.map((follower) => (
                <Link key={follower.email} href={`/users/${follower.email}`} className="flex items-center space-x-3 p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={follower.image || ''} alt={follower.name || ''} />
                    <AvatarFallback>
                      {userUtils.getInitials(follower)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium text-foreground">{follower.name || 'Unknown User'}</h3>
                    <p className="text-sm text-muted-foreground">@{follower.email?.split('@')[0]}</p>
                    {follower.bio && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{follower.bio}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">{USER_MESSAGES.NO_FOLLOWERS}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}