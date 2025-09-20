import { format, formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import type { Post, User, PostCategory } from '@/types'
import { POST_CATEGORIES, DEFAULT_AVATAR } from './constants'

// 날짜 포맷팅
export const formatDate = {
  // 상대적 시간 (예: "2시간 전", "3일 전")
  relative: (date: string | Date): string => {
    return formatDistanceToNow(new Date(date), {
      addSuffix: true,
      locale: ko
    })
  },

  // 절대적 시간 (예: "2024.01.15 14:30")
  absolute: (date: string | Date): string => {
    return format(new Date(date), 'yyyy.MM.dd HH:mm', { locale: ko })
  },

  // 간단한 날짜 (예: "1월 15일")
  simple: (date: string | Date): string => {
    return format(new Date(date), 'M월 d일', { locale: ko })
  },

  // 전체 날짜 (예: "2024년 1월 15일 월요일")
  full: (date: string | Date): string => {
    return format(new Date(date), 'yyyy년 M월 d일 EEEE', { locale: ko })
  }
}

// 텍스트 관련 유틸리티
export const textUtils = {
  // 텍스트 자르기
  truncate: (text: string, maxLength: number = 100): string => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  },

  // HTML 태그 제거
  stripHtml: (html: string): string => {
    return html.replace(/<[^>]*>/g, '')
  },

  // 줄바꿈을 <br>로 변환
  nl2br: (text: string): string => {
    return text.replace(/\n/g, '<br>')
  },

  // 검색어 하이라이트
  highlight: (text: string, query: string): string => {
    if (!query.trim()) return text
    const regex = new RegExp(`(${query})`, 'gi')
    return text.replace(regex, '<mark>$1</mark>')
  },

  // 읽기 시간 계산 (분 단위)
  readingTime: (content: string): number => {
    const wordsPerMinute = 200 // 평균 읽기 속도
    const words = content.trim().split(/\s+/).length
    return Math.ceil(words / wordsPerMinute)
  }
}

// 숫자 포맷팅
export const numberUtils = {
  // 단위 변환 (예: 1000 -> "1K", 1000000 -> "1M")
  abbreviate: (num: number): string => {
    if (num < 1000) return num.toString()
    if (num < 1000000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K'
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M'
  },

  // 콤마 추가 (예: 1234 -> "1,234")
  addCommas: (num: number): string => {
    return num.toLocaleString('ko-KR')
  },

  // 퍼센트 계산
  percentage: (part: number, total: number): number => {
    if (total === 0) return 0
    return Math.round((part / total) * 100)
  }
}

// 카테고리 관련 유틸리티
export const categoryUtils = {
  // 카테고리 라벨 가져오기
  getLabel: (category: PostCategory): string => {
    return POST_CATEGORIES[category]?.label || category
  },

  // 카테고리 색상 가져오기
  getColor: (category: PostCategory): string => {
    return POST_CATEGORIES[category]?.color || POST_CATEGORIES.discussion.color
  },

  // 카테고리 설명 가져오기
  getDescription: (category: PostCategory): string => {
    return POST_CATEGORIES[category]?.description || ''
  },

  // 모든 카테고리 옵션 가져오기
  getAllOptions: () => {
    return Object.entries(POST_CATEGORIES).map(([value, config]) => ({
      value: value as PostCategory,
      label: config.label,
      description: config.description
    }))
  }
}

// 사용자 관련 유틸리티
export const userUtils = {
  // 사용자 표시 이름 가져오기
  getDisplayName: (user: User): string => {
    return user.name || user.githubUsername || user.email.split('@')[0]
  },

  // 사용자 아바타 URL 가져오기
  getAvatarUrl: (user: User): string => {
    return user.image || `${DEFAULT_AVATAR}?seed=${user.email}`
  },

  // 사용자 이니셜 가져오기 (아바타 폴백용)
  getInitials: (user: User): string => {
    const name = userUtils.getDisplayName(user)
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }
}

// 배열 관련 유틸리티
export const arrayUtils = {
  // 배열을 청크로 나누기
  chunk: <T>(array: T[], size: number): T[][] => {
    const chunks: T[][] = []
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size))
    }
    return chunks
  },

  // 배열 섞기
  shuffle: <T>(array: T[]): T[] => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  },

  // 고유 값만 필터링
  unique: <T>(array: T[]): T[] => {
    return [...new Set(array)]
  },

  // 객체 배열에서 특정 키로 그룹화
  groupBy: <T, K extends keyof T>(array: T[], key: K): Record<string, T[]> => {
    return array.reduce((groups, item) => {
      const group = String(item[key])
      if (!groups[group]) {
        groups[group] = []
      }
      groups[group].push(item)
      return groups
    }, {} as Record<string, T[]>)
  }
}

// 검색 관련 유틸리티
export const searchUtils = {
  // 텍스트에서 검색어 찾기
  matchesQuery: (text: string, query: string): boolean => {
    if (!query.trim()) return true
    return text.toLowerCase().includes(query.toLowerCase())
  },

  // 게시글 검색
  filterPosts: (posts: Post[], query: string, category?: PostCategory): Post[] => {
    return posts.filter(post => {
      const matchesQuery =
        searchUtils.matchesQuery(post.title, query) ||
        searchUtils.matchesQuery(post.content, query) ||
        post.tags.some(tag => searchUtils.matchesQuery(tag, query)) ||
        searchUtils.matchesQuery(userUtils.getDisplayName(post.author), query)

      const matchesCategory = !category || post.category === category

      return matchesQuery && matchesCategory
    })
  },

  // 사용자 검색
  filterUsers: (users: User[], query: string): User[] => {
    return users.filter(user =>
      searchUtils.matchesQuery(userUtils.getDisplayName(user), query) ||
      searchUtils.matchesQuery(user.email, query) ||
      (user.bio && searchUtils.matchesQuery(user.bio, query))
    )
  }
}

// 페이지네이션 유틸리티
export const paginationUtils = {
  // 페이지네이션된 데이터 가져오기
  paginate: <T>(data: T[], page: number, limit: number) => {
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedData = data.slice(startIndex, endIndex)

    return {
      data: paginatedData,
      pagination: {
        page,
        limit,
        total: data.length,
        totalPages: Math.ceil(data.length / limit),
        hasNext: endIndex < data.length,
        hasPrev: page > 1
      }
    }
  },

  // 페이지 범위 계산
  getPageRange: (currentPage: number, totalPages: number, maxVisible: number = 5) => {
    const half = Math.floor(maxVisible / 2)
    let start = Math.max(currentPage - half, 1)
    let end = Math.min(start + maxVisible - 1, totalPages)

    if (end - start + 1 < maxVisible) {
      start = Math.max(end - maxVisible + 1, 1)
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i)
  }
}

// 디바운스 함수
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

// 쓰로틀 함수
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let lastCall = 0
  return (...args: Parameters<T>) => {
    const now = Date.now()
    if (now - lastCall >= delay) {
      lastCall = now
      func(...args)
    }
  }
}

// 클립보드 유틸리티
export const clipboardUtils = {
  // 텍스트 복사
  copy: async (text: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch (error) {
      console.error('Failed to copy text:', error)
      return false
    }
  },

  // URL 복사
  copyUrl: async (path?: string): Promise<boolean> => {
    const url = path ? `${window.location.origin}${path}` : window.location.href
    return clipboardUtils.copy(url)
  }
}

// 로컬 스토리지 유틸리티
export const storageUtils = {
  // 안전한 JSON 파싱
  getItem: <T>(key: string, defaultValue: T): T => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch (error) {
      console.error(`Error parsing localStorage item "${key}":`, error)
      return defaultValue
    }
  },

  // 안전한 JSON 저장
  setItem: <T>(key: string, value: T): boolean => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch (error) {
      console.error(`Error saving to localStorage "${key}":`, error)
      return false
    }
  },

  // 항목 제거
  removeItem: (key: string): boolean => {
    try {
      localStorage.removeItem(key)
      return true
    } catch (error) {
      console.error(`Error removing localStorage item "${key}":`, error)
      return false
    }
  }
}