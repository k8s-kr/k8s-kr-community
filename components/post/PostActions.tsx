"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Edit as EditIcon, MoreVertical, Trash2, Pin, PinOff } from "lucide-react"
import { useRouter } from "next/navigation"
import { BUTTON_LABELS, ALERT_MESSAGES, POST_MESSAGES } from "@/lib/constants/messages"

interface Post {
  id: string
  title: string
  content: string
  category: string
  tags: string[]
  author: {
    name: string
    image: string
    email: string
  }
  createdAt: string
  comments: any[]
  likes?: string[]
  pinned?: boolean
}

interface PostActionsProps {
  post: Post
  session: any
  onDelete: () => void
  onPinToggle: () => void
}

export function PostActions({ post, session, onDelete, onPinToggle }: PostActionsProps) {
  const router = useRouter()

  const isAuthor = session?.user?.email && session.user.email === post.author.email
  const isAdmin = (session?.user?.email && session.user.email === "admin@example.com") ||
                  (session?.user?.name && session.user.name === "admin")

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
        <MoreVertical className="w-4 h-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {isAuthor && (
          <>
            <DropdownMenuItem
              onClick={() => router.push(`/posts/${post.id}/edit`)}
              className="flex items-center cursor-pointer"
            >
              <EditIcon className="w-4 h-4 mr-2" />
              {BUTTON_LABELS.EDIT}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={onDelete}
              className="flex items-center cursor-pointer text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {BUTTON_LABELS.DELETE}
            </DropdownMenuItem>
          </>
        )}
        {isAdmin && (
          <DropdownMenuItem
            onClick={onPinToggle}
            className="flex items-center cursor-pointer"
          >
            {post.pinned ? (
              <>
                <PinOff className="w-4 h-4 mr-2" />
                {POST_MESSAGES.UNPIN_POST}
              </>
            ) : (
              <>
                <Pin className="w-4 h-4 mr-2" />
                {POST_MESSAGES.PIN_POST}
              </>
            )}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}