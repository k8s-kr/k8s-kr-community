"use client"

import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { AuthButton } from "@/components/auth-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { User, Mail, Calendar, MessageSquare, Heart, Settings, UserPlus, UserMinus, Trash2, Edit3, Users, Github, ExternalLink, Search } from "lucide-react"
import Link from "next/link"
import { useEffect, useState, useCallback, useMemo } from "react"
import { signOut } from "next-auth/react"
import { toast } from "sonner"

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

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const [userPosts, setUserPosts] = useState<Post[]>([])
  const [userStats, setUserStats] = useState({
    totalPosts: 0,
    totalComments: 0,
    totalLikes: 0
  })

  // 디버깅: 세션 데이터 확인
  console.log("ProfilePage - Full session data:", session)
  console.log("ProfilePage - GitHub username:", session?.user?.githubUsername)
  console.log("ProfilePage - User name:", session?.user?.name)
  console.log("ProfilePage - User email:", session?.user?.email)
  const [displayName, setDisplayName] = useState("")
  const [editingName, setEditingName] = useState(false)
  const [bio, setBio] = useState("")
  const [editingBio, setEditingBio] = useState(false)
  const [followers, setFollowers] = useState<string[]>([])
  const [following, setFollowing] = useState<string[]>([])
  const [allUsers, setAllUsers] = useState<{ email: string; name: string; image: string }[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<{ email: string; name: string; image: string }[]>([])

  // 페이지네이션 상태
  const [followingPage, setFollowingPage] = useState(1)
  const [otherUsersPage, setOtherUsersPage] = useState(1)
  const [followersPage, setFollowersPage] = useState(1)
  const [postsPage, setPostsPage] = useState(1)
  const USERS_PER_PAGE = 5
  const POSTS_PER_PAGE = 3

  useEffect(() => {
    if (session?.user?.email) {
      setDisplayName(session.user.name || "")

      // 사용자 바이오 로드
      const userBios = JSON.parse(localStorage.getItem("userBios") || "{}")
      setBio(userBios[session.user.email] || "")

      const posts = JSON.parse(localStorage.getItem("posts") || "[]")
      let userPostsData = posts.filter((post: Post) => post.author.email === session.user.email)

      // 테스트용 임시 게시글 데이터 추가 (페이지네이션 테스트를 위해)
      if (userPostsData.length < 5) {
        const tempPosts = [
          {
            id: `temp-1-${session.user.email}`,
            title: "Kubernetes 클러스터 설정 가이드",
            content: "프로덕션 환경에서 Kubernetes 클러스터를 설정하는 방법에 대해 설명합니다. 이 가이드는 실제 운영 환경에서 검증된 방법들을 다룹니다.",
            category: "tutorial",
            tags: ["kubernetes", "devops", "cluster"],
            author: {
              name: session.user.name,
              email: session.user.email,
              image: session.user.image
            },
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            comments: [],
            likes: []
          },
          {
            id: `temp-2-${session.user.email}`,
            title: "Docker 컨테이너 최적화 팁",
            content: "Docker 컨테이너의 성능을 향상시키고 이미지 크기를 줄이는 실용적인 방법들을 공유합니다. 멀티 스테이지 빌드부터 시작해보세요.",
            category: "tip",
            tags: ["docker", "optimization", "containers"],
            author: {
              name: session.user.name,
              email: session.user.email,
              image: session.user.image
            },
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            comments: [{ author: { name: "테스터", email: "test@example.com" }, content: "유용한 정보네요!" }],
            likes: ["kim.developer@example.com", "lee.designer@example.com"]
          },
          {
            id: `temp-3-${session.user.email}`,
            title: "마이크로서비스 아키텍처 경험담",
            content: "대규모 시스템을 마이크로서비스로 전환하면서 겪은 경험과 교훈을 공유합니다. 성공과 실패 사례를 모두 다룹니다.",
            category: "experience",
            tags: ["microservices", "architecture", "scalability"],
            author: {
              name: session.user.name,
              email: session.user.email,
              image: session.user.image
            },
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            comments: [],
            likes: ["park.manager@example.com"]
          },
          {
            id: `temp-4-${session.user.email}`,
            title: "Helm 차트 작성 베스트 프랙티스",
            content: "Kubernetes 애플리케이션 배포를 위한 Helm 차트 작성 시 고려해야 할 사항들과 베스트 프랙티스를 정리했습니다.",
            category: "tutorial",
            tags: ["helm", "kubernetes", "deployment"],
            author: {
              name: session.user.name,
              email: session.user.email,
              image: session.user.image
            },
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            comments: [{ author: { name: "개발자", email: "dev@example.com" }, content: "실무에 바로 적용해보겠습니다." }],
            likes: []
          },
          {
            id: `temp-5-${session.user.email}`,
            title: "GitOps 도입 후기",
            content: "ArgoCD를 사용한 GitOps 방식의 CD 파이프라인 구축 경험을 공유합니다. 기존 방식과의 차이점과 장단점을 비교 분석했습니다.",
            category: "experience",
            tags: ["gitops", "argocd", "cicd"],
            author: {
              name: session.user.name,
              email: session.user.email,
              image: session.user.image
            },
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            comments: [
              { author: { name: "DevOps", email: "devops@example.com" }, content: "GitOps 도입을 고려중이었는데 도움이 됩니다." },
              { author: { name: "운영자", email: "ops@example.com" }, content: "실제 운영 경험이 궁금했습니다." }
            ],
            likes: ["jung.devops@example.com", "yoon.frontend@example.com", "kang.backend@example.com"]
          }
        ]

        // 기존 게시글이 없으면 임시 게시글 추가
        const newTempPosts = tempPosts.slice(0, 5 - userPostsData.length)
        userPostsData = [...userPostsData, ...newTempPosts]
      }

      // 사용자가 작성한 댓글 수 계산
      let commentCount = 0
      posts.forEach((post: Post) => {
        post.comments.forEach((comment: any) => {
          if (comment.author.email === session.user.email) {
            commentCount++
          }
        })
      })

      // 사용자가 받은 좋아요 수 계산
      let likeCount = 0
      userPostsData.forEach((post: Post) => {
        likeCount += post.likes?.length || 0
      })

      setUserPosts(userPostsData)
      setUserStats({
        totalPosts: userPostsData.length,
        totalComments: commentCount,
        totalLikes: likeCount
      })

      // 팔로우 데이터 로드
      const followData = JSON.parse(localStorage.getItem("userFollows") || "{}")

      // 테스트용 임시 팔로워 데이터 추가
      const existingFollowers = followData[session.user.email]?.followers || []
      const tempFollowers = [
        "kim.developer@example.com",
        "lee.designer@example.com",
        "park.manager@example.com",
        "choi.tester@example.com",
        "jung.devops@example.com",
        "yoon.frontend@example.com",
        "kang.backend@example.com",
        "han.fullstack@example.com"
      ].filter(email => !existingFollowers.includes(email))

      const allFollowers = [...existingFollowers, ...tempFollowers]

      setFollowers(allFollowers)
      setFollowing(followData[session.user.email]?.following || [])

      // 모든 사용자 목록 생성 (게시글 작성자들로부터)
      const users = new Map()
      posts.forEach((post: Post) => {
        if (!users.has(post.author.email)) {
          users.set(post.author.email, {
            email: post.author.email,
            name: post.author.name,
            image: post.author.image
          })
        }
      })

      // 페이지네이션 테스트를 위한 가상 사용자 추가
      const dummyUsers = [
        { email: "kim.developer@example.com", name: "김개발", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=kim" },
        { email: "lee.designer@example.com", name: "이디자인", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=lee" },
        { email: "park.manager@example.com", name: "박매니저", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=park" },
        { email: "choi.tester@example.com", name: "최테스터", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=choi" },
        { email: "jung.devops@example.com", name: "정데브옵스", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=jung" },
        { email: "yoon.frontend@example.com", name: "윤프론트", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=yoon" },
        { email: "kang.backend@example.com", name: "강백엔드", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=kang" },
        { email: "han.fullstack@example.com", name: "한풀스택", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=han" },
        { email: "shin.mobile@example.com", name: "신모바일", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=shin" },
        { email: "oh.ai@example.com", name: "오AI엔지니어", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=oh" },
        { email: "song.cloud@example.com", name: "송클라우드", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=song" },
        { email: "im.security@example.com", name: "임보안", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=im" },
        { email: "moon.data@example.com", name: "문데이터", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=moon" },
        { email: "lim.blockchain@example.com", name: "임블록체인", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=lim" },
        { email: "jang.ux@example.com", name: "장UX", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=jang" },
        { email: "seo.product@example.com", name: "서프로덕트", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=seo" },
        { email: "kwon.startup@example.com", name: "권스타트업", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=kwon" },
        { email: "nam.freelancer@example.com", name: "남프리랜서", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=nam" },
        { email: "ahn.consultant@example.com", name: "안컨설턴트", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=ahn" },
        { email: "woo.researcher@example.com", name: "우연구원", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=woo" }
      ]

      // 현재 사용자를 제외한 가상 사용자 추가
      dummyUsers.forEach(user => {
        if (!users.has(user.email) && user.email !== session.user.email) {
          users.set(user.email, user)
        }
      })

      setAllUsers(Array.from(users.values()))
    }
  }, [session])

  const handleNameUpdate = () => {
    if (!session?.user?.email) return

    // localStorage의 게시글에서 해당 사용자의 이름 업데이트
    const posts = JSON.parse(localStorage.getItem("posts") || "[]")
    const updatedPosts = posts.map((post: Post) => {
      if (post.author.email === session.user.email) {
        return {
          ...post,
          author: { ...post.author, name: displayName }
        }
      }
      return post
    })
    localStorage.setItem("posts", JSON.stringify(updatedPosts))

    setEditingName(false)
    toast.success("이름이 성공적으로 업데이트되었습니다.")
  }

  const handleBioUpdate = () => {
    if (!session?.user?.email) return

    // 사용자 바이오 저장
    const userBios = JSON.parse(localStorage.getItem("userBios") || "{}")
    userBios[session.user.email] = bio
    localStorage.setItem("userBios", JSON.stringify(userBios))

    setEditingBio(false)
    toast.success("자기소개가 성공적으로 업데이트되었습니다.")
  }

  const handleFollowToggle = (targetEmail: string) => {
    if (!session?.user?.email) return

    const followData = JSON.parse(localStorage.getItem("userFollows") || "{}")

    if (!followData[session.user.email]) {
      followData[session.user.email] = { followers: [], following: [] }
    }
    if (!followData[targetEmail]) {
      followData[targetEmail] = { followers: [], following: [] }
    }

    const isFollowing = followData[session.user.email].following.includes(targetEmail)

    if (isFollowing) {
      // 언팔로우
      followData[session.user.email].following = followData[session.user.email].following.filter((email: string) => email !== targetEmail)
      followData[targetEmail].followers = followData[targetEmail].followers.filter((email: string) => email !== session.user.email)
      toast.success("언팔로우했습니다.")
    } else {
      // 팔로우
      followData[session.user.email].following.push(targetEmail)
      followData[targetEmail].followers.push(session.user.email)
      toast.success("팔로우했습니다.")
    }

    localStorage.setItem("userFollows", JSON.stringify(followData))
    setFollowers(followData[session.user.email].followers)
    setFollowing(followData[session.user.email].following)
  }

  const handleDeleteAccount = async () => {
    if (!session?.user?.email) return

    try {
      // 사용자의 모든 게시글과 댓글 삭제
      const posts = JSON.parse(localStorage.getItem("posts") || "[]")
      const updatedPosts = posts.filter((post: Post) => post.author.email !== session.user.email)
        .map((post: Post) => ({
          ...post,
          comments: post.comments.filter((comment: any) => comment.author.email !== session.user.email)
        }))

      localStorage.setItem("posts", JSON.stringify(updatedPosts))

      // 팔로우 데이터에서 사용자 제거
      const followData = JSON.parse(localStorage.getItem("userFollows") || "{}")
      delete followData[session.user.email]

      // 다른 사용자의 팔로잉/팔로워 목록에서도 제거
      Object.keys(followData).forEach(userEmail => {
        followData[userEmail].followers = followData[userEmail].followers.filter((email: string) => email !== session.user.email)
        followData[userEmail].following = followData[userEmail].following.filter((email: string) => email !== session.user.email)
      })

      localStorage.setItem("userFollows", JSON.stringify(followData))

      toast.success("계정이 성공적으로 삭제되었습니다.")

      // 로그아웃
      await signOut({ callbackUrl: "/" })
    } catch (error) {
      toast.error("계정 삭제 중 오류가 발생했습니다.")
    }
  }

  // 디바운스된 검색 함수
  const debouncedSearch = useCallback((query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    // 커뮤니티 내 사용자 검색 (이름 또는 이메일로)
    const filtered = allUsers.filter(user =>
      user.email !== session?.user?.email && (
        user.name.toLowerCase().includes(query.toLowerCase()) ||
        user.email.toLowerCase().includes(query.toLowerCase())
      )
    )
    setSearchResults(filtered)
  }, [allUsers, session?.user?.email])

  const handleUserSearch = useCallback((query: string) => {
    setSearchQuery(query)
    setOtherUsersPage(1) // 검색 시 첫 페이지로 리셋

    // 300ms 지연 후 검색 실행
    const timeoutId = setTimeout(() => {
      debouncedSearch(query)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [debouncedSearch])

  // 페이지네이션 헬퍼 함수
  const getPaginatedUsers = (users: any[], page: number) => {
    const startIndex = (page - 1) * USERS_PER_PAGE
    const endIndex = startIndex + USERS_PER_PAGE
    return users.slice(startIndex, endIndex)
  }

  const getPaginatedPosts = (posts: any[], page: number) => {
    const startIndex = (page - 1) * POSTS_PER_PAGE
    const endIndex = startIndex + POSTS_PER_PAGE
    return posts.slice(startIndex, endIndex)
  }

  const getTotalPages = (totalItems: number, itemsPerPage: number = USERS_PER_PAGE) => {
    return Math.ceil(totalItems / itemsPerPage)
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="text-lg">로딩 중...</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">로그인이 필요합니다</h1>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                프로필을 보려면 먼저 로그인해주세요.
              </p>
              <AuthButton />
            </div>
          </div>
        </div>
      </div>
    )
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
                  <p className="text-sm text-gray-600 dark:text-gray-300">한국 쿠버네티스 커뮤니티</p>
                </div>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" asChild>
                <Link href="/posts">게시판</Link>
              </Button>
              <AuthButton />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-6">
              <Avatar className="w-24 h-24">
                <AvatarImage src={session.user.image || ""} alt={session.user.name || ""} />
                <AvatarFallback>
                  <User className="w-12 h-12" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {editingName ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="text-2xl font-bold h-auto p-1"
                      />
                      <Button size="sm" onClick={handleNameUpdate}>저장</Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingName(false)}>취소</Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-2xl">{displayName}</CardTitle>
                      <Button size="sm" variant="ghost" onClick={() => setEditingName(true)}>
                        <Edit3 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Bio Section */}
                <div className="mb-4">
                  {editingBio ? (
                    <div className="space-y-2">
                      <Textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="간단한 자기소개를 작성해보세요..."
                        className="min-h-[80px] resize-none"
                        maxLength={200}
                      />
                      <div className="flex items-center gap-2">
                        <Button size="sm" onClick={handleBioUpdate}>저장</Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingBio(false)}>취소</Button>
                        <span className="text-xs text-gray-500 ml-auto">{bio.length}/200</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2">
                      <p className="text-sm text-gray-600 dark:text-gray-300 flex-1 min-h-[20px]">
                        {bio || "자기소개를 추가해보세요."}
                      </p>
                      <Button size="sm" variant="ghost" onClick={() => setEditingBio(true)}>
                        <Edit3 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Contact Info */}
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                  <div className="flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    <span>{session.user.email}</span>
                    <Button variant="ghost" size="sm" asChild className="h-auto p-1">
                      <a href={`mailto:${session.user.email}`}>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </Button>
                  </div>
                  <div className="text-gray-300">•</div>
                  <div className="flex items-center gap-1">
                    <Github className="w-4 h-4" />
                    <span>{session.user.githubUsername || session.user.email?.split('@')[0] || 'Unknown'}</span>
                    <Button variant="ghost" size="sm" asChild className="h-auto p-1">
                      <a
                        href={`https://github.com/${session.user.githubUsername || session.user.email?.split('@')[0]}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Main Content with Tabs */}
        <Tabs defaultValue="posts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="posts">내 게시글 ({userStats.totalPosts})</TabsTrigger>
            <TabsTrigger value="followers">팔로워 ({followers.length})</TabsTrigger>
            <TabsTrigger value="following">팔로잉 ({following.length})</TabsTrigger>
            <TabsTrigger value="settings">설정</TabsTrigger>
          </TabsList>

          <TabsContent value="posts">

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  내가 작성한 게시글 ({userPosts.length}개)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {userPosts.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      아직 작성한 게시글이 없습니다.
                    </p>
                    <Button asChild>
                      <Link href="/posts/create">첫 번째 게시글 작성하기</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {(() => {
                      const paginatedPosts = getPaginatedPosts(userPosts, postsPage)

                      return (
                        <>
                          {paginatedPosts.map((post) => (
                            <Link key={post.id} href={`/posts/${post.id}`}>
                              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardHeader>
                                  <div className="flex items-center justify-between mb-2">
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
                                          return `${diffHours}시간 전`
                                        } else {
                                          return `${diffDays}일 전`
                                        }
                                      })()}
                                    </span>
                                  </div>
                                  <CardTitle className="text-lg">{post.title}</CardTitle>
                                  <p className="text-sm text-muted-foreground">
                                    {post.content.substring(0, 100) + (post.content.length > 100 ? "..." : "")}
                                  </p>
                                  <div className="flex items-center gap-4 text-sm text-gray-500">
                                    <span className="flex items-center gap-1">
                                      <MessageSquare className="w-4 h-4" />
                                      {post.comments.length}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Heart className="w-4 h-4" />
                                      {post.likes?.length || 0}
                                    </span>
                                  </div>
                                </CardHeader>
                              </Card>
                            </Link>
                          ))}

                          {/* 게시글 페이지네이션 */}
                          {userPosts.length > POSTS_PER_PAGE && (
                            <div className="flex justify-center items-center gap-2 mt-6">
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={postsPage === 1}
                                onClick={() => setPostsPage(prev => prev - 1)}
                              >
                                이전
                              </Button>
                              <span className="text-sm text-gray-600">
                                {postsPage} / {getTotalPages(userPosts.length, POSTS_PER_PAGE)}
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={postsPage === getTotalPages(userPosts.length, POSTS_PER_PAGE)}
                                onClick={() => setPostsPage(prev => prev + 1)}
                              >
                                다음
                              </Button>
                            </div>
                          )}
                        </>
                      )
                    })()}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="followers">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  팔로워 ({followers.length}명)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {followers.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-300">
                      아직 팔로워가 없습니다.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {(() => {
                      const followerUsers = followers
                        .map(email => allUsers.find(u => u.email === email))
                        .filter(user => user !== undefined)
                      const paginatedFollowers = getPaginatedUsers(followerUsers, followersPage)

                      return (
                        <>
                          {paginatedFollowers.map((follower) => (
                            <Card key={follower.email} className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <Avatar>
                                    <AvatarImage src={follower.image} alt={follower.name} />
                                    <AvatarFallback>
                                      <User className="w-4 h-4" />
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium">{follower.name}</p>
                                    <p className="text-sm text-gray-500">{follower.email}</p>
                                  </div>
                                </div>
                              </div>
                            </Card>
                          ))}

                          {/* 팔로워 페이지네이션 */}
                          {followers.length > USERS_PER_PAGE && (
                            <div className="flex justify-center items-center gap-2 mt-6">
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={followersPage === 1}
                                onClick={() => setFollowersPage(prev => prev - 1)}
                              >
                                이전
                              </Button>
                              <span className="text-sm text-gray-600">
                                {followersPage} / {getTotalPages(followers.length, USERS_PER_PAGE)}
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={followersPage === getTotalPages(followers.length, USERS_PER_PAGE)}
                                onClick={() => setFollowersPage(prev => prev + 1)}
                              >
                                다음
                              </Button>
                            </div>
                          )}
                        </>
                      )
                    })()}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="following">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  팔로잉 ({following.length}명)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* 내가 팔로우한 사용자들 */}
                {following.length > 0 && (
                  <div className="space-y-4 mb-8">
                    <h3 className="text-lg font-medium flex items-center gap-2">
                      <Heart className="w-5 h-5 text-red-500" />
                      내가 팔로우한 사용자 ({following.length}명)
                    </h3>
                    <div className="space-y-3">
                      {(() => {
                        const followedUsers = following
                          .map(email => allUsers.find(user => user.email === email))
                          .filter(user => user !== undefined)
                        const paginatedFollowed = getPaginatedUsers(followedUsers, followingPage)

                        return paginatedFollowed.map((followedUser) => (
                          <Card key={followedUser.email} className="p-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Avatar>
                                  <AvatarImage src={followedUser.image} alt={followedUser.name} />
                                  <AvatarFallback>
                                    <User className="w-4 h-4" />
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">{followedUser.name}</p>
                                  <p className="text-sm text-gray-500">{followedUser.email}</p>
                                </div>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleFollowToggle(followedUser.email)}
                              >
                                <UserMinus className="w-4 h-4 mr-2" />
                                언팔로우
                              </Button>
                            </div>
                          </Card>
                        ))
                      })()}
                    </div>

                    {/* 팔로잉 페이지네이션 */}
                    {following.length > USERS_PER_PAGE && (
                      <div className="flex justify-center items-center gap-2 mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={followingPage === 1}
                          onClick={() => setFollowingPage(prev => prev - 1)}
                        >
                          이전
                        </Button>
                        <span className="text-sm text-gray-600">
                          {followingPage} / {getTotalPages(following.length, USERS_PER_PAGE)}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={followingPage === getTotalPages(following.length, USERS_PER_PAGE)}
                          onClick={() => setFollowingPage(prev => prev + 1)}
                        >
                          다음
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* 다른 사용자 팔로우하기 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <UserPlus className="w-5 h-5" />
                    다른 사용자 팔로우하기
                  </h3>

                  {/* 사용자 검색 */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="사용자 이름 또는 이메일로 검색..."
                      value={searchQuery}
                      onChange={(e) => handleUserSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* 팔로우하지 않은 사용자들만 표시 */}
                  {(() => {
                    const availableUsers = (searchQuery ? searchResults : allUsers.filter(user => user.email !== session?.user?.email))
                      .filter(user => !following.includes(user.email))
                    const paginatedUsers = getPaginatedUsers(availableUsers, otherUsersPage)

                    return (
                      <>
                        {paginatedUsers.map((user) => (
                          <Card key={user.email} className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Avatar>
                                  <AvatarImage src={user.image} alt={user.name} />
                                  <AvatarFallback>
                                    <User className="w-4 h-4" />
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">{user.name}</p>
                                  <p className="text-sm text-gray-500">{user.email}</p>
                                </div>
                              </div>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleFollowToggle(user.email)}
                              >
                                <UserPlus className="w-4 h-4 mr-2" />
                                팔로우
                              </Button>
                            </div>
                          </Card>
                        ))}

                        {/* 다른 사용자 페이지네이션 */}
                        {availableUsers.length > USERS_PER_PAGE && (
                          <div className="flex justify-center items-center gap-2 mt-6">
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={otherUsersPage === 1}
                              onClick={() => setOtherUsersPage(prev => prev - 1)}
                            >
                              이전
                            </Button>
                            <span className="text-sm text-gray-600">
                              {otherUsersPage} / {getTotalPages(availableUsers.length, USERS_PER_PAGE)}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={otherUsersPage === getTotalPages(availableUsers.length, USERS_PER_PAGE)}
                              onClick={() => setOtherUsersPage(prev => prev + 1)}
                            >
                              다음
                            </Button>
                          </div>
                        )}

                        {/* 검색 결과 없음 표시 */}
                        {searchQuery && searchResults.length === 0 && (
                          <div className="text-center py-8 text-gray-500">
                            <User className="w-12 h-12 mx-auto mb-4 opacity-30" />
                            <p>'{searchQuery}'에 대한 검색 결과가 없습니다.</p>
                          </div>
                        )}

                        {/* 팔로우할 사용자 없음 표시 */}
                        {!searchQuery && availableUsers.length === 0 && (
                          <div className="text-center py-8 text-gray-500">
                            <UserPlus className="w-12 h-12 mx-auto mb-4 opacity-30" />
                            <p>팔로우할 수 있는 다른 사용자가 없습니다.</p>
                          </div>
                        )}
                      </>
                    )
                  })()}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  계정 설정
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-medium">이메일 주소</Label>
                    <div className="flex items-center gap-2 mt-2">
                      <Input value={session.user.email || ""} disabled />
                      <Button variant="outline" disabled>
                        변경 불가
                      </Button>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      GitHub 계정과 연동된 이메일은 변경할 수 없습니다.
                    </p>
                  </div>

                  <Separator />

                  <div>
                    <div className="mt-4 p-4 border border-red-200 rounded-lg bg-red-50 dark:bg-red-950/20">
                      <h3 className="font-medium text-red-800 dark:text-red-400 mb-2">
                        계정 삭제
                      </h3>
                      <p className="text-sm text-red-600 dark:text-red-300 mb-4">
                        계정을 삭제하면 모든 게시글, 댓글, 팔로우 데이터가 영구적으로 삭제됩니다.
                        이 작업은 되돌릴 수 없습니다.
                      </p>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="w-4 h-4 mr-2" />
                            계정 삭제
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>정말 계정을 삭제하시겠습니까?</AlertDialogTitle>
                            <AlertDialogDescription>
                              이 작업은 되돌릴 수 없습니다. 계정과 관련된 모든 데이터가 영구적으로 삭제됩니다:
                              <br />
                              • 모든 게시글 ({userStats.totalPosts}개)
                              <br />
                              • 모든 댓글 ({userStats.totalComments}개)
                              <br />
                              • 팔로우/팔로워 관계
                              <br />
                              • 기타 모든 활동 데이터
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>취소</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleDeleteAccount}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              영구 삭제
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}