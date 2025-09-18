"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AuthButton } from "@/components/auth-button"
import { Plus, Search, MessageSquare, Eye } from "lucide-react"
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

export default function PostsPage() {
  const { data: session } = useTemporarySession()
  const [posts, setPosts] = useState<Post[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  useEffect(() => {
    const savedPosts = JSON.parse(localStorage.getItem("posts") || "[]")
    setPosts(savedPosts)
  }, [])

  useEffect(() => {
    const handleFocus = () => {
      const savedPosts = JSON.parse(localStorage.getItem("posts") || "[]")
      setPosts(savedPosts)
    }

    window.addEventListener("focus", handleFocus)
    return () => window.removeEventListener("focus", handleFocus)
  }, [])

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = selectedCategory === "all" || post.category === selectedCategory
    return matchesSearch && matchesCategory
  })

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">K8s</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">Kubernetes Korea</h1>
                  <p className="text-sm text-gray-600 dark:text-gray-300">커뮤니티 게시판</p>
                </div>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              {session && (
                <Button asChild className="bg-blue-600 hover:bg-blue-700">
                  <Link href="/posts/create">
                    <Plus className="w-4 h-4 mr-2" />글 작성
                  </Link>
                </Button>
              )}
              <AuthButton />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filter */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="게시글, 태그 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="카테고리" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="question">질문</SelectItem>
                <SelectItem value="tip">팁 & 노하우</SelectItem>
                <SelectItem value="discussion">토론</SelectItem>
                <SelectItem value="news">뉴스 & 업데이트</SelectItem>
                <SelectItem value="tutorial">튜토리얼</SelectItem>
                <SelectItem value="showcase">프로젝트 소개</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Posts List */}
        <div className="space-y-6">
          {filteredPosts.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {posts.length === 0 ? "아직 게시글이 없습니다" : "검색 결과가 없습니다"}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {posts.length === 0 ? "첫 번째 게시글을 작성해보세요!" : "다른 검색어나 카테고리를 시도해보세요."}
                </p>
                {session && posts.length === 0 && (
                  <Button asChild className="bg-blue-600 hover:bg-blue-700">
                    <Link href="/posts/create">
                      <Plus className="w-4 h-4 mr-2" />첫 게시글 작성하기
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            filteredPosts.map((post) => (
              <Link href={`/posts/${post.id}`} key={post.id} className="block hover:shadow-lg transition-shadow">
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getCategoryColor(post.category)}>{getCategoryLabel(post.category)}</Badge>
                          <span className="text-sm text-gray-500">
                            {new Date(post.createdAt).toLocaleDateString("ko-KR")}
                          </span>
                        </div>
                        <CardTitle className="text-xl mb-2 hover:text-blue-600 cursor-pointer transition-colors">
                          {post.title}
                        </CardTitle>
                        <CardDescription className="line-clamp-2">{post.content.substring(0, 150)}...</CardDescription>
                      </div>
                    </div>

                    {post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {post.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            #{tag}
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
            ))
          )}
        </div>
      </div>
    </div>
  )
}
