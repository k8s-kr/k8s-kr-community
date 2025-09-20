"use client"

import { forwardRef } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, Eye, Pin } from "lucide-react"
import { CATEGORY_LABELS } from '@/lib/constants/messages'
import Link from "next/link"

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

interface PostCardProps {
  post: Post
  tagFilters: string[]
  handleTagClick: (tag: string) => void
}

export const PostCard = forwardRef<HTMLAnchorElement, PostCardProps>(
  ({ post, tagFilters, handleTagClick }, ref) => {
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
      <Link
        href={`/posts/${post.id}`}
        className="block hover:shadow-lg transition-shadow"
        ref={ref}
      >
      <Card className={post.pinned ? "ring-2 ring-yellow-200 bg-yellow-50/50" : ""}>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {post.pinned && (
                  <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                    <Pin className="w-3 h-3 mr-1" />
                    고정
                  </Badge>
                )}
                <Badge className={getCategoryColor(post.category)}>{getCategoryLabel(post.category)}</Badge>
                <span className="text-sm text-gray-500">
                  {new Date(post.createdAt).toLocaleDateString("ko-KR")}
                </span>
              </div>
              <CardTitle className="text-xl mb-2 hover:text-blue-600 cursor-pointer transition-colors">
                {post.title}
              </CardTitle>
              <CardDescription
                html={post.content}
                maxLength={150}
                className="line-clamp-2"
              />
            </div>
          </div>

          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {post.tags.map((tag, tagIndex) => (
                <Badge
                  key={tagIndex}
                  className={`text-xs cursor-pointer transition-colors ${
                    tagFilters.includes(tag)
                      ? 'bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700'
                  }`}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleTagClick(tag)
                  }}
                >
                  #{tag}
                  {tagFilters.includes(tag) && (
                    <span className="ml-1">✓</span>
                  )}
                </Badge>
              ))}
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={post.author.image || "/placeholder.svg?height=24&width=24"}
                alt={post.author.name}
                className="w-6 h-6 rounded-full"
              />
              <span className="text-sm text-gray-600 dark:text-gray-300">{post.author.name}</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <MessageSquare className="w-4 h-4" />
                <span>{post.comments.length}</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                <span>0</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
})

PostCard.displayName = "PostCard"