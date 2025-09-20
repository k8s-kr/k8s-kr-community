# API 연동 가이드

이 문서는 백엔드 API와 연동하는 방법을 설명합니다.

## 📋 목차

1. [환경 설정](#환경-설정)
2. [API 서버 요구사항](#api-서버-요구사항)
3. [API 엔드포인트 명세](#api-엔드포인트-명세)
4. [데이터 형식](#데이터-형식)
5. [에러 처리](#에러-처리)
6. [인증 설정](#인증-설정)
7. [개발 및 테스트](#개발-및-테스트)

## 🔧 환경 설정

### 1. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 설정을 추가하세요:

```bash
# API 연동 활성화
NEXT_PUBLIC_ENABLE_API=true

# 백엔드 API 서버 주소
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api

# 기타 설정
NEXT_PUBLIC_API_TIMEOUT=10000
NEXT_PUBLIC_API_RETRIES=3
NEXT_PUBLIC_USE_LOCAL_STORAGE=true
```

### 2. 개발/프로덕션 환경별 설정

#### 개발 환경
```bash
NODE_ENV=development
NEXT_PUBLIC_ENABLE_API=false  # 로컬 개발 시 localStorage 사용
NEXT_PUBLIC_USE_LOCAL_STORAGE=true
NEXT_PUBLIC_DEBUG_API=true
```

#### 프로덕션 환경
```bash
NODE_ENV=production
NEXT_PUBLIC_ENABLE_API=true  # API 서버 사용
NEXT_PUBLIC_API_BASE_URL=https://api.your-domain.com
NEXT_PUBLIC_USE_LOCAL_STORAGE=false
```

## 🚀 API 서버 요구사항

### 기본 요구사항

1. **CORS 설정**: 프론트엔드 도메인에서의 요청 허용
2. **JSON 응답**: 모든 응답은 JSON 형식
3. **HTTP 상태 코드**: 표준 HTTP 상태 코드 사용
4. **에러 응답**: 일관된 에러 응답 형식

### 응답 형식

모든 API 응답은 다음 형식을 따라야 합니다:

```typescript
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}
```

## 📡 API 엔드포인트 명세

### 게시글 API

#### GET `/api/posts`
게시글 목록 조회

**Query Parameters:**
- `page`: 페이지 번호 (기본값: 1)
- `limit`: 페이지 크기 (기본값: 10)
- `category`: 카테고리 필터
- `author`: 작성자 필터
- `search`: 검색어
- `sortBy`: 정렬 기준 (createdAt, likes, comments)
- `sortOrder`: 정렬 순서 (asc, desc)

**응답 예시:**
```json
{
  "success": true,
  "data": [
    {
      "id": "post_id",
      "title": "게시글 제목",
      "content": "게시글 내용",
      "category": "discussion",
      "tags": ["kubernetes", "docker"],
      "author": {
        "id": "user_id",
        "email": "user@example.com",
        "name": "사용자명"
      },
      "createdAt": "2024-01-01T00:00:00Z",
      "likes": ["user1", "user2"],
      "comments": [],
      "status": "published"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10,
    "hasNext": true,
    "hasPrev": false
  }
}
```

#### POST `/api/posts`
게시글 생성

**Request Body:**
```json
{
  "title": "게시글 제목",
  "content": "게시글 내용",
  "category": "discussion",
  "tags": ["tag1", "tag2"],
  "status": "published"
}
```

#### GET `/api/posts/:id`
개별 게시글 조회

#### PATCH `/api/posts/:id`
게시글 수정

#### DELETE `/api/posts/:id`
게시글 삭제

#### POST `/api/posts/:id/like`
게시글 좋아요 토글

### 사용자 API

#### GET `/api/users`
사용자 목록 조회

#### GET `/api/users/:id`
개별 사용자 조회

#### GET `/api/users/me`
현재 사용자 정보 조회

#### PATCH `/api/users/:id`
사용자 정보 수정

#### GET `/api/users/:id/stats`
사용자 통계 조회

### 팔로우 API

#### POST `/api/follows`
사용자 팔로우

**Request Body:**
```json
{
  "targetUserId": "user_id"
}
```

#### DELETE `/api/follows/:targetUserId`
사용자 언팔로우

#### GET `/api/users/:id/followers`
팔로워 목록 조회

#### GET `/api/users/:id/following`
팔로잉 목록 조회

### 인증 API

#### POST `/api/auth/login`
로그인

#### POST `/api/auth/register`
회원가입

#### POST `/api/auth/logout`
로그아웃

#### GET `/api/auth/me`
현재 사용자 정보

## 📊 데이터 형식

### User 타입
```typescript
interface User {
  id: string
  email: string
  name: string
  image?: string
  githubUsername?: string
  bio?: string
  createdAt: string
  updatedAt?: string
}
```

### Post 타입
```typescript
interface Post {
  id: string
  title: string
  content: string
  category: 'announcement' | 'discussion' | 'tutorial' | 'tip' | 'experience' | 'question'
  tags: string[]
  author: User
  createdAt: string
  updatedAt?: string
  likes: string[]
  comments: Comment[]
  status: 'draft' | 'published' | 'archived'
}
```

### Comment 타입
```typescript
interface Comment {
  id: string
  content: string
  author: User
  postId: string
  parentId?: string
  createdAt: string
  updatedAt?: string
  likes: string[]
}
```

## ⚠️ 에러 처리

### 에러 응답 형식

```typescript
interface ErrorResponse {
  success: false
  error: string
  code?: string
  details?: any
}
```

### 주요 HTTP 상태 코드

- `200`: 성공
- `201`: 생성 성공
- `400`: 잘못된 요청
- `401`: 인증 필요
- `403`: 권한 없음
- `404`: 리소스 없음
- `409`: 충돌 (중복 데이터 등)
- `422`: 유효성 검사 실패
- `429`: 요청 한도 초과
- `500`: 서버 오류

### 에러 예시

```json
{
  "success": false,
  "error": "게시글을 찾을 수 없습니다.",
  "code": "POST_NOT_FOUND"
}
```

## 🔐 인증 설정

### JWT 토큰 사용

1. 로그인 성공 시 JWT 토큰 반환
2. 이후 모든 요청에 `Authorization: Bearer <token>` 헤더 포함
3. 토큰 만료 시 자동 갱신 또는 재로그인 요구

### 인증이 필요한 엔드포인트

- 게시글 생성, 수정, 삭제
- 댓글 작성, 수정, 삭제
- 좋아요 기능
- 팔로우 기능
- 사용자 정보 수정

## 🧪 개발 및 테스트

### 로컬 개발 설정

1. API 서버 없이 개발하기:
```bash
NEXT_PUBLIC_ENABLE_API=false
NEXT_PUBLIC_USE_LOCAL_STORAGE=true
```

2. API 서버와 함께 개발하기:
```bash
NEXT_PUBLIC_ENABLE_API=true
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
NEXT_PUBLIC_USE_LOCAL_STORAGE=true  # fallback 활성화
```

### Fallback 동작

API 서버가 응답하지 않거나 오류가 발생할 때, 자동으로 localStorage를 사용합니다:

1. API 요청 시도
2. 실패 시 localStorage에서 데이터 조회
3. 사용자에게 오프라인 모드임을 알림

### 데이터 동기화

API와 localStorage 간 데이터 동기화를 위한 전략:

1. **Optimistic Updates**: UI 먼저 업데이트 후 API 호출
2. **Cache Invalidation**: API 성공 시 관련 캐시 무효화
3. **Retry Logic**: 네트워크 오류 시 자동 재시도

## 🔄 마이그레이션 가이드

### localStorage에서 API로 전환

1. 환경 변수 변경:
```bash
NEXT_PUBLIC_ENABLE_API=true
```

2. 기존 localStorage 데이터 API로 마이그레이션:
```typescript
// 개발자 도구에서 실행
const data = localStorage.getItem('posts')
// API로 데이터 전송하는 스크립트 실행
```

3. 점진적 전환:
```bash
NEXT_PUBLIC_USE_LOCAL_STORAGE=true  # fallback 유지
```

### API에서 localStorage로 복귀

긴급 상황 시 빠른 복구:

```bash
NEXT_PUBLIC_ENABLE_API=false
NEXT_PUBLIC_USE_LOCAL_STORAGE=true
```

## 📚 추가 리소스

- [API 클라이언트 구현](./lib/api/client.ts)
- [데이터 서비스 레이어](./lib/services/data-service.ts)
- [에러 처리](./lib/api/error-handler.ts)
- [환경 설정](./lib/config/environment.ts)

## 🐛 문제 해결

### 자주 발생하는 문제

1. **CORS 오류**: API 서버에서 CORS 설정 확인
2. **인증 오류**: JWT 토큰 만료 여부 확인
3. **네트워크 오류**: API 서버 상태 및 URL 확인
4. **데이터 형식 오류**: API 응답 형식이 명세와 일치하는지 확인

### 디버깅

개발 환경에서 API 요청/응답 로그 확인:

```bash
NEXT_PUBLIC_DEBUG_API=true
```

브라우저 개발자 도구 Console에서 상세 로그를 확인할 수 있습니다.