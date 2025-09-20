import React, { ReactNode } from 'react'

// 공통 이벤트 핸들러 유틸리티
export const createClickHandler = (
  onClick?: (id: string) => void,
  id?: string
) => (e: React.MouseEvent) => {
  e.preventDefault()
  e.stopPropagation()
  if (onClick && id) {
    onClick(id)
  }
}

// 스켈레톤 컴포넌트 생성 유틸리티
export const createSkeleton = (className?: string) =>
  React.createElement('div', {
    className: `bg-muted animate-pulse ${className || ''}`
  })

// 로딩 스피너 컴포넌트
export const LoadingSpinner = ({ size = 'default' }: { size?: 'sm' | 'default' | 'lg' }) => {
  const sizeClass = {
    sm: 'h-4 w-4',
    default: 'h-5 w-5',
    lg: 'h-6 w-6'
  }[size]

  return React.createElement('div', {
    className: `${sizeClass} animate-spin rounded-full border-2 border-current border-t-transparent`
  })
}

// 카드 래퍼 유틸리티
export const createCardWrapper = (
  children: ReactNode,
  className?: string,
  onClick?: () => void
) => {
  const React = require('react')
  const baseClasses = "hover:shadow-md transition-all duration-200"
  const clickableClasses = onClick ? "cursor-pointer" : ""
  const finalClasses = `${baseClasses} ${clickableClasses} ${className || ''}`

  return React.createElement('div', {
    className: finalClasses,
    onClick: onClick || undefined
  }, children)
}

// 버튼 상태 유틸리티
export const getButtonVariant = (isActive: boolean, defaultVariant: "outline" | "default" | "destructive" | "secondary" | "ghost" | "link" = "outline") =>
  isActive ? "default" : defaultVariant

// 조건부 렌더링 유틸리티
export const renderIf = (condition: boolean, component: ReactNode) =>
  condition ? component : null

// 아바타 fallback 텍스트 생성
export const getAvatarFallback = (name: string) =>
  name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2)

// 태그 제한 표시 유틸리티
export const renderTags = (tags: string[], maxVisible: number = 3) => {
  const visibleTags = tags.slice(0, maxVisible)
  const remainingCount = tags.length - maxVisible

  return {
    visibleTags,
    hasMore: remainingCount > 0,
    remainingCount
  }
}

// 통계 표시 유틸리티
export const createStatItem = (value: number, label: string) => ({
  value,
  label,
  displayValue: value.toLocaleString('ko-KR')
})

// 페이지네이션 버튼 비활성화 상태
export const getPaginationDisabled = (
  currentPage: number,
  totalPages: number,
  disabled: boolean = false
) => ({
  isFirstDisabled: disabled || currentPage === 1,
  isLastDisabled: disabled || currentPage === totalPages,
  isPrevDisabled: disabled || currentPage === 1,
  isNextDisabled: disabled || currentPage === totalPages
})

// 드롭다운 메뉴 아이템 생성 유틸리티
export const createDropdownItem = (
  icon: ReactNode,
  label: string,
  onClick: () => void,
  className?: string
) => ({
  icon,
  label,
  onClick,
  className
})