import { storageUtils } from '../helpers'
import { STORAGE_KEYS } from '../constants'
import type { Post, User, FollowRelation } from '@/types'

// 저장소 인터페이스 정의 (향후 API로 교체하기 쉽게)
export interface IStorageService {
  // Posts
  getPosts(): Promise<Post[]>
  getPost(id: string): Promise<Post | null>
  createPost(post: Omit<Post, 'id' | 'createdAt'>): Promise<Post>
  updatePost(id: string, updates: Partial<Post>): Promise<Post | null>
  deletePost(id: string): Promise<boolean>

  // Users
  getUsers(): Promise<User[]>
  getUser(id: string): Promise<User | null>
  getUserBio(email: string): Promise<string>
  updateUserBio(email: string, bio: string): Promise<boolean>

  // Follows
  getFollowData(): Promise<Record<string, FollowRelation>>
  getFollowRelation(userId: string): Promise<FollowRelation>
  followUser(userId: string, targetUserId: string): Promise<boolean>
  unfollowUser(userId: string, targetUserId: string): Promise<boolean>

  // Search and Filter
  searchPosts(query: string): Promise<Post[]>
  getPostsByCategory(category: string): Promise<Post[]>
  getPostsByUser(userId: string): Promise<Post[]>
}

// 로컬 스토리지 서비스 구현
export class LocalStorageService implements IStorageService {
  // Posts
  async getPosts(): Promise<Post[]> {
    return storageUtils.getItem<Post[]>(STORAGE_KEYS.POSTS, [])
  }

  async getPost(id: string): Promise<Post | null> {
    const posts = await this.getPosts()
    return posts.find(post => post.id === id) || null
  }

  async createPost(postData: Omit<Post, 'id' | 'createdAt'>): Promise<Post> {
    const posts = await this.getPosts()
    const newPost: Post = {
      ...postData,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
    }

    posts.unshift(newPost) // 최신 게시글이 맨 앞에 오도록
    storageUtils.setItem(STORAGE_KEYS.POSTS, posts)
    return newPost
  }

  async updatePost(id: string, updates: Partial<Post>): Promise<Post | null> {
    const posts = await this.getPosts()
    const postIndex = posts.findIndex(post => post.id === id)

    if (postIndex === -1) return null

    const updatedPost = {
      ...posts[postIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    posts[postIndex] = updatedPost
    storageUtils.setItem(STORAGE_KEYS.POSTS, posts)
    return updatedPost
  }

  async deletePost(id: string): Promise<boolean> {
    const posts = await this.getPosts()
    const filteredPosts = posts.filter(post => post.id !== id)

    if (filteredPosts.length === posts.length) return false

    storageUtils.setItem(STORAGE_KEYS.POSTS, filteredPosts)
    return true
  }

  // Users
  async getUsers(): Promise<User[]> {
    const posts = await this.getPosts()
    const userMap = new Map<string, User>()

    // 게시글 작성자들로부터 사용자 목록 생성
    posts.forEach(post => {
      if (!userMap.has(post.author.email)) {
        userMap.set(post.author.email, {
          ...post.author,
          id: post.author.email, // 현재는 이메일을 ID로 사용
        })
      }
    })

    return Array.from(userMap.values())
  }

  async getUser(id: string): Promise<User | null> {
    const users = await this.getUsers()
    return users.find(user => user.id === id || user.email === id) || null
  }

  async getUserBio(email: string): Promise<string> {
    const bios = storageUtils.getItem<Record<string, string>>(STORAGE_KEYS.USER_BIOS, {})
    return bios[email] || ''
  }

  async updateUserBio(email: string, bio: string): Promise<boolean> {
    const bios = storageUtils.getItem<Record<string, string>>(STORAGE_KEYS.USER_BIOS, {})
    bios[email] = bio
    return storageUtils.setItem(STORAGE_KEYS.USER_BIOS, bios)
  }

  // Follows
  async getFollowData(): Promise<Record<string, FollowRelation>> {
    return storageUtils.getItem<Record<string, FollowRelation>>(STORAGE_KEYS.USER_FOLLOWS, {})
  }

  async getFollowRelation(userId: string): Promise<FollowRelation> {
    const followData = await this.getFollowData()
    return followData[userId] || {
      userId,
      followers: [],
      following: [],
    }
  }

  async followUser(userId: string, targetUserId: string): Promise<boolean> {
    const followData = await this.getFollowData()

    // 자기 자신을 팔로우할 수 없음
    if (userId === targetUserId) return false

    // 사용자의 팔로잉 목록에 추가
    if (!followData[userId]) {
      followData[userId] = { userId, followers: [], following: [] }
    }
    if (!followData[userId].following.includes(targetUserId)) {
      followData[userId].following.push(targetUserId)
    }

    // 대상 사용자의 팔로워 목록에 추가
    if (!followData[targetUserId]) {
      followData[targetUserId] = { userId: targetUserId, followers: [], following: [] }
    }
    if (!followData[targetUserId].followers.includes(userId)) {
      followData[targetUserId].followers.push(userId)
    }

    return storageUtils.setItem(STORAGE_KEYS.USER_FOLLOWS, followData)
  }

  async unfollowUser(userId: string, targetUserId: string): Promise<boolean> {
    const followData = await this.getFollowData()

    // 사용자의 팔로잉 목록에서 제거
    if (followData[userId]) {
      followData[userId].following = followData[userId].following.filter(id => id !== targetUserId)
    }

    // 대상 사용자의 팔로워 목록에서 제거
    if (followData[targetUserId]) {
      followData[targetUserId].followers = followData[targetUserId].followers.filter(id => id !== userId)
    }

    return storageUtils.setItem(STORAGE_KEYS.USER_FOLLOWS, followData)
  }

  // Search and Filter
  async searchPosts(query: string): Promise<Post[]> {
    const posts = await this.getPosts()
    const lowercaseQuery = query.toLowerCase()

    return posts.filter(post =>
      post.title.toLowerCase().includes(lowercaseQuery) ||
      post.content.toLowerCase().includes(lowercaseQuery) ||
      post.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)) ||
      post.author.name.toLowerCase().includes(lowercaseQuery)
    )
  }

  async getPostsByCategory(category: string): Promise<Post[]> {
    const posts = await this.getPosts()
    return posts.filter(post => post.category === category)
  }

  async getPostsByUser(userId: string): Promise<Post[]> {
    const posts = await this.getPosts()
    return posts.filter(post => post.author.email === userId || post.author.id === userId)
  }

  // 헬퍼 메서드
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  // 대량 데이터 작업을 위한 메서드들
  async bulkCreatePosts(posts: Omit<Post, 'id' | 'createdAt'>[]): Promise<Post[]> {
    const existingPosts = await this.getPosts()
    const newPosts = posts.map(postData => ({
      ...postData,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
    }))

    const allPosts = [...newPosts, ...existingPosts]
    storageUtils.setItem(STORAGE_KEYS.POSTS, allPosts)
    return newPosts
  }

  async clearAllData(): Promise<boolean> {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        storageUtils.removeItem(key)
      })
      return true
    } catch (error) {
      console.error('Error clearing all data:', error)
      return false
    }
  }

  // 데이터 내보내기/가져오기 (백업 용도)
  async exportData(): Promise<{
    posts: Post[]
    userBios: Record<string, string>
    userFollows: Record<string, FollowRelation>
    exportedAt: string
  }> {
    return {
      posts: await this.getPosts(),
      userBios: storageUtils.getItem(STORAGE_KEYS.USER_BIOS, {}),
      userFollows: storageUtils.getItem(STORAGE_KEYS.USER_FOLLOWS, {}),
      exportedAt: new Date().toISOString(),
    }
  }

  async importData(data: {
    posts?: Post[]
    userBios?: Record<string, string>
    userFollows?: Record<string, FollowRelation>
  }): Promise<boolean> {
    try {
      if (data.posts) {
        storageUtils.setItem(STORAGE_KEYS.POSTS, data.posts)
      }
      if (data.userBios) {
        storageUtils.setItem(STORAGE_KEYS.USER_BIOS, data.userBios)
      }
      if (data.userFollows) {
        storageUtils.setItem(STORAGE_KEYS.USER_FOLLOWS, data.userFollows)
      }
      return true
    } catch (error) {
      console.error('Error importing data:', error)
      return false
    }
  }
}

// 싱글톤 인스턴스
export const storageService = new LocalStorageService()

// 향후 API 서비스로 교체할 때 사용할 팩토리 함수
export const createStorageService = (type: 'localStorage' | 'api' = 'localStorage'): IStorageService => {
  switch (type) {
    case 'localStorage':
      return new LocalStorageService()
    case 'api':
      // TODO: API 서비스 구현 후 여기에 추가
      throw new Error('API service not implemented yet')
    default:
      return new LocalStorageService()
  }
}