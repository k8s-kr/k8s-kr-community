import { useState, useEffect, useCallback, useRef, useMemo } from "react"

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

interface UseInfiniteScrollProps {
  posts: Post[]
  postsPerPage?: number
}

export function useInfiniteScroll({ posts, postsPerPage = 10 }: UseInfiniteScrollProps) {
  const [displayedPosts, setDisplayedPosts] = useState<Post[]>([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const observer = useRef<IntersectionObserver>()

  // posts 배열의 길이와 첫 번째 요소의 id를 기준으로 변경 감지
  const postsSignature = useMemo(() =>
    posts.length > 0 ? `${posts.length}-${posts[0]?.id}` : `${posts.length}`,
    [posts]
  )

  const loadMorePosts = useCallback(() => {
    if (loading || !hasMore) return

    setLoading(true)

    setTimeout(() => {
      const startIndex = (page - 1) * postsPerPage
      const endIndex = page * postsPerPage
      const newPosts = posts.slice(startIndex, endIndex)

      if (newPosts.length === 0) {
        setHasMore(false)
      } else {
        setDisplayedPosts(prev => [...prev, ...newPosts])
        setPage(prev => prev + 1)
      }

      setLoading(false)
    }, 300)
  }, [page, loading, hasMore, posts, postsPerPage])

  // 검색/필터 변경 시 초기화
  useEffect(() => {
    setDisplayedPosts([])
    setPage(1)
    setHasMore(true)

    const initialPosts = posts.slice(0, postsPerPage)
    setDisplayedPosts(initialPosts)
    setPage(2)
    setHasMore(posts.length > postsPerPage)
  }, [postsSignature, postsPerPage])

  // 무한 스크롤 ref 콜백
  const lastPostElementRef = useCallback((node: HTMLElement | null) => {
    if (loading) return
    if (observer.current) observer.current.disconnect()
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMorePosts()
      }
    })
    if (node) observer.current.observe(node)
  }, [loading, hasMore, loadMorePosts])

  return {
    displayedPosts,
    loading,
    hasMore,
    lastPostElementRef
  }
}