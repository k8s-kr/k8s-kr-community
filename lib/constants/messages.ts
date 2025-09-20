// UI 메시지 및 라벨 상수 정의

// 로딩 메시지
export const LOADING_MESSAGES = {
  POSTS: '게시글을 불러오는 중...',
  USERS: '사용자를 불러오는 중...',
  POST_DETAIL: '게시글 상세정보를 불러오는 중...',
  PROFILE: '프로필을 불러오는 중...',
  COMMENTS: '댓글을 불러오는 중...',
  GENERAL: '잠시만 기다려주세요...',
} as const

// 버튼 라벨
export const BUTTON_LABELS = {
  // 기본 액션
  SAVE: '저장',
  CANCEL: '취소',
  DELETE: '삭제',
  EDIT: '수정',
  CREATE: '생성',
  SUBMIT: '제출',
  CONFIRM: '확인',

  // 게시글 관련
  WRITE_POST: '게시글 작성',
  EDIT_POST: '게시글 수정',
  DELETE_POST: '게시글 삭제',
  PUBLISH_POST: '게시',
  SAVE_DRAFT: '임시저장',
  LIKE: '좋아요',
  UNLIKE: '좋아요 취소',
  COMMENT: '댓글',
  SHARE: '공유',

  // 사용자 관련
  FOLLOW: '팔로우',
  UNFOLLOW: '언팔로우',
  EDIT_PROFILE: '프로필 수정',

  // 인증 관련
  LOGIN: '로그인',
  LOGOUT: '로그아웃',
  SIGN_UP: '회원가입',

  // 페이지네이션
  PREVIOUS: '이전',
  NEXT: '다음',
  FIRST: '처음',
  LAST: '마지막',
} as const

// 에러 메시지
export const ERROR_MESSAGES = {
  // 일반적인 에러
  GENERAL: '오류가 발생했습니다.',
  NETWORK: '네트워크 연결을 확인해주세요.',
  NOT_FOUND: '요청한 페이지를 찾을 수 없습니다.',
  UNAUTHORIZED: '접근 권한이 없습니다.',

  // 인증 관련
  LOGIN_REQUIRED: '로그인이 필요합니다.',
  AUTHENTICATION_FAILED: '인증에 실패했습니다.',

  // 게시글 관련
  POST_NOT_FOUND: '게시글을 찾을 수 없습니다.',
  POST_CREATION_FAILED: '게시글 작성에 실패했습니다.',
  POST_UPDATE_FAILED: '게시글 수정에 실패했습니다.',
  POST_DELETE_FAILED: '게시글 삭제에 실패했습니다.',

  // 사용자 관련
  USER_NOT_FOUND: '사용자를 찾을 수 없습니다.',
  PROFILE_UPDATE_FAILED: '프로필 업데이트에 실패했습니다.',
  FOLLOW_FAILED: '팔로우에 실패했습니다.',

  // 폼 검증
  REQUIRED_FIELD: '필수 입력 항목입니다.',
  INVALID_EMAIL: '유효한 이메일을 입력해주세요.',
  INVALID_PASSWORD: '비밀번호는 8자 이상이어야 합니다.',
  TITLE_TOO_SHORT: '제목은 2자 이상 입력해주세요.',
  CONTENT_TOO_SHORT: '내용은 10자 이상 입력해주세요.',
} as const

// 성공 메시지
export const SUCCESS_MESSAGES = {
  // 게시글 관련
  POST_CREATED: '게시글이 성공적으로 작성되었습니다.',
  POST_UPDATED: '게시글이 성공적으로 수정되었습니다.',
  POST_DELETED: '게시글이 성공적으로 삭제되었습니다.',

  // 사용자 관련
  PROFILE_UPDATED: '프로필이 성공적으로 업데이트되었습니다.',
  FOLLOW_SUCCESS: '팔로우가 완료되었습니다.',
  UNFOLLOW_SUCCESS: '언팔로우가 완료되었습니다.',

  // 댓글 관련
  COMMENT_ADDED: '댓글이 성공적으로 추가되었습니다.',
  COMMENT_UPDATED: '댓글이 성공적으로 수정되었습니다.',
  COMMENT_DELETED: '댓글이 성공적으로 삭제되었습니다.',
} as const

// 플레이스홀더 텍스트
export const PLACEHOLDERS = {
  // 검색
  SEARCH_POSTS: '게시글 검색...',
  SEARCH_USERS: '사용자 검색...',
  SEARCH_GENERAL: '검색어를 입력하세요...',

  // 게시글 작성
  POST_TITLE: '게시글 제목을 입력하세요...',
  POST_CONTENT: '내용을 입력하세요...',
  POST_TAGS: '태그를 입력하세요 (쉼표로 구분)',

  // 댓글
  COMMENT_CONTENT: '댓글을 입력하세요...',

  // 프로필
  USER_BIO: '자기소개를 입력하세요...',
  USER_NAME: '이름을 입력하세요...',
} as const

// 일반적인 라벨
export const LABELS = {
  // 게시글 관련
  TITLE: '제목',
  CONTENT: '내용',
  CATEGORY: '카테고리',
  TAGS: '태그',
  AUTHOR: '작성자',
  CREATED_AT: '작성일',
  UPDATED_AT: '수정일',
  LIKES_COUNT: '좋아요',
  COMMENTS_COUNT: '댓글',
  VIEWS_COUNT: '조회수',

  // 사용자 관련
  NAME: '이름',
  EMAIL: '이메일',
  BIO: '소개',
  POSTS: '게시글',
  FOLLOWERS: '팔로워',
  FOLLOWING: '팔로잉',

  // 통계
  TOTAL_POSTS: '총 게시글',
  TOTAL_COMMENTS: '총 댓글',
  TOTAL_LIKES: '총 좋아요',
  TOTAL_FOLLOWERS: '총 팔로워',
  TOTAL_FOLLOWING: '총 팔로잉',

  // 필터링
  ALL: '전체',
  RECENT: '최신순',
  POPULAR: '인기순',
  OLDEST: '오래된순',
} as const

// 상태 메시지
export const STATUS_MESSAGES = {
  // 데이터 상태
  NO_DATA: '데이터가 없습니다.',
  NO_POSTS: '작성된 게시글이 없습니다.',
  NO_USERS: '사용자가 없습니다.',
  NO_COMMENTS: '댓글이 없습니다.',
  NO_SEARCH_RESULTS: '검색 결과가 없습니다.',

  // 연결 상태
  OFFLINE_MODE: '오프라인 모드입니다.',
  API_ERROR: 'API 서버에 연결할 수 없습니다.',

  // 권한 상태
  PERMISSION_DENIED: '권한이 없습니다.',
  LOGIN_TO_CONTINUE: '계속하려면 로그인하세요.',
} as const

// 확인 메시지
export const CONFIRMATION_MESSAGES = {
  DELETE_POST: '정말로 이 게시글을 삭제하시겠습니까?',
  DELETE_COMMENT: '정말로 이 댓글을 삭제하시겠습니까?',
  LOGOUT: '정말로 로그아웃하시겠습니까?',
  LEAVE_PAGE: '변경사항이 저장되지 않을 수 있습니다. 페이지를 떠나시겠습니까?',
  UNFOLLOW_USER: '정말로 이 사용자를 언팔로우하시겠습니까?',
} as const

// 카테고리 라벨
export const CATEGORY_LABELS = {
  announcement: '공지사항',
  discussion: '토론',
  tutorial: '튜토리얼',
  tip: '팁',
  experience: '경험담',
  question: '질문',
} as const

// 정렬 옵션 라벨
export const SORT_LABELS = {
  createdAt: '작성일',
  likes: '좋아요순',
  comments: '댓글순',
  views: '조회순',
} as const

// 시간 관련 라벨
export const TIME_LABELS = {
  JUST_NOW: '방금 전',
  MINUTES_AGO: '분 전',
  HOURS_AGO: '시간 전',
  DAYS_AGO: '일 전',
  WEEKS_AGO: '주 전',
  MONTHS_AGO: '개월 전',
  YEARS_AGO: '년 전',
} as const