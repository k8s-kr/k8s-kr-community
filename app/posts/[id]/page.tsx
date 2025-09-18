"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { AuthButton } from "@/components/auth-button"
import { ArrowLeft, MessageSquare, Heart, Share2, Send, MoreVertical } from "lucide-react"
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
  comments: Comment[]
}

interface Comment {
  id: string
  content: string
  author: {
    name: string
    image: string
    email: string
  }
  createdAt: string
}

function useTemporarySession() {
  const [session, setSession] = useState<any>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("temp-user")
      if (stored) {
        setSession(JSON.parse(stored))
      }
    }
  }, [])

  return { data: session }
}

export default function PostDetailPage() {
  const { data: session } = useTemporarySession()
  const params = useParams()
  const router = useRouter()
  const [post, setPost] = useState<Post | null>(null)
  const [newComment, setNewComment] = useState("")
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)

  useEffect(() => {
    if (params.id === "create") {
      router.replace("/posts/create")
      return
    }
  }, [params.id, router])

  useEffect(() => {
    if (params.id === "create") return

    const posts = JSON.parse(localStorage.getItem("posts") || "[]")
    const foundPost = posts.find((p: Post) => p.id === params.id)
    if (foundPost) {
      setPost(foundPost)
    }
    console.log("[v0] Looking for post with ID:", params.id)
    console.log(
      "[v0] Available posts:",
      posts.map((p) => ({ id: p.id, title: p.title })),
    )
    console.log("[v0] Found post:", foundPost)
  }, [params.id])

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || !session || !post) return

    setIsSubmittingComment(true)

    try {
      const comment: Comment = {
        id: Date.now().toString(),
        content: newComment.trim(),
        author: {
          name: session.name || "",
          image: session.image || "",
          email: session.email || "",
        },
        createdAt: new Date().toISOString(),
      }

      const posts = JSON.parse(localStorage.getItem("posts") || "[]")
      const updatedPosts = posts.map((p: Post) => {
        if (p.id === post.id) {
          return { ...p, comments: [...p.comments, comment] }
        }
        return p
      })

      localStorage.setItem("posts", JSON.stringify(updatedPosts))
      setPost({ ...post, comments: [...post.comments, comment] })
      setNewComment("")
    } catch (error) {
      console.error("댓글 작성 실패:", error)
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const getCategoryLabel = (category: string) => {
    const labels: { [key: string]: string } = {
      question: "질문",
      tip: "팁",
      discussion: "토론",
      news: "뉴스",
      tutorial: "튜토리얼",
      showcase: "프로젝트",
    }
    return labels[category] || category
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

  if (params.id === "create") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">게시글 작성 페이지로 이동 중...</p>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900 flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-2">게시글을 찾을 수 없습니다</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">요청하신 게시글이 존재하지 않거나 삭제되었습니다.</p>
            <Button asChild>
              <Link href="/posts">게시판으로 돌아가기</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/posts">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  게시판으로
                </Link>
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">게시글</h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">Kubernetes Korea</p>
              </div>
            </div>
            <AuthButton />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Post Content */}
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
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

                  <div className="flex items-center gap-3 mb-4">
                    <img
                      src={post.author.image || "/placeholder.svg?height=40&width=40"}
                      alt={post.author.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{post.author.name}</p>
                      <p className="text-sm text-gray-500">작성자</p>
                    </div>
                  </div>

                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                      {post.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">
                  {post.content}
                </div>
              </div>

              <div className="flex items-center gap-4 mt-8 pt-6 border-t">
                <Button variant="ghost" size="sm">
                  <Heart className="w-4 h-4 mr-2" />
                  좋아요
                </Button>
                <Button variant="ghost" size="sm">
                  <Share2 className="w-4 h-4 mr-2" />
                  공유
                </Button>
                <div className="flex items-center gap-1 text-sm text-gray-500 ml-auto">
                  <MessageSquare className="w-4 h-4" />
                  <span>댓글 {post.comments.length}개</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Comments Section */}
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
                <form onSubmit={handleCommentSubmit} className="space-y-4">
                  <div className="flex items-start gap-3">
                    <img
                      src={session.image || "/placeholder.svg?height=32&width=32"}
                      alt={session.name || ""}
                      className="w-8 h-8 rounded-full"
                    />
                    <div className="flex-1">
                      <Textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="댓글을 작성해주세요..."
                        className="min-h-[80px] resize-none"
                      />
                      <div className="flex justify-end mt-2">
                        <Button
                          type="submit"
                          disabled={!newComment.trim() || isSubmittingComment}
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          {isSubmittingComment ? (
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
                {post.comments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>아직 댓글이 없습니다. 첫 번째 댓글을 작성해보세요!</p>
                  </div>
                ) : (
                  post.comments.map((comment) => (
                    <div key={comment.id} className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <img
                        src={comment.author.image || "/placeholder.svg?height=32&width=32"}
                        alt={comment.author.name}
                        className="w-8 h-8 rounded-full"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900 dark:text-white">{comment.author.name}</span>
                          <span className="text-sm text-gray-500">
                            {new Date(comment.createdAt).toLocaleDateString("ko-KR", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{comment.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
