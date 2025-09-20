"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MessageSquare, Plus } from "lucide-react"
import { PostCard } from "./PostCard"
import { STATUS_MESSAGES, POSTS_PAGE_MESSAGES, BUTTON_LABELS } from '@/lib/constants/messages'
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
  likes?: string[]
  pinned?: boolean
}

interface PostsListProps {
  posts: Post[]
  displayedPosts: Post[]
  session: any
  tagFilters: string[]
  handleTagClick: (tag: string) => void
  loading: boolean
  hasMore: boolean
  lastPostElementRef: (node: HTMLElement | null) => void
}

export function PostsList({
  posts,
  displayedPosts,
  session,
  tagFilters,
  handleTagClick,
  loading,
  hasMore,
  lastPostElementRef
}: PostsListProps) {
  if (posts.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {STATUS_MESSAGES.NO_POSTS}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {POSTS_PAGE_MESSAGES.NO_POSTS_DESC}
          </p>
          {session && (
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <Link href="/posts/create">
                <Plus className="w-4 h-4 mr-2" />{BUTTON_LABELS.WRITE_POST}
              </Link>
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  if (displayedPosts.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {STATUS_MESSAGES.NO_SEARCH_RESULTS}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {POSTS_PAGE_MESSAGES.NO_RESULTS_DESC}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      {displayedPosts.map((post, index) => (
        <PostCard
          key={post.id}
          post={post}
          tagFilters={tagFilters}
          handleTagClick={handleTagClick}
          ref={index === displayedPosts.length - 1 ? lastPostElementRef : null}
        />
      ))}

      {/* 로딩 인디케이터 */}
      {loading && (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* 더 이상 로드할 게시글이 없을 때 */}
      {!hasMore && displayedPosts.length > 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>모든 게시글을 확인했습니다.</p>
        </div>
      )}
    </>
  )
}