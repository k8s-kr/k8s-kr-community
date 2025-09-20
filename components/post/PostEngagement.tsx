"use client"

import { Button } from "@/components/ui/button"
import { Heart, Share2, MessageSquare } from "lucide-react"
import { POST_MESSAGES } from "@/lib/constants/messages"

interface PostEngagementProps {
  post: any
  session: any
  onLikeToggle: () => void
  onShare: () => void
  getAvailableUsers: () => any[]
  isLiked: boolean
}

export function PostEngagement({
  post,
  session,
  onLikeToggle,
  onShare,
  getAvailableUsers,
  isLiked
}: PostEngagementProps) {
  return (
    <div className="flex items-center gap-4 mt-8 pt-6 border-t">
      <Button
        variant="ghost"
        size="sm"
        onClick={onLikeToggle}
        className={`transition-colors relative group ${
          isLiked
            ? 'text-red-600 hover:text-red-700'
            : 'text-gray-600 hover:text-gray-700'
        }`}
        title={
          post.likes && post.likes.length > 0
            ? `좋아요: ${getAvailableUsers()
                .filter(user => post.likes?.includes(user.email))
                .map(user => user.name)
                .slice(0, 3)
                .join(', ')}${post.likes.length > 3 ? ` 외 ${post.likes.length - 3}명` : ''}`
            : undefined
        }
      >
        <Heart
          className={`w-4 h-4 mr-2 transition-all duration-200 ${
            isLiked
              ? 'fill-red-600 text-red-600 scale-110'
              : ''
          }`}
        />
        좋아요
        {post.likes && post.likes.length > 0 && (
          <span className="ml-1 font-medium">
            {post.likes.length}
          </span>
        )}
      </Button>
      <Button variant="ghost" size="sm" onClick={onShare}>
        <Share2 className="w-4 h-4 mr-2" />
        공유
      </Button>
      <div className="flex items-center gap-1 text-sm text-gray-500 ml-auto">
        <MessageSquare className="w-4 h-4" />
        <span>댓글 {post.comments.length}개</span>
      </div>
    </div>
  )
}