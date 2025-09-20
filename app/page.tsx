"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card,  CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AuthButton } from "@/components/auth-button"
import { Users, MessageSquare, BookOpen } from "lucide-react"
import Link from "next/link"
import { stripHtml } from "@/lib/stripHtml"
import { PAGE_MESSAGES, TIME_DISPLAY, CATEGORY_LABELS } from "@/lib/constants/messages"

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
}

export default function HomePage() {
  const [recentPosts, setRecentPosts] = useState<Post[]>([])

  useEffect(() => {
    // localStorage에서 최근 게시글 3개 가져오기
    let posts = JSON.parse(localStorage.getItem("posts") || "[]")

    // 게시글이 없으면 예시 데이터 추가
    if (posts.length === 0) {
      const samplePosts = [
        {
          id: "sample-1",
          title: "Pod 네트워킹 이슈 해결 방법",
          content: "멀티 노드 클러스터에서 Pod 간 통신이 안 되는 문제를 겪고 있습니다. CNI 플러그인 설정에 문제가 있는 것 같은데, Flannel을 사용하고 있고 노드 간 방화벽은 해제했습니다. 혹시 비슷한 경험 있으신 분 계신가요?",
          category: "question",
          tags: ["networking", "pod", "cni", "troubleshooting"],
          author: {
            name: "developer123",
            image: "/placeholder.svg?height=32&width=32",
            email: "dev123@example.com"
          },
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2시간 전
          comments: [
            {
              id: "comment-1",
              content: "비슷한 문제를 겪었는데, kube-proxy 설정을 확인해보세요. 특히 --cluster-cidr 옵션이 올바른지 확인해보시기 바랍니다.",
              author: {
                name: "k8s_expert",
                image: "/placeholder.svg?height=32&width=32",
                email: "expert@example.com"
              },
              createdAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
              replies: []
            }
          ],
          likes: ["expert@example.com", "admin@example.com"]
        },
        {
          id: "sample-2",
          title: "Helm Chart 최적화 가이드",
          content: "프로덕션 환경에서 Helm Chart를 효율적으로 관리하는 방법을 공유합니다.\n\n1. values.yaml 구조화\n2. 환경별 설정 분리\n3. 리소스 제한 설정\n4. 보안 정책 적용\n\n각 항목별 상세한 설명과 예제를 공유드립니다!",
          category: "tip",
          tags: ["helm", "chart", "best-practices", "production"],
          author: {
            name: "k8s_expert",
            image: "/placeholder.svg?height=32&width=32",
            email: "expert@example.com"
          },
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1일 전
          comments: [],
          likes: ["dev123@example.com"]
        },
        {
          id: "sample-3",
          title: "2024 K8s Korea Meetup 안내",
          content: "안녕하세요! 2024년 하반기 Kubernetes Korea 오프라인 밋업을 개최합니다.\n\n📅 일시: 12월 14일 (토) 오후 2시\n📍 장소: 강남구 테헤란로 (상세 주소 추후 공지)\n\n발표 주제:\n- 대규모 클러스터 운영 경험담\n- Istio 서비스 메시 도입기\n- GitOps with ArgoCD\n\n참가 신청은 댓글로 남겨주세요!",
          category: "news",
          tags: ["meetup", "offline", "networking", "presentation"],
          author: {
            name: "admin",
            image: "/placeholder.svg?height=32&width=32",
            email: "admin@example.com"
          },
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3일 전
          comments: [
            {
              id: "comment-2",
              content: "참가 신청합니다! 대규모 클러스터 운영 경험담이 특히 기대됩니다.",
              author: {
                name: "developer123",
                image: "/placeholder.svg?height=32&width=32",
                email: "dev123@example.com"
              },
              createdAt: new Date(Date.now() - 2.8 * 24 * 60 * 60 * 1000).toISOString(),
              replies: []
            }
          ],
          likes: ["dev123@example.com", "expert@example.com"],
          pinned: true
        }
      ]

      localStorage.setItem("posts", JSON.stringify(samplePosts))
      posts = samplePosts
    }

    const sortedPosts = posts
      .sort((a: Post, b: Post) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3)
    setRecentPosts(sortedPosts)
  }, [])

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">K8s</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Kubernetes Korea</h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">{PAGE_MESSAGES.COMMUNITY_TITLE}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <AuthButton />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 text-balance">
              {PAGE_MESSAGES.WELCOME_MESSAGE}
              <span className="text-blue-600"> {PAGE_MESSAGES.WELCOME_HIGHLIGHT}</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 text-pretty">
              {PAGE_MESSAGES.WELCOME_DESCRIPTION}
              {PAGE_MESSAGES.WELCOME_JOIN}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700" asChild>
                <Link href="/posts">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  {PAGE_MESSAGES.EXPLORE_COMMUNITY}
                </Link>
              </Button>
              <Button variant="outline" size="lg">
                <BookOpen className="w-5 h-5 mr-2" />
                {PAGE_MESSAGES.LEARNING_MATERIALS}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white/50 dark:bg-gray-800/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{PAGE_MESSAGES.COMMUNITY_FEATURES}</h3>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              {PAGE_MESSAGES.FEATURES_DESCRIPTION}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle>{PAGE_MESSAGES.GITHUB_INTEGRATION}</CardTitle>
                <CardDescription text={PAGE_MESSAGES.GITHUB_INTEGRATION_DESC} />
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle>{PAGE_MESSAGES.ACTIVE_COMMUNITY}</CardTitle>
                <CardDescription text={PAGE_MESSAGES.ACTIVE_COMMUNITY_DESC} />
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
                  <BookOpen className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle>{PAGE_MESSAGES.LEARNING_MATERIALS}</CardTitle>
                <CardDescription text={PAGE_MESSAGES.LEARNING_MATERIALS_DESC} />
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Recent Posts Preview */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{PAGE_MESSAGES.RECENT_POSTS}</h3>
            <Button variant="outline" asChild>
              <Link href="/posts">{PAGE_MESSAGES.VIEW_ALL}</Link>
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentPosts.length === 0 ? (
              // 게시글이 없을 때 샘플 카드 표시
              <>
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-blue-100 text-blue-800">{CATEGORY_LABELS.question}</Badge>
                      <span className="text-sm text-gray-500">2{TIME_DISPLAY.HOURS_AGO_SUFFIX}</span>
                    </div>
                    <CardTitle className="text-lg">Pod 네트워킹 이슈 해결 방법</CardTitle>
                    <CardDescription text="멀티 노드 클러스터에서 Pod 간 통신이 안 되는 문제를 겪고 있습니다..." />
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>{TIME_DISPLAY.AUTHOR_PREFIX} developer123</span>
                      <span>•</span>
                      <span>댓글 5{TIME_DISPLAY.COMMENTS_SUFFIX}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-green-100 text-green-800">{CATEGORY_LABELS.tip}</Badge>
                      <span className="text-sm text-gray-500">1{TIME_DISPLAY.DAYS_AGO_SUFFIX}</span>
                    </div>
                    <CardTitle className="text-lg">Helm Chart 최적화 가이드</CardTitle>
                    <CardDescription text="프로덕션 환경에서 Helm Chart를 효율적으로 관리하는 방법을 공유합니다..." />
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>{TIME_DISPLAY.AUTHOR_PREFIX} k8s_expert</span>
                      <span>•</span>
                      <span>댓글 12{TIME_DISPLAY.COMMENTS_SUFFIX}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-orange-100 text-orange-800">{CATEGORY_LABELS.news}</Badge>
                      <span className="text-sm text-gray-500">3{TIME_DISPLAY.DAYS_AGO_SUFFIX}</span>
                    </div>
                    <CardTitle className="text-lg">2024 K8s Korea Meetup 안내</CardTitle>
                    <CardDescription text="다음 달 오프라인 밋업 일정과 발표자를 모집합니다..." />
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>{TIME_DISPLAY.AUTHOR_PREFIX} admin</span>
                      <span>•</span>
                      <span>댓글 8{TIME_DISPLAY.COMMENTS_SUFFIX}</span>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              // 실제 게시글 표시
              recentPosts.map((post) => (
                <Link key={post.id} href={`/posts/${post.id}`}>
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getCategoryColor(post.category)}>
                          {getCategoryLabel(post.category)}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {(() => {
                            const now = Date.now()
                            const postTime = new Date(post.createdAt).getTime()
                            const diffHours = Math.floor((now - postTime) / (1000 * 60 * 60))
                            const diffDays = Math.floor(diffHours / 24)

                            if (diffHours < 24) {
                              return `${diffHours}${TIME_DISPLAY.HOURS_AGO_SUFFIX}`
                            } else {
                              return `${diffDays}${TIME_DISPLAY.DAYS_AGO_SUFFIX}`
                            }
                          })()}
                        </span>
                      </div>
                      <CardTitle className="text-lg">{post.title}</CardTitle>
                      <CardDescription html={post.content} maxLength={100} />
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>{TIME_DISPLAY.AUTHOR_PREFIX} {post.author.name}</span>
                        <span>•</span>
                        <span>댓글 {post.comments.length}{TIME_DISPLAY.COMMENTS_SUFFIX}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">K8s</span>
                </div>
                <span className="font-bold">Kubernetes Korea</span>
              </div>
              <p className="text-gray-400 text-sm">{PAGE_MESSAGES.COMMUNITY_TITLE}</p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">{PAGE_MESSAGES.COMMUNITY}</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white">
                    {PAGE_MESSAGES.BOARD}
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Q&A
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{PAGE_MESSAGES.LEARNING}</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white">
                    {PAGE_MESSAGES.CONTRIBUTE}
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    {PAGE_MESSAGES.BEST_PRACTICES}
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">{PAGE_MESSAGES.CONNECT}</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white">
                    GitHub
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Slack
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Discord
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 Kubernetes Korea Community. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
