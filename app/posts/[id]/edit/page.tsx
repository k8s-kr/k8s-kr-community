"use client"

import React from "react"

import { useState, useEffect, useMemo, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"

// React Quill 동적 import (SSR 이슈 방지)
const ReactQuill = dynamic(
  async () => {
    const { default: RQ } = await import('react-quill')
    // forward ref to ReactQuill
    return React.forwardRef((props, ref) => <RQ {...props} ref={ref} />)
  },
  { ssr: false }
)

// Quill CSS import
import 'react-quill/dist/quill.snow.css'

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

function useTemporarySession() {
  const [session, setSession] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("temp-user")
      return stored ? JSON.parse(stored) : null
    }
    return null
  })

  return { data: session, status: session ? "authenticated" : "unauthenticated" }
}

export default function EditPostPage() {
  const { data: session, status } = useTemporarySession()
  const params = useParams()
  const router = useRouter()
  const [post, setPost] = useState<Post | null>(null)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [category, setCategory] = useState("")
  const [tags, setTags] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const quillRef = useRef<any>(null)

  // 이미지 업로드 핸들러
  const imageHandler = () => {
    const input = document.createElement('input')
    input.setAttribute('type', 'file')
    input.setAttribute('accept', 'image/*')
    input.click()

    input.onchange = () => {
      const file = input.files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const base64 = e.target?.result as string
          const quillEditor = quillRef.current?.getEditor()
          if (quillEditor) {
            const range = quillEditor.getSelection(true)
            quillEditor.insertEmbed(range.index, 'image', base64)
            quillEditor.setSelection(range.index + 1)
          }
        }
        reader.readAsDataURL(file)
      }
    }
  }

  // Quill 에디터 설정
  const quillModules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'color': [] }, { 'background': [] }],
        ['link', 'image', 'code-block'],
        ['clean']
      ],
      handlers: {
        image: imageHandler
      }
    },
  }), [])

  const quillFormats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'color', 'background',
    'link', 'image', 'code-block'
  ]

  useEffect(() => {
    if (params.id) {
      const posts = JSON.parse(localStorage.getItem("posts") || "[]")
      const foundPost = posts.find((p: Post) => p.id === params.id)
      if (foundPost) {
        setPost(foundPost)
        setTitle(foundPost.title)
        setContent(foundPost.content)
        setCategory(foundPost.category)
        setTags(foundPost.tags.join(", "))
      }
      setLoading(false)
    }
  }, [params.id])

  if (loading) {
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
            <p className="text-gray-600 dark:text-gray-300">게시글을 수정하려면 로그인해주세요.</p>
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

  if (post.author.email !== session.email) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900 flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-2">수정 권한이 없습니다</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">본인이 작성한 게시글만 수정할 수 있습니다.</p>
            <Button asChild>
              <Link href={`/posts/${post.id}`}>게시글로 돌아가기</Link>
            </Button>
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
      const posts = JSON.parse(localStorage.getItem("posts") || "[]")
      const updatedPosts = posts.map((p: Post) => {
        if (p.id === post.id) {
          return {
            ...p,
            title: title.trim(),
            content: content.trim(),
            category,
            tags: tags
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean),
            updatedAt: new Date().toISOString(),
          }
        }
        return p
      })

      localStorage.setItem("posts", JSON.stringify(updatedPosts))
      router.push(`/posts/${post.id}`)
    } catch (error) {
      console.error("게시글 수정 실패:", error)
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
              <Link href={`/posts/${post.id}`}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                게시글로
              </Link>
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">게시글 수정</h1>
              <p className="text-sm text-gray-600 dark:text-gray-300">내용을 수정하고 저장하세요</p>
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
                  src={session.image || "/placeholder.svg?height=40&width=40"}
                  alt={session.name || ""}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{session.name}</p>
                  <p className="text-sm text-gray-500">게시글 수정 중</p>
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
                  <div className="relative">
                    <ReactQuill
                      ref={quillRef}
                      value={content}
                      onChange={setContent}
                      modules={quillModules}
                      formats={quillFormats}
                      placeholder="게시글 내용을 작성하세요. 이미지 업로드 버튼을 클릭하거나 복사-붙여넣기도 가능합니다."
                      style={{ height: '400px' }}
                    />
                  </div>
                  <div className="mt-1">
                    <p className="text-sm text-gray-500 bg-white relative z-10">
                      에디터를 사용해서 텍스트 서식, 이미지, 링크 등을 추가할 수 있습니다.
                    </p>
                  </div>
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
                        저장 중...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        수정 완료
                      </>
                    )}
                  </Button>
                  <Button type="button" variant="outline" asChild>
                    <Link href={`/posts/${post.id}`}>취소</Link>
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