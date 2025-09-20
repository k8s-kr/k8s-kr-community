"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Send, MessageSquare } from "lucide-react"
import { CommentItem } from "./CommentItem"
import { AuthButton } from "@/components/auth-button"
import { POST_MESSAGES } from "@/lib/constants/messages"

interface Comment {
  id: string
  content: string
  author: {
    name: string
    image: string
    email: string
  }
  createdAt: string
  replies?: Comment[]
  parentId?: string
}

interface CommentSectionProps {
  post: any
  session: any
  comments: Comment[]
  newComment: string
  setNewComment: (value: string) => void
  onCommentSubmit: (e: React.FormEvent) => void
  onCommentEdit: (commentId: string, newContent: string, isReply?: boolean, parentId?: string) => void
  onCommentDelete: (commentId: string, isReply?: boolean, parentId?: string) => void
  onReplySubmit: (commentId: string, content: string) => void
  getAvailableUsers: () => any[]
  renderMentions: (text: string) => React.ReactNode
  isSubmitting: boolean
}

export function CommentSection({
  post,
  session,
  comments,
  newComment,
  setNewComment,
  onCommentSubmit,
  onCommentEdit,
  onCommentDelete,
  onReplySubmit,
  getAvailableUsers,
  renderMentions,
  isSubmitting
}: CommentSectionProps) {
  const [mentionSuggestions, setMentionSuggestions] = useState<any[]>([])
  const [showMentions, setShowMentions] = useState(false)

  const handleCommentChange = (value: string) => {
    setNewComment(value)

    // 멘션 자동완성 로직
    const lastAtIndex = value.lastIndexOf('@')
    if (lastAtIndex !== -1) {
      const searchTerm = value.slice(lastAtIndex + 1)
      if (searchTerm.length > 0) {
        const availableUsers = getAvailableUsers()
        const filtered = availableUsers.filter(user =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
        setMentionSuggestions(filtered)
        setShowMentions(true)
      } else {
        setShowMentions(false)
      }
    } else {
      setShowMentions(false)
    }
  }

  const handleMentionSelect = (user: any) => {
    const lastAtIndex = newComment.lastIndexOf('@')
    const beforeMention = newComment.slice(0, lastAtIndex)
    const afterMention = newComment.slice(newComment.lastIndexOf('@') + 1).replace(/^\S*/, '')
    setNewComment(`${beforeMention}@${user.name}${afterMention}`)
    setShowMentions(false)
  }

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          댓글 {post.comments.length}개
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Comment Form */}
        {session ? (
          <form onSubmit={onCommentSubmit} className="space-y-4">
            <div className="flex items-start gap-3">
              <img
                src={session.user?.image || "/placeholder.svg?height=32&width=32"}
                alt={session.user?.name || ""}
                className="w-8 h-8 rounded-full"
              />
              <div className="flex-1 relative">
                <Textarea
                  value={newComment}
                  onChange={(e) => handleCommentChange(e.target.value)}
                  placeholder={POST_MESSAGES.COMMENT_PLACEHOLDER}
                  className="min-h-[80px] resize-none"
                />

                {/* 멘션 자동완성 드롭다운 */}
                {showMentions && mentionSuggestions.length > 0 && (
                  <div className="absolute bottom-full left-0 right-0 mb-1 bg-white dark:bg-gray-800 border rounded-lg shadow-lg max-h-32 overflow-y-auto z-10">
                    {mentionSuggestions.map((user) => (
                      <button
                        key={user.email}
                        onClick={() => handleMentionSelect(user)}
                        className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                      >
                        <img
                          src={user.image || "/placeholder.svg?height=20&width=20"}
                          alt={user.name}
                          className="w-5 h-5 rounded-full"
                        />
                        <span className="font-medium">@{user.name}</span>
                      </button>
                    ))}
                  </div>
                )}
                <div className="flex justify-end mt-2">
                  <Button
                    type="submit"
                    disabled={!newComment.trim() || isSubmitting}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        작성 중...
                      </>
                    ) : (
                      <>
                        <Send className="w-3 h-3 mr-2" />
                        댓글 작성
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        ) : (
          <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-gray-600 dark:text-gray-300 mb-4">댓글을 작성하려면 로그인이 필요합니다.</p>
            <AuthButton />
          </div>
        )}

        {/* Comments List */}
        <div className="space-y-4">
          {comments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>아직 댓글이 없습니다. 첫 번째 댓글을 작성해보세요!</p>
            </div>
          ) : (
            comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                session={session}
                onEdit={onCommentEdit}
                onDelete={onCommentDelete}
                onReplySubmit={onReplySubmit}
                getAvailableUsers={getAvailableUsers}
                renderMentions={renderMentions}
              />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}