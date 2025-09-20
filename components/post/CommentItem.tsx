"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { formatDistanceToNow } from "date-fns"
import { ko } from "date-fns/locale"
import { MoreVertical, Edit as EditIcon, Trash2, Send } from "lucide-react"
import { BUTTON_LABELS, POST_MESSAGES } from "@/lib/constants/messages"
import Link from "next/link"

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

interface CommentItemProps {
  comment: Comment
  session: any
  onEdit: (commentId: string, newContent: string, isReply?: boolean, parentId?: string) => void
  onDelete: (commentId: string, isReply?: boolean, parentId?: string) => void
  onReplySubmit: (commentId: string, content: string) => void
  getAvailableUsers: () => any[]
  renderMentions: (text: string) => React.ReactNode
}

export function CommentItem({
  comment,
  session,
  onEdit,
  onDelete,
  onReplySubmit,
  getAvailableUsers,
  renderMentions
}: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(comment.content)
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [replyContent, setReplyContent] = useState("")
  const [replyMentionSuggestions, setReplyMentionSuggestions] = useState<any[]>([])
  const [showReplyMentions, setShowReplyMentions] = useState(false)
  const [editingReply, setEditingReply] = useState<string | null>(null)
  const [replyEditContent, setReplyEditContent] = useState("")

  const isAuthor = session && session.user?.email && session.user.email === comment.author.email

  const handleEditSubmit = () => {
    onEdit(comment.id, editContent, false, comment.parentId)
    setIsEditing(false)
  }

  const handleReplySubmit = () => {
    onReplySubmit(comment.id, replyContent)
    setReplyContent("")
    setShowReplyForm(false)
  }

  const handleReplyChange = (value: string) => {
    setReplyContent(value)

    // 멘션 자동완성 로직
    const lastAtIndex = value.lastIndexOf('@')
    if (lastAtIndex !== -1) {
      const searchTerm = value.slice(lastAtIndex + 1)
      if (searchTerm.length > 0) {
        const availableUsers = getAvailableUsers()
        const filtered = availableUsers.filter(user =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
        setReplyMentionSuggestions(filtered)
        setShowReplyMentions(true)
      } else {
        setShowReplyMentions(false)
      }
    } else {
      setShowReplyMentions(false)
    }
  }

  const handleReplyMentionSelect = (user: any) => {
    const lastAtIndex = replyContent.lastIndexOf('@')
    const beforeMention = replyContent.slice(0, lastAtIndex)
    const afterMention = replyContent.slice(replyContent.lastIndexOf('@') + 1).replace(/^\S*/, '')
    setReplyContent(`${beforeMention}@${user.name}${afterMention}`)
    setShowReplyMentions(false)
  }

  const handleReplyEdit = (replyId: string, currentContent: string) => {
    setEditingReply(replyId)
    setReplyEditContent(currentContent)
  }

  const handleReplyEditSubmit = (replyId: string) => {
    onEdit(replyId, replyEditContent, true, comment.id)
    setEditingReply(null)
    setReplyEditContent("")
  }

  return (
    <div className="space-y-4">
      {/* 메인 댓글 */}
      <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <img
          src={comment.author.image || "/placeholder.svg?height=32&width=32"}
          alt={comment.author.name}
          className="w-8 h-8 rounded-full flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Link href={`/users/${comment.author.email}`} className="font-medium text-gray-900 dark:text-white hover:text-blue-600 transition-colors text-sm">
                {comment.author.name}
              </Link>
              <span className="text-xs text-gray-500">
                {new Date(comment.createdAt).toLocaleDateString("ko-KR", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            {isAuthor && (
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center justify-center w-6 h-6 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <MoreVertical className="w-3 h-3" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => setIsEditing(true)}
                    className="flex items-center cursor-pointer"
                  >
                    <EditIcon className="w-3 h-3 mr-2" />
                    수정
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onDelete(comment.id, false, comment.parentId)}
                    className="flex items-center text-red-600 focus:text-red-600 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3 mr-2" />
                    삭제
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-3">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[80px] resize-none"
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleEditSubmit}
                  disabled={!editContent.trim()}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  저장
                </Button>
                <Button
                  onClick={() => {
                    setIsEditing(false)
                    setEditContent(comment.content)
                  }}
                  variant="outline"
                  size="sm"
                >
                  취소
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap mb-3 break-words">
                {renderMentions(comment.content)}
              </div>
              {session && (
                <button
                  onClick={() => setShowReplyForm(!showReplyForm)}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium hover:underline"
                >
                  답글
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* 대댓글 폼 */}
      {showReplyForm && session && (
        <div className="ml-11 mb-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <div className="flex items-start gap-3">
            <img
              src={session.user?.image || "/placeholder.svg?height=24&width=24"}
              alt={session.user?.name || ""}
              className="w-6 h-6 rounded-full flex-shrink-0"
            />
            <div className="flex-1 relative">
              <Textarea
                value={replyContent}
                onChange={(e) => handleReplyChange(e.target.value)}
                placeholder="답글을 작성해주세요... (@사용자명으로 멘션 가능)"
                className="min-h-[60px] resize-none text-sm"
              />

              {/* 대댓글 멘션 자동완성 드롭다운 */}
              {showReplyMentions && replyMentionSuggestions.length > 0 && (
                <div className="absolute z-10 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-32 overflow-y-auto mt-1">
                  {replyMentionSuggestions.map((user) => (
                    <button
                      key={user.email}
                      type="button"
                      onClick={() => handleReplyMentionSelect(user)}
                      className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                    >
                      <img
                        src={user.image || "/placeholder.svg?height=16&width=16"}
                        alt={user.name}
                        className="w-4 h-4 rounded-full"
                      />
                      <span className="text-xs">{user.name}</span>
                    </button>
                  ))}
                </div>
              )}
              <div className="flex gap-2 mt-2">
                <Button onClick={handleReplySubmit} size="sm" disabled={!replyContent.trim()}>
                  <Send className="w-3 h-3 mr-1" />
                  답글 작성
                </Button>
                <Button
                  onClick={() => {
                    setShowReplyForm(false)
                    setReplyContent("")
                  }}
                  variant="outline"
                  size="sm"
                >
                  취소
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 대댓글 목록 */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-11 space-y-4">
          {comment.replies.map((reply) => (
            <div key={reply.id} className="flex gap-3">
              <img
                src={reply.author.image || "/placeholder.svg?height=24&width=24"}
                alt={reply.author.name}
                className="w-6 h-6 rounded-full flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Link href={`/users/${reply.author.email}`} className="font-medium text-gray-900 dark:text-white text-sm hover:text-blue-600 transition-colors">
                      {reply.author.name}
                    </Link>
                    <span className="text-xs text-gray-500">
                      {new Date(reply.createdAt).toLocaleDateString("ko-KR", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  {session && session.user?.email && session.user.email === reply.author.email && (
                    <DropdownMenu>
                      <DropdownMenuTrigger className="flex items-center justify-center w-5 h-5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        <MoreVertical className="w-2.5 h-2.5" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleReplyEdit(reply.id, reply.content)}
                          className="flex items-center cursor-pointer"
                        >
                          <EditIcon className="w-3 h-3 mr-2" />
                          수정
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onDelete(reply.id, true, comment.id)}
                          className="flex items-center text-red-600 focus:text-red-600 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3 mr-2" />
                          삭제
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>

                {editingReply === reply.id ? (
                  <div className="space-y-2">
                    <Textarea
                      value={replyEditContent}
                      onChange={(e) => setReplyEditContent(e.target.value)}
                      className="min-h-[60px] resize-none text-sm"
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleReplyEditSubmit(reply.id)}
                        disabled={!replyEditContent.trim()}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        저장
                      </Button>
                      <Button
                        onClick={() => {
                          setEditingReply(null)
                          setReplyEditContent("")
                        }}
                        variant="outline"
                        size="sm"
                      >
                        취소
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-gray-700 dark:text-gray-300 break-words">
                    {renderMentions(reply.content)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}