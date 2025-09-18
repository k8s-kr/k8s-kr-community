import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AuthButton } from "@/components/auth-button"
import { Users, MessageSquare, BookOpen } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
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
                <p className="text-sm text-gray-600 dark:text-gray-300">한국 쿠버네티스 커뮤니티</p>
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
              한국 쿠버네티스 커뮤니티에
              <span className="text-blue-600"> 오신 것을 환영합니다</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 text-pretty">
              쿠버네티스 기술을 함께 배우고, 경험을 나누며, 성장하는 개발자들의 공간입니다. GitHub 계정으로 로그인하여
              커뮤니티에 참여해보세요.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700" asChild>
                <Link href="/posts">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  커뮤니티 둘러보기
                </Link>
              </Button>
              <Button variant="outline" size="lg">
                <BookOpen className="w-5 h-5 mr-2" />
                학습 자료
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white/50 dark:bg-gray-800/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">커뮤니티 특징</h3>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              한국 개발자들을 위한 쿠버네티스 전문 커뮤니티의 주요 특징들입니다.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle>GitHub 통합</CardTitle>
                <CardDescription>GitHub 계정으로 간편하게 로그인하고 개발자 프로필을 연동하세요.</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle>활발한 커뮤니티</CardTitle>
                <CardDescription>한국의 쿠버네티스 전문가들과 함께 지식을 공유하고 네트워킹하세요.</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
                  <BookOpen className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle>학습 자료</CardTitle>
                <CardDescription>초보자부터 전문가까지, 단계별 학습 자료와 실습 예제를 제공합니다.</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Recent Posts Preview */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">최근 게시글</h3>
            <Button variant="outline" asChild>
              <Link href="/posts">전체 보기</Link>
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Sample posts */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary">질문</Badge>
                  <span className="text-sm text-gray-500">2시간 전</span>
                </div>
                <CardTitle className="text-lg">Pod 네트워킹 이슈 해결 방법</CardTitle>
                <CardDescription>멀티 노드 클러스터에서 Pod 간 통신이 안 되는 문제를 겪고 있습니다...</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>작성자: developer123</span>
                  <span>•</span>
                  <span>댓글 5개</span>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    팁
                  </Badge>
                  <span className="text-sm text-gray-500">1일 전</span>
                </div>
                <CardTitle className="text-lg">Helm Chart 최적화 가이드</CardTitle>
                <CardDescription>
                  프로덕션 환경에서 Helm Chart를 효율적으로 관리하는 방법을 공유합니다...
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>작성자: k8s_expert</span>
                  <span>•</span>
                  <span>댓글 12개</span>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    공지
                  </Badge>
                  <span className="text-sm text-gray-500">3일 전</span>
                </div>
                <CardTitle className="text-lg">2024 K8s Korea Meetup 안내</CardTitle>
                <CardDescription>다음 달 오프라인 밋업 일정과 발표자를 모집합니다...</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>작성자: admin</span>
                  <span>•</span>
                  <span>댓글 8개</span>
                </div>
              </CardContent>
            </Card>
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
              <p className="text-gray-400 text-sm">한국 쿠버네티스 커뮤니티</p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">커뮤니티</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white">
                    게시판
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Q&A
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    자료실
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">학습</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white">
                    튜토리얼
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    예제 코드
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    베스트 프랙티스
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">연결</h4>
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
