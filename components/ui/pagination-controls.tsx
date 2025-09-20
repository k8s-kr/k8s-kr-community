"use client"

import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { paginationUtils } from '@/lib/helpers'
import { getPaginationDisabled, getButtonVariant, renderIf, createSkeleton } from '@/lib/ui-utils'
import type { PaginationProps } from '@/types'

export function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
  disabled = false,
  showPageSelect = true,
  showPageInfo = true,
  maxVisible = 5,
  className,
}: PaginationProps & {
  showPageSelect?: boolean
  showPageInfo?: boolean
  maxVisible?: number
  className?: string
}) {
  if (totalPages <= 1) return null

  const pageRange = paginationUtils.getPageRange(currentPage, totalPages, maxVisible)
  const hasFirstPage = pageRange[0] > 1
  const hasLastPage = pageRange[pageRange.length - 1] < totalPages
  const { isFirstDisabled, isLastDisabled, isPrevDisabled, isNextDisabled } = getPaginationDisabled(currentPage, totalPages, disabled)

  return (
    <div className={`flex items-center justify-between gap-4 ${className}`}>
      {/* 페이지 정보 */}
      {showPageInfo && (
        <div className="text-sm text-muted-foreground">
          {currentPage} / {totalPages} 페이지
        </div>
      )}

      {/* 페이지네이션 버튼들 */}
      <div className="flex items-center gap-1">
        {/* 첫 페이지 */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={isFirstDisabled}
          className="h-8 w-8 p-0"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>

        {/* 이전 페이지 */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={isPrevDisabled}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* 첫 페이지 ... */}
        {hasFirstPage && (
          <>
            <Button
              variant={getButtonVariant(1 === currentPage)}
              size="sm"
              onClick={() => onPageChange(1)}
              disabled={disabled}
              className="h-8 w-8 p-0"
            >
              1
            </Button>
            {pageRange[0] > 2 && (
              <div className="flex items-center justify-center h-8 w-8 text-muted-foreground">
                ...
              </div>
            )}
          </>
        )}

        {/* 페이지 번호들 */}
        {pageRange.map((page) => (
          <Button
            key={page}
            variant={getButtonVariant(page === currentPage)}
            size="sm"
            onClick={() => onPageChange(page)}
            disabled={disabled}
            className="h-8 w-8 p-0"
          >
            {page}
          </Button>
        ))}

        {/* ... 마지막 페이지 */}
        {hasLastPage && (
          <>
            {pageRange[pageRange.length - 1] < totalPages - 1 && (
              <div className="flex items-center justify-center h-8 w-8 text-muted-foreground">
                ...
              </div>
            )}
            <Button
              variant={getButtonVariant(totalPages === currentPage)}
              size="sm"
              onClick={() => onPageChange(totalPages)}
              disabled={disabled}
              className="h-8 w-8 p-0"
            >
              {totalPages}
            </Button>
          </>
        )}

        {/* 다음 페이지 */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={isNextDisabled}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* 마지막 페이지 */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(totalPages)}
          disabled={isLastDisabled}
          className="h-8 w-8 p-0"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>

      {/* 페이지 선택 드롭다운 */}
      {renderIf(showPageSelect && totalPages > maxVisible, (
        <Select
          value={currentPage.toString()}
          onValueChange={(value) => onPageChange(parseInt(value))}
          disabled={disabled}
        >
          <SelectTrigger className="w-20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <SelectItem key={page} value={page.toString()}>
                {page}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}
    </div>
  )
}

// 간단한 페이지네이션 (이전/다음만)
export function SimplePagination({
  currentPage,
  totalPages,
  onPageChange,
  disabled = false,
  showPageInfo = true,
}: Pick<PaginationProps, 'currentPage' | 'totalPages' | 'onPageChange' | 'disabled'> & {
  showPageInfo?: boolean
}) {
  if (totalPages <= 1) return null

  const { isPrevDisabled, isNextDisabled } = getPaginationDisabled(currentPage, totalPages, disabled)

  return (
    <div className="flex items-center justify-between">
      {renderIf(showPageInfo, (
        <div className="text-sm text-muted-foreground">
          {currentPage} / {totalPages} 페이지
        </div>
      ))}

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={isPrevDisabled}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          이전
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={isNextDisabled}
        >
          다음
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}

// 로딩 상태의 페이지네이션
export function PaginationSkeleton() {
  return (
    <div className="flex items-center justify-between">
      {createSkeleton('h-4 w-20 rounded')}
      <div className="flex items-center gap-1">
        {Array.from({ length: 7 }, (_, i) => (
          createSkeleton('h-8 w-8 rounded')
        ))}
      </div>
      {createSkeleton('h-8 w-20 rounded')}
    </div>
  )
}