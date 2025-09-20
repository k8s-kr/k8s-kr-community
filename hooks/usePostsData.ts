import { useState, useEffect, useMemo } from "react"
import { useSearchParams } from "next/navigation"

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

export function usePostsData() {
  const searchParams = useSearchParams()
  const [posts, setPosts] = useState<Post[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortBy, setSortBy] = useState<"latest"|"popular"|"commented"|"unanswered">("latest")

  const tagFilter = searchParams.get('tag')
  const tagFilters = tagFilter ? tagFilter.split(',') : []

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

  const getLikeCount = (p: Post) => Array.isArray(p.likes) ? p.likes.length : 0
  const getCommentCount = (p: Post) => Array.isArray(p.comments) ? p.comments.length : 0
  const getPopularityScore = (p: Post) => getLikeCount(p) * 2 + getCommentCount(p)

  // 필터링된 게시글들을 useMemo로 최적화
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesSearch =
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesCategory = selectedCategory === "all" || post.category === selectedCategory
      const matchesTag = tagFilters.length === 0 || tagFilters.every((filterTag) =>
        post.tags.some((postTag) => postTag.toLowerCase() === filterTag.toLowerCase())
      )
      return matchesSearch && matchesCategory && matchesTag
    })
  }, [posts, searchTerm, selectedCategory, tagFilters])

  // 정렬된 게시글들을 useMemo로 최적화
  const sortedPosts = useMemo(() => {
    // 고정글과 일반글 분리 및 정렬
    const pinnedPosts = filteredPosts.filter(post => post.pinned)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    const regularPosts = filteredPosts.filter(post => !post.pinned)
      .sort((a, b) => {
        switch (sortBy) {
          case "latest":
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          case "popular":
            return getPopularityScore(b) - getPopularityScore(a)
          case "commented":
            return getCommentCount(b) - getCommentCount(a)
          case "unanswered":
            if (getCommentCount(a) === 0 && getCommentCount(b) > 0) return -1
            if (getCommentCount(b) === 0 && getCommentCount(a) > 0) return 1
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          default:
            return 0
        }
      })

    // 고정글을 상단에, 일반글을 하단에 배치
    return [...pinnedPosts, ...regularPosts]
  }, [filteredPosts, sortBy])

  // 모든 게시글에서 사용된 태그들 추출을 useMemo로 최적화
  const allTags = useMemo(() => {
    return Array.from(new Set(posts.flatMap(post => post.tags))).sort()
  }, [posts])

  // 태그 클릭 핸들러
  const handleTagClick = (tag: string) => {
    const currentTags = tagFilters
    let newTags: string[]

    if (currentTags.includes(tag)) {
      // 이미 선택된 태그면 제거
      newTags = currentTags.filter(t => t !== tag)
    } else {
      // 새 태그 추가
      newTags = [...currentTags, tag]
    }

    const newUrl = newTags.length > 0
      ? `/posts?tag=${encodeURIComponent(newTags.join(','))}`
      : '/posts'

    window.history.replaceState({}, '', newUrl)
    window.location.reload()
  }

  return {
    posts,
    sortedPosts,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    sortBy,
    setSortBy,
    tagFilters,
    allTags,
    handleTagClick
  }
}