"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AuthButton } from "@/components/auth-button"
import { ArrowLeft, MessageSquare, Heart, Share2, Send, Edit as EditIcon, MoreVertical, Trash2, Pin, PinOff } from "lucide-react"
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
  likes?: string[] // 좋아요 누른 사용자들의 email 배열
  pinned?: boolean
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
  replies?: Comment[]
  parentId?: string
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
  const searchParams = useSearchParams()
  const [post, setPost] = useState<Post | null>(null)
  const [newComment, setNewComment] = useState("")
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState("")
  const [editingComment, setEditingComment] = useState<string | null>(null)
  const [editContent, setEditContent] = useState("")
  const [mentionSuggestions, setMentionSuggestions] = useState<{name: string, email: string}[]>([])
  const [showMentions, setShowMentions] = useState(false)
  const [mentionFilter, setMentionFilter] = useState("")

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

  // 현재 게시글에 댓글을 작성한 모든 사용자 추출
  const getAvailableUsers = () => {
    if (!post) return []

    const users = new Map()

    // 게시글 작성자 추가
    users.set(post.author.email, {
      name: post.author.name,
      email: post.author.email
    })

    // 댓글 작성자들 추가
    post.comments.forEach(comment => {
      users.set(comment.author.email, {
        name: comment.author.name,
        email: comment.author.email
      })

      // 대댓글 작성자들 추가
      if (comment.replies) {
        comment.replies.forEach(reply => {
          users.set(reply.author.email, {
            name: reply.author.name,
            email: reply.author.email
          })
        })
      }
    })

    // 본인 제외
    if (session) {
      users.delete(session.email)
    }

    return Array.from(users.values())
  }

  const handleMentionInput = (value: string, isReply: boolean = false) => {
    const lastAtIndex = value.lastIndexOf('@')

    if (lastAtIndex !== -1) {
      const afterAt = value.slice(lastAtIndex + 1)
      const spaceIndex = afterAt.indexOf(' ')
      const currentMention = spaceIndex === -1 ? afterAt : afterAt.slice(0, spaceIndex)

      if (currentMention.length >= 0 && spaceIndex === -1) {
        const availableUsers = getAvailableUsers()
        const filtered = availableUsers.filter(user =>
          user.name.toLowerCase().includes(currentMention.toLowerCase())
        )
        setMentionSuggestions(filtered)
        setMentionFilter(currentMention)
        setShowMentions(filtered.length > 0)
      } else {
        setShowMentions(false)
      }
    } else {
      setShowMentions(false)
    }
  }

  const insertMention = (userName: string, isReply: boolean = false) => {
    const currentValue = isReply ? replyContent : newComment
    const lastAtIndex = currentValue.lastIndexOf('@')

    if (lastAtIndex !== -1) {
      const beforeAt = currentValue.slice(0, lastAtIndex)
      const afterAt = currentValue.slice(lastAtIndex + 1)
      const spaceIndex = afterAt.indexOf(' ')
      const afterMention = spaceIndex === -1 ? '' : afterAt.slice(spaceIndex)

      const newValue = `${beforeAt}@${userName}${afterMention}`

      if (isReply) {
        setReplyContent(newValue)
      } else {
        setNewComment(newValue)
      }
    }

    setShowMentions(false)
    setMentionSuggestions([])
  }

  const handleLikeToggle = async () => {
    if (!session || !post) return

    try {
      const posts = JSON.parse(localStorage.getItem("posts") || "[]")
      const updatedPosts = posts.map((p: any) => {
        if (p.id === post.id) {
          const likes = p.likes || []
          const hasLiked = likes.includes(session.email)

          if (hasLiked) {
            // 좋아요 취소
            return {
              ...p,
              likes: likes.filter((email: string) => email !== session.email)
            }
          } else {
            // 좋아요 추가
            return {
              ...p,
              likes: [...likes, session.email]
            }
          }
        }
        return p
      })

      localStorage.setItem("posts", JSON.stringify(updatedPosts))

      // 상태 업데이트
      const likes = post.likes || []
      const hasLiked = likes.includes(session.email)

      if (hasLiked) {
        setPost({
          ...post,
          likes: likes.filter(email => email !== session.email)
        })
      } else {
        setPost({
          ...post,
          likes: [...likes, session.email]
        })
      }
    } catch (error) {
      console.error("좋아요 처리 실패:", error)
    }
  }

  const handlePinToggle = async () => {
    if (!post || !session) return

    // 관리자 권한 체크 (admin 이메일 또는 특정 권한)
    const isAdmin = session.email === "admin@example.com" || session.name === "admin"
    if (!isAdmin) {
      alert("관리자만 고정글을 설정할 수 있습니다.")
      return
    }

    try {
      const posts = JSON.parse(localStorage.getItem("posts") || "[]")
      const updatedPosts = posts.map((p: any) => {
        if (p.id === post.id) {
          return {
            ...p,
            pinned: !p.pinned
          }
        }
        return p
      })

      localStorage.setItem("posts", JSON.stringify(updatedPosts))

      // 상태 업데이트
      setPost({
        ...post,
        pinned: !post.pinned
      })

      alert(post.pinned ? "고정글이 해제되었습니다." : "고정글로 설정되었습니다.")
    } catch (error) {
      console.error("고정글 설정 실패:", error)
    }
  }

  const handleShare = async () => {
    const url = window.location.href

    try {
      if (navigator.share) {
        // 네이티브 공유 API 사용 (모바일)
        await navigator.share({
          title: post?.title,
          text: `${post?.title} - Kubernetes Korea`,
          url: url,
        })
      } else {
        // URL 클립보드에 복사
        await navigator.clipboard.writeText(url)
        alert("게시글 URL이 클립보드에 복사되었습니다!")
      }
    } catch (error) {
      // 폴백: URL을 선택 가능한 텍스트로 표시
      const textArea = document.createElement('textarea')
      textArea.value = url
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      alert("게시글 URL이 클립보드에 복사되었습니다!")
    }
  }

  const renderMentionedText = (text: string) => {
    const mentionRegex = /@([\w가-힣]+)/g
    const parts = text.split(mentionRegex)

    return parts.map((part, index) => {
      if (index % 2 === 1) {
        // 멘션된 사용자명 - 실제 사용자인지 확인
        const availableUsers = getAvailableUsers()
        const isValidUser = availableUsers.some(user => user.name === part)

        if (isValidUser) {
          return (
            <span key={index} className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-1 rounded font-medium cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors">
              @{part}
            </span>
          )
        } else {
          // 유효하지 않은 멘션은 일반 텍스트로 표시
          return `@${part}`
        }
      }
      return part
    })
  }

  const handleDeletePost = async () => {
    if (!post || !session) return

    const confirmed = window.confirm("정말로 이 게시글을 삭제하시겠습니까?")
    if (!confirmed) return

    try {
      const posts = JSON.parse(localStorage.getItem("posts") || "[]")
      const filteredPosts = posts.filter((p: Post) => p.id !== post.id)
      localStorage.setItem("posts", JSON.stringify(filteredPosts))
      router.push("/posts")
    } catch (error) {
      console.error("게시글 삭제 실패:", error)
    }
  }

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
        replies: [],
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

  const handleReplySubmit = async (parentCommentId: string) => {
    if (!replyContent.trim() || !session || !post) return

    try {
      const reply: Comment = {
        id: Date.now().toString(),
        content: replyContent.trim(),
        author: {
          name: session.name || "",
          image: session.image || "",
          email: session.email || "",
        },
        createdAt: new Date().toISOString(),
        parentId: parentCommentId,
      }

      const posts = JSON.parse(localStorage.getItem("posts") || "[]")
      const updatedPosts = posts.map((p: Post) => {
        if (p.id === post.id) {
          const updatedComments = p.comments.map((comment) => {
            if (comment.id === parentCommentId) {
              return {
                ...comment,
                replies: [...(comment.replies || []), reply],
              }
            }
            return comment
          })
          return { ...p, comments: updatedComments }
        }
        return p
      })

      localStorage.setItem("posts", JSON.stringify(updatedPosts))

      const updatedPost = {
        ...post,
        comments: post.comments.map((comment) => {
          if (comment.id === parentCommentId) {
            return {
              ...comment,
              replies: [...(comment.replies || []), reply],
            }
          }
          return comment
        })
      }

      setPost(updatedPost)
      setReplyContent("")
      setReplyingTo(null)
    } catch (error) {
      console.error("대댓글 작성 실패:", error)
    }
  }

  const handleCommentEdit = (commentId: string, currentContent: string) => {
    setEditingComment(commentId)
    setEditContent(currentContent)
  }

  const handleCommentEditSubmit = (commentId: string, isReply: boolean = false, parentId?: string) => {
    if (!editContent.trim() || !post) return

    try {
      const posts = JSON.parse(localStorage.getItem("posts") || "[]")
      const updatedPosts = posts.map((p: Post) => {
        if (p.id === post.id) {
          if (isReply && parentId) {
            // 대댓글 수정
            const updatedComments = p.comments.map((comment) => {
              if (comment.id === parentId) {
                return {
                  ...comment,
                  replies: comment.replies?.map((reply) =>
                    reply.id === commentId
                      ? { ...reply, content: editContent.trim(), updatedAt: new Date().toISOString() }
                      : reply
                  ) || []
                }
              }
              return comment
            })
            return { ...p, comments: updatedComments }
          } else {
            // 메인 댓글 수정
            const updatedComments = p.comments.map((comment) =>
              comment.id === commentId
                ? { ...comment, content: editContent.trim(), updatedAt: new Date().toISOString() }
                : comment
            )
            return { ...p, comments: updatedComments }
          }
        }
        return p
      })

      localStorage.setItem("posts", JSON.stringify(updatedPosts))

      // 상태 업데이트
      if (isReply && parentId) {
        const updatedPost = {
          ...post,
          comments: post.comments.map((comment) => {
            if (comment.id === parentId) {
              return {
                ...comment,
                replies: comment.replies?.map((reply) =>
                  reply.id === commentId
                    ? { ...reply, content: editContent.trim(), updatedAt: new Date().toISOString() }
                    : reply
                ) || []
              }
            }
            return comment
          })
        }
        setPost(updatedPost)
      } else {
        const updatedPost = {
          ...post,
          comments: post.comments.map((comment) =>
            comment.id === commentId
              ? { ...comment, content: editContent.trim(), updatedAt: new Date().toISOString() }
              : comment
          )
        }
        setPost(updatedPost)
      }

      setEditingComment(null)
      setEditContent("")
    } catch (error) {
      console.error("댓글 수정 실패:", error)
    }
  }

  const handleCommentDelete = (commentId: string, isReply: boolean = false, parentId?: string) => {
    const confirmed = window.confirm("정말로 이 댓글을 삭제하시겠습니까?")
    if (!confirmed || !post) return

    try {
      const posts = JSON.parse(localStorage.getItem("posts") || "[]")
      const updatedPosts = posts.map((p: Post) => {
        if (p.id === post.id) {
          if (isReply && parentId) {
            // 대댓글 삭제
            const updatedComments = p.comments.map((comment) => {
              if (comment.id === parentId) {
                return {
                  ...comment,
                  replies: comment.replies?.filter((reply) => reply.id !== commentId) || []
                }
              }
              return comment
            })
            return { ...p, comments: updatedComments }
          } else {
            // 메인 댓글 삭제
            const updatedComments = p.comments.filter((comment) => comment.id !== commentId)
            return { ...p, comments: updatedComments }
          }
        }
        return p
      })

      localStorage.setItem("posts", JSON.stringify(updatedPosts))

      // 상태 업데이트
      if (isReply && parentId) {
        const updatedPost = {
          ...post,
          comments: post.comments.map((comment) => {
            if (comment.id === parentId) {
              return {
                ...comment,
                replies: comment.replies?.filter((reply) => reply.id !== commentId) || []
              }
            }
            return comment
          })
        }
        setPost(updatedPost)
      } else {
        const updatedPost = {
          ...post,
          comments: post.comments.filter((comment) => comment.id !== commentId)
        }
        setPost(updatedPost)
      }
    } catch (error) {
      console.error("댓글 삭제 실패:", error)
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
                {session && (
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {session.email === post.author.email && (
                        <>
                          <DropdownMenuItem
                            onClick={() => router.push(`/posts/${post.id}/edit`)}
                            className="flex items-center cursor-pointer"
                          >
                            <EditIcon className="w-4 h-4 mr-2" />
                            수정
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={handleDeletePost}
                            className="flex items-center text-red-600 focus:text-red-600 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            삭제
                          </DropdownMenuItem>
                        </>
                      )}
                      {(session.email === "admin@example.com" || session.name === "admin") && (
                        <DropdownMenuItem
                          onClick={handlePinToggle}
                          className="flex items-center cursor-pointer"
                        >
                          {post.pinned ? (
                            <>
                              <PinOff className="w-4 h-4 mr-2" />
                              고정 해제
                            </>
                          ) : (
                            <>
                              <Pin className="w-4 h-4 mr-2" />
                              고정하기
                            </>
                          )}
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div
                className="prose prose-lg prose-gray dark:prose-invert max-w-none prose-headings:font-semibold prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-strong:text-gray-900 dark:prose-strong:text-gray-100"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              <div className="flex items-center gap-4 mt-8 pt-6 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLikeToggle}
                  className={`transition-colors relative group ${
                    session && post.likes?.includes(session.email)
                      ? 'text-red-600 hover:text-red-700'
                      : 'text-gray-600 hover:text-gray-700'
                  }`}
                  title={
                    post.likes && post.likes.length > 0
                      ? `좋아요: ${getAvailableUsers()
                          .filter(user => post.likes?.includes(user.email))
                          .map(user => user.name)
                          .join(', ')}`
                      : ''
                  }
                >
                  <Heart
                    className={`w-4 h-4 mr-2 transition-all duration-200 ${
                      session && post.likes?.includes(session.email)
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
                <Button variant="ghost" size="sm" onClick={handleShare}>
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
                    <div className="flex-1 relative">
                      <Textarea
                        value={newComment}
                        onChange={(e) => {
                          setNewComment(e.target.value)
                          handleMentionInput(e.target.value, false)
                        }}
                        placeholder="댓글을 작성해주세요... (@사용자명으로 멘션 가능)"
                        className="min-h-[80px] resize-none"
                      />

                      {/* 멘션 자동완성 드롭다운 */}
                      {showMentions && mentionSuggestions.length > 0 && (
                        <div className="absolute bottom-full left-0 right-0 mb-1 bg-white dark:bg-gray-800 border rounded-lg shadow-lg max-h-32 overflow-y-auto z-10">
                          {mentionSuggestions.map((user) => (
                            <button
                              key={user.email}
                              onClick={() => insertMention(user.name, false)}
                              className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                            >
                              <span className="font-medium">@{user.name}</span>
                            </button>
                          ))}
                        </div>
                      )}
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
                    <div key={comment.id} className="space-y-3">
                      {/* 메인 댓글 */}
                      <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <img
                          src={comment.author.image || "/placeholder.svg?height=32&width=32"}
                          alt={comment.author.name}
                          className="w-8 h-8 rounded-full"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
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
                            {session && session.email === comment.author.email && (
                              <DropdownMenu>
                                <DropdownMenuTrigger className="flex items-center justify-center w-6 h-6 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                                  <MoreVertical className="w-3 h-3" />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => handleCommentEdit(comment.id, comment.content)}
                                    className="flex items-center cursor-pointer"
                                  >
                                    <EditIcon className="w-3 h-3 mr-2" />
                                    수정
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleCommentDelete(comment.id)}
                                    className="flex items-center text-red-600 focus:text-red-600 cursor-pointer"
                                  >
                                    <Trash2 className="w-3 h-3 mr-2" />
                                    삭제
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>

                          {editingComment === comment.id ? (
                            <div className="space-y-2">
                              <Textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="min-h-[80px] resize-none"
                              />
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => handleCommentEditSubmit(comment.id)}
                                  disabled={!editContent.trim()}
                                  size="sm"
                                  className="bg-blue-600 hover:bg-blue-700"
                                >
                                  저장
                                </Button>
                                <Button
                                  onClick={() => {
                                    setEditingComment(null)
                                    setEditContent("")
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
                              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap mb-2">
                                {renderMentionedText(comment.content)}
                              </p>
                              {session && (
                                <button
                                  onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                >
                                  답글
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>

                      {/* 대댓글 폼 */}
                      {replyingTo === comment.id && session && (
                        <div className="ml-11 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-start gap-3">
                            <img
                              src={session.image || "/placeholder.svg?height=24&width=24"}
                              alt={session.name || ""}
                              className="w-6 h-6 rounded-full"
                            />
                            <div className="flex-1 relative">
                              <Textarea
                                value={replyContent}
                                onChange={(e) => {
                                  setReplyContent(e.target.value)
                                  handleMentionInput(e.target.value, true)
                                }}
                                placeholder="답글을 작성해주세요... (@사용자명으로 멘션 가능)"
                                className="min-h-[60px] resize-none text-sm"
                              />

                              {/* 대댓글 멘션 자동완성 드롭다운 */}
                              {showMentions && mentionSuggestions.length > 0 && replyingTo === comment.id && (
                                <div className="absolute bottom-full left-0 right-0 mb-1 bg-white dark:bg-gray-800 border rounded-lg shadow-lg max-h-32 overflow-y-auto z-10">
                                  {mentionSuggestions.map((user) => (
                                    <button
                                      key={user.email}
                                      onClick={() => insertMention(user.name, true)}
                                      className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                                    >
                                      <span className="font-medium text-sm">@{user.name}</span>
                                    </button>
                                  ))}
                                </div>
                              )}
                              <div className="flex gap-2 mt-2">
                                <Button
                                  onClick={() => handleReplySubmit(comment.id)}
                                  disabled={!replyContent.trim()}
                                  size="sm"
                                  className="bg-blue-600 hover:bg-blue-700"
                                >
                                  답글 작성
                                </Button>
                                <Button
                                  onClick={() => {
                                    setReplyingTo(null)
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
                        <div className="ml-11 space-y-3">
                          {comment.replies.map((reply) => (
                            <div key={reply.id} className="flex items-start gap-3 p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                              <img
                                src={reply.author.image || "/placeholder.svg?height=24&width=24"}
                                alt={reply.author.name}
                                className="w-6 h-6 rounded-full"
                              />
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-gray-900 dark:text-white text-sm">{reply.author.name}</span>
                                    <span className="text-xs text-gray-500">
                                      {new Date(reply.createdAt).toLocaleDateString("ko-KR", {
                                        month: "short",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </span>
                                  </div>
                                  {session && session.email === reply.author.email && (
                                    <DropdownMenu>
                                      <DropdownMenuTrigger className="flex items-center justify-center w-5 h-5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                                        <MoreVertical className="w-2.5 h-2.5" />
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem
                                          onClick={() => handleCommentEdit(reply.id, reply.content)}
                                          className="flex items-center cursor-pointer"
                                        >
                                          <EditIcon className="w-3 h-3 mr-2" />
                                          수정
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          onClick={() => handleCommentDelete(reply.id, true, comment.id)}
                                          className="flex items-center text-red-600 focus:text-red-600 cursor-pointer"
                                        >
                                          <Trash2 className="w-3 h-3 mr-2" />
                                          삭제
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  )}
                                </div>

                                {editingComment === reply.id ? (
                                  <div className="space-y-2">
                                    <Textarea
                                      value={editContent}
                                      onChange={(e) => setEditContent(e.target.value)}
                                      className="min-h-[60px] resize-none text-sm"
                                    />
                                    <div className="flex gap-2">
                                      <Button
                                        onClick={() => handleCommentEditSubmit(reply.id, true, comment.id)}
                                        disabled={!editContent.trim()}
                                        size="sm"
                                        className="bg-blue-600 hover:bg-blue-700"
                                      >
                                        저장
                                      </Button>
                                      <Button
                                        onClick={() => {
                                          setEditingComment(null)
                                          setEditContent("")
                                        }}
                                        variant="outline"
                                        size="sm"
                                      >
                                        취소
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap text-sm">
                                    {renderMentionedText(reply.content)}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
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
