"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"
import { CATEGORY_LABELS, SORT_LABELS, PLACEHOLDERS, LABELS, POSTS_PAGE_MESSAGES } from '@/lib/constants/messages'

interface PostsFiltersProps {
  searchTerm: string
  setSearchTerm: (value: string) => void
  sortBy: "latest" | "popular" | "commented" | "unanswered"
  setSortBy: (value: "latest" | "popular" | "commented" | "unanswered") => void
  selectedCategory: string
  setSelectedCategory: (value: string) => void
  allTags: string[]
  tagFilters: string[]
  handleTagClick: (tag: string) => void
}

export function PostsFilters({
  searchTerm,
  setSearchTerm,
  sortBy,
  setSortBy,
  selectedCategory,
  setSelectedCategory,
  allTags,
  tagFilters,
  handleTagClick
}: PostsFiltersProps) {
  return (
    <div className="mb-8 space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder={PLACEHOLDERS.SEARCH_POSTS}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* 정렬 */}
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
          <SelectTrigger className="w-full md:w-40">
            <SelectValue placeholder={PLACEHOLDERS.SELECT_SORT} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="latest">{SORT_LABELS.latest}</SelectItem>
            <SelectItem value="popular">{SORT_LABELS.popular}</SelectItem>
            <SelectItem value="commented">{SORT_LABELS.commented}</SelectItem>
            <SelectItem value="unanswered">{SORT_LABELS.unanswered}</SelectItem>
          </SelectContent>
        </Select>

        {/* 카테고리 */}
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder={PLACEHOLDERS.SELECT_CATEGORY_FILTER} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{LABELS.ALL}</SelectItem>
            <SelectItem value="question">{CATEGORY_LABELS.question}</SelectItem>
            <SelectItem value="tip">{CATEGORY_LABELS.tip}</SelectItem>
            <SelectItem value="discussion">{CATEGORY_LABELS.discussion}</SelectItem>
            <SelectItem value="news">{CATEGORY_LABELS.news}</SelectItem>
            <SelectItem value="tutorial">{CATEGORY_LABELS.tutorial}</SelectItem>
            <SelectItem value="showcase">{CATEGORY_LABELS.showcase}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 태그 선택 UI */}
      {allTags.length > 0 && (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag) => (
                <Badge
                  key={tag}
                  className={`text-xs cursor-pointer transition-colors ${
                    tagFilters.includes(tag)
                      ? 'bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => handleTagClick(tag)}
                >
                  #{tag}
                  {tagFilters.includes(tag) && (
                    <span className="ml-1">✓</span>
                  )}
                </Badge>
              ))}
            </div>
            {tagFilters.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  window.history.replaceState({}, '', '/posts')
                  window.location.reload()
                }}
                className="text-gray-600 hover:text-gray-800 px-2 py-1 h-auto text-xs"
              >
                {POSTS_PAGE_MESSAGES.CLEAR_ALL}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}