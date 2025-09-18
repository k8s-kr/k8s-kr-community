"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Send } from "lucide-react"
import Link from "next/link"

function useTemporarySession() {
  const [session, setSession] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("temp-user")
      return stored ? JSON.parse(stored) : null
    }
    return null
  })

  const signIn = (userData: any) => {
    localStorage.setItem("temp-user", JSON.stringify(userData))
    setSession(userData)
  }

  const signOut = () => {
    localStorage.removeItem("temp-user")
    setSession(null)
  }

  return { data: session, status: session ? "authenticated" : "unauthenticated", signIn, signOut }
}

export default function CreatePostPage() {
  const { data: session, status } = useTemporarySession()
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [category, setCategory] = useState("")
  const [tags, setTags] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">로딩 중...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>로그인이 필요합니다</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600 dark:text-gray-300">게시글을 작성하려면 로그인해주세요.</p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" size="sm" asChild>
                <Link href="/">홈으로</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/signin">로그인</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim() || !category) return

    setIsSubmitting(true)

    try {
      const postData = {
        title: title.trim(),
        content: content.trim(),
        category,
        tags: tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        author: {
          name: session.user?.name || session.name,
          image: session.user?.image || session.image,
          email: session.user?.email || session.email,
        },
        createdAt: new Date().toISOString(),
      }

      const existingPosts = JSON.parse(localStorage.getItem("posts") || "[]")
      const newPost = {
        ...postData,
        id: Date.now().toString(),
        comments: [],
      }
      existingPosts.unshift(newPost)
      localStorage.setItem("posts", JSON.stringify(existingPosts))

      router.push(`/posts/${newPost.id}`)
    } catch (error) {
      console.error("게시글 작성 실패:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/posts">
                <ArrowLeft className="w-4 h-4 mr-2" />
                게시판으로
              </Link>
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">새 게시글 작성</h1>
              <p className="text-sm text-gray-600 dark:text-gray-300">커뮤니티와 지식을 공유해보세요</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <div className="flex items-center gap-3">
                <img
                  src={session.user?.image || session.image || "/placeholder.svg?height=40&width=40"}
                  alt={session.user?.name || session.name || ""}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{session.user?.name || session.name}</p>
                  <p className="text-sm text-gray-500">으로 게시글 작성</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="category">카테고리</Label>
                  <Select value={category} onValueChange={setCategory} required>
                    <SelectTrigger>
                      <SelectValue placeholder="카테고리를 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="question">질문</SelectItem>
                      <SelectItem value="tip">팁 & 노하우</SelectItem>
                      <SelectItem value="discussion">토론</SelectItem>
                      <SelectItem value="news">뉴스 & 업데이트</SelectItem>
                      <SelectItem value="tutorial">튜토리얼</SelectItem>
                      <SelectItem value="showcase">프로젝트 소개</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">제목</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="게시글 제목을 입력하세요"
                    required
                    className="text-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">내용</Label>
                  <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="게시글 내용을 작성하세요. 마크다운 문법을 사용할 수 있습니다."
                    required
                    className="min-h-[300px] resize-none"
                  />
                  <p className="text-sm text-gray-500">
                    마크다운 문법을 지원합니다. 코드 블록은 \`\`\`언어명으로 시작하세요.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">태그</Label>
                  <Input
                    id="tags"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="태그를 쉼표로 구분하여 입력하세요 (예: kubernetes, docker, helm)"
                  />
                  <p className="text-sm text-gray-500">
                    관련 기술이나 주제를 태그로 추가하면 다른 사용자들이 쉽게 찾을 수 있습니다.
                  </p>
                </div>

                {tags && (
                  <div className="flex flex-wrap gap-2">
                    {tags.split(",").map(
                      (tag, index) =>
                        tag.trim() && (
                          <Badge key={index} variant="secondary">
                            {tag.trim()}
                          </Badge>
                        ),
                    )}
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    disabled={!title.trim() || !content.trim() || !category || isSubmitting}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        게시 중...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        게시글 작성
                      </>
                    )}
                  </Button>
                  <Button type="button" variant="outline" asChild>
                    <Link href="/posts">취소</Link>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
