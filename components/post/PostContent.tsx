"use client"

import { Badge } from "@/components/ui/badge"
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { formatDistanceToNow } from "date-fns"
import { ko } from "date-fns/locale"
import { Pin } from "lucide-react"
import { PostActions } from "./PostActions"
import { CATEGORY_LABELS, POST_MESSAGES } from "@/lib/constants/messages"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"

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

interface PostContentProps {
  post: Post
  session: any
  onDelete: () => void
  onPinToggle: () => void
  renderMentions: (text: string) => React.ReactNode
}

export function PostContent({ post, session, onDelete, onPinToggle, renderMentions }: PostContentProps) {
  const searchParams = useSearchParams()
  const router = useRouter()

  const getCategoryLabel = (category: string) => {
    return CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS] || category
  }

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      question: "bg-blue-100 text-blue-800",
      tip: "bg-green-100 text-green-800",
      discussion: "bg-purple-100 text-purple-800",
      news: "bg-orange-100 text-orange-800",
      tutorial: "bg-indigo-100 text-indigo-800",
      showcase: "bg-pink-100 text-pink-800",
    }
    return colors[category] || "bg-gray-100 text-gray-800"
  }

  return (
    <>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              {post.pinned && (
                <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                  <Pin className="w-3 h-3 mr-1" />
                  고정
                </Badge>
              )}
              <Badge className={getCategoryColor(post.category)}>{getCategoryLabel(post.category)}</Badge>
              <span className="text-sm text-gray-500">
                {new Date(post.createdAt).toLocaleDateString("ko-KR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <CardTitle className="text-2xl md:text-3xl mb-4 text-balance">{post.title}</CardTitle>

            <Link href={`/users/${post.author.email}`} className="flex items-center gap-3 mb-4 hover:opacity-80 transition-opacity group">
              <img
                src={post.author.image || "/placeholder.svg?height=40&width=40"}
                alt={post.author.name}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <p className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">{post.author.name}</p>
                <p className="text-sm text-gray-500">작성자</p>
              </div>
            </Link>

            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {post.tags.map((tag, index) => (
                  <Badge
                    key={index}
                    className="text-xs border border-gray-200 bg-gray-50 text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 cursor-pointer transition-colors"
                    onClick={() => {
                      const currentTagParam = searchParams.get('tag')
                      const currentTags = currentTagParam ? currentTagParam.split(',') : []

                      if (!currentTags.includes(tag)) {
                        const newTags = [...currentTags, tag]
                        router.push(`/posts?tag=${encodeURIComponent(newTags.join(','))}`)
                      } else {
                        router.push(`/posts?tag=${encodeURIComponent(tag)}`)
                      }
                    }}
                  >
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <PostActions
            post={post}
            session={session}
            onDelete={onDelete}
            onPinToggle={onPinToggle}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div
          className="prose prose-lg prose-gray dark:prose-invert max-w-none prose-headings:font-semibold prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-strong:text-gray-900 dark:prose-strong:text-gray-100"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </CardContent>
    </>
  )
}