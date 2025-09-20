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
  SEARCH_POSTS: '게시글, 작성자 검색...',
  SEARCH_USERS: '사용자 검색...',
  SEARCH_GENERAL: '검색어를 입력하세요...',

  // 게시글 작성
  POST_TITLE: '게시글 제목을 입력하세요',
  POST_CONTENT: '게시글 내용을 작성하세요. 이미지 업로드 버튼을 클릭하거나 복사-붙여넣기도 가능합니다.',
  POST_TAGS: '태그를 쉼표로 구분하여 입력하세요 (예: kubernetes, docker, helm)',

  // 셀렉트
  SELECT_CATEGORY: '카테고리를 선택하세요',
  SELECT_SORT: '정렬',
  SELECT_CATEGORY_FILTER: '카테고리',

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
  NO_POSTS: '아직 게시글이 없습니다',
  NO_USERS: '사용자가 없습니다.',
  NO_COMMENTS: '댓글이 없습니다.',
  NO_SEARCH_RESULTS: '검색 결과가 없습니다',

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
  news: '뉴스',
  showcase: '프로젝트',
} as const

// 정렬 옵션 라벨
export const SORT_LABELS = {
  createdAt: '작성일',
  likes: '좋아요순',
  comments: '댓글순',
  views: '조회순',
  latest: '최신순',
  popular: '인기순',
  commented: '댓글순',
  unanswered: '미답변',
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

// 인증 관련 메시지
export const AUTH_MESSAGES = {
  LOADING: '로딩중...',
  GITHUB_LOGIN: 'GitHub 로그인',
  PROFILE: '프로필',
  LOGOUT: '로그아웃',
} as const

// 페이지 관련 메시지
export const PAGE_MESSAGES = {
  COMMUNITY_TITLE: '한국 쿠버네티스 커뮤니티',
  WELCOME_MESSAGE: '한국 쿠버네티스 커뮤니티에',
  WELCOME_HIGHLIGHT: '오신 것을 환영합니다',
  WELCOME_DESCRIPTION: '쿠버네티스 기술을 함께 배우고, 경험을 나누며, 성장하는 개발자들의 공간입니다. GitHub 계정으로 로그인하여',
  WELCOME_JOIN: '커뮤니티에 참여해보세요.',
  EXPLORE_COMMUNITY: '커뮤니티 둘러보기',
  LEARNING_MATERIALS: '학습 자료',
  COMMUNITY_FEATURES: '커뮤니티 특징',
  FEATURES_DESCRIPTION: '한국 개발자들을 위한 쿠버네티스 전문 커뮤니티의 주요 특징들입니다.',
  GITHUB_INTEGRATION: 'GitHub 통합',
  GITHUB_INTEGRATION_DESC: 'GitHub 계정으로 간편하게 로그인하고 개발자 프로필을 연동하세요.',
  ACTIVE_COMMUNITY: '활발한 커뮤니티',
  ACTIVE_COMMUNITY_DESC: '한국의 쿠버네티스 전문가들과 함께 지식을 공유하고 네트워킹하세요.',
  LEARNING_MATERIALS_DESC: '초보자부터 전문가까지, 단계별 학습 자료와 실습 예제를 제공합니다.',
  RECENT_POSTS: '최근 게시글',
  VIEW_ALL: '전체 보기',
  BOARD: '게시판',
  CONTRIBUTE: '기여하기',
  BEST_PRACTICES: '베스트 프랙티스',
  CONNECT: '연결',
  LEARNING: '학습',
  COMMUNITY: '커뮤니티',
} as const

// 게시글 관련 메시지
export const POST_MESSAGES = {
  POST_DETAIL: '게시글',
  BACK_TO_BOARD: '게시판으로',
  BACK_TO_BOARD_FULL: '게시판으로 돌아가기',
  PIN: '고정',
  PINNED: '고정',
  AUTHOR: '작성자',
  LIKE_BUTTON: '좋아요',
  SHARE_BUTTON: '공유',
  COMMENTS_COUNT: '댓글',
  COMMENT_PLACEHOLDER: '댓글을 작성해주세요... (@사용자명으로 멘션 가능)',
  REPLY_PLACEHOLDER: '답글을 작성해주세요... (@사용자명으로 멘션 가능)',
  WRITING: '작성 중...',
  WRITE_COMMENT: '댓글 작성',
  WRITE_REPLY: '답글 작성',
  LOGIN_REQUIRED_COMMENT: '댓글을 작성하려면 로그인이 필요합니다.',
  NO_COMMENTS: '아직 댓글이 없습니다. 첫 번째 댓글을 작성해보세요!',
  REPLY: '답글',
  PIN_POST: '고정하기',
  UNPIN_POST: '고정 해제',
  NOT_FOUND_TITLE: '게시글을 찾을 수 없습니다',
  NOT_FOUND_DESC: '요청하신 게시글이 존재하지 않거나 삭제되었습니다.',
  REDIRECT_MESSAGE: '게시글 작성 페이지로 이동 중...',
} as const

// 알림 및 확인 메시지
export const ALERT_MESSAGES = {
  ADMIN_ONLY_PIN: '관리자만 고정글을 설정할 수 있습니다.',
  POST_PINNED: '고정글로 설정되었습니다.',
  POST_UNPINNED: '고정글이 해제되었습니다.',
  URL_COPIED: '게시글 URL이 클립보드에 복사되었습니다!',
  CONFIRM_DELETE_POST: '정말로 이 게시글을 삭제하시겠습니까?',
  CONFIRM_DELETE_COMMENT: '정말로 이 댓글을 삭제하시겠습니까?',
} as const

// 에러 메시지 추가
export const CONSOLE_ERROR_MESSAGES = {
  LIKE_FAILED: '좋아요 처리 실패:',
  PIN_FAILED: '고정글 설정 실패:',
  DELETE_POST_FAILED: '게시글 삭제 실패:',
  COMMENT_FAILED: '댓글 작성 실패:',
  REPLY_FAILED: '대댓글 작성 실패:',
  COMMENT_UPDATE_FAILED: '댓글 수정 실패:',
  COMMENT_DELETE_FAILED: '댓글 삭제 실패:',
  FOLLOW_DATA_LOAD_ERROR: '팔로우 데이터 로드 오류:',
  USER_STATS_LOAD_ERROR: '사용자 통계 로드 오류:',
  FOLLOW_ERROR: '팔로우 오류:',
  UNFOLLOW_ERROR: '언팔로우 오류:',
  LOGIN_REQUIRED: '로그인이 필요합니다.',
  PROFILE_UPDATE_ERROR: '프로필 업데이트 중 오류가 발생했습니다.',
  USER_LOAD_ERROR: '사용자 정보를 불러오는 중 오류가 발생했습니다.',
  PROFILE_LOAD_ERROR: '프로필 로드 오류:',
  FOLLOW_PROCESS_ERROR: '팔로우 처리 오류:',
  FOLLOWERS_LOAD_ERROR: '팔로워 목록 로드 오류:',
  FOLLOW_LIST_LOAD_ERROR: '팔로우 목록 로드 오류:',
} as const

// 사용자 관련 메시지
export const USER_MESSAGES = {
  BACK: '돌아가기',
  BACK_TO_PROFILE: '님의 프로필로 돌아가기',
  FOLLOWERS_TITLE: '님의',
  NO_FOLLOWERS: '아직 팔로워가 없습니다.',
  NO_FOLLOWING: '아직 팔로잉하는 사용자가 없습니다.',
  FOLLOW_REQUIRE_AUTH: '팔로우',
  UNFOLLOW_REQUIRE_AUTH: '언팔로우',
  ABOUT: '소개',
  STATS: '통계',
  RECENT_POSTS: '최근 게시글',
  NO_POSTS: '아직 작성한 게시글이 없습니다.',
  FOLLOW_BUTTON: '팔로우',
  UNFOLLOW_BUTTON: '언팔로우',
  FOLLOWING_BUTTON: '팔로잉',
  MESSAGE_BUTTON: '메시지',
} as const

// 시간 표시 메시지
export const TIME_DISPLAY = {
  HOURS_AGO_SUFFIX: '시간 전',
  DAYS_AGO_SUFFIX: '일 전',
  AUTHOR_PREFIX: '작성자:',
  COMMENTS_SUFFIX: '개',
} as const

// 게시글 작성 관련 메시지
export const CREATE_POST_MESSAGES = {
  LOADING: '로딩 중...',
  LOGIN_REQUIRED_TITLE: '로그인이 필요합니다',
  LOGIN_REQUIRED_DESC: '게시글을 작성하려면 로그인해주세요.',
  HOME_BUTTON: '홈으로',
  LOGIN_BUTTON: '로그인',
  BACK_TO_BOARD: '게시판으로',
  NEW_POST_TITLE: '새 게시글 작성',
  NEW_POST_DESC: '커뮤니티와 지식을 공유해보세요',
  AUTHOR_SUFFIX: '으로 게시글 작성',
  CATEGORY_LABEL: '카테고리',
  TITLE_LABEL: '제목',
  CONTENT_LABEL: '내용',
  CONTENT_HELP: '리치 텍스트 에디터를 사용해서 텍스트 서식, 이미지, 링크 등을 추가할 수 있습니다.',
  TAGS_LABEL: '태그',
  TAGS_HELP: '관련 기술이나 주제를 태그로 추가하면 다른 사용자들이 쉽게 찾을 수 있습니다.',
  POSTING: '게시 중...',
  PUBLISH_POST: '게시글 작성',
  CANCEL: '취소',
} as const

// 게시판 페이지 관련 메시지
export const POSTS_PAGE_MESSAGES = {
  BOARD_TITLE: '커뮤니티 게시판',
  BOARD_DESC: '지식을 공유하고 질문하며 함께 성장해보세요',
  WRITE_POST: '게시글 작성',
  SEARCH_PLACEHOLDER: '게시글, 작성자, 태그로 검색...',
  FILTER_BY_CATEGORY: '카테고리별 필터',
  ALL_CATEGORIES: '전체 카테고리',
  SORT_BY: '정렬',
  TAG_FILTER: '태그 필터',
  ALL_TAGS: '모든 태그',
  VIEWS: '조회',
  NO_POSTS_TITLE: '게시글이 없습니다',
  NO_POSTS_DESC: '아직 게시글이 없습니다. 첫 번째 게시글을 작성해보세요!',
  NO_RESULTS_TITLE: '검색 결과가 없습니다',
  NO_RESULTS_DESC: '검색 조건을 변경해보세요.',
  PINNED_BADGE: '고정',
  HOUR_AGO: '시간 전',
  DAY_AGO: '일 전',
  WEEK_AGO: '주 전',
  MONTH_AGO: '개월 전',
  YEAR_AGO: '년 전',
  CLEAR_ALL: '전체 해제',
} as const

// 게시글 수정 관련 메시지
export const EDIT_POST_MESSAGES = {
  LOADING: '로딩 중...',
  LOGIN_REQUIRED_TITLE: '로그인이 필요합니다',
  LOGIN_REQUIRED_DESC: '게시글을 수정하려면 로그인해주세요.',
  POST_NOT_FOUND_TITLE: '게시글을 찾을 수 없습니다',
  POST_NOT_FOUND_DESC: '요청하신 게시글이 존재하지 않거나 삭제되었습니다.',
  NO_PERMISSION_TITLE: '수정 권한이 없습니다',
  NO_PERMISSION_DESC: '본인이 작성한 게시글만 수정할 수 있습니다.',
  BACK_TO_POST: '게시글로',
  BACK_TO_POST_FULL: '게시글로 돌아가기',
  EDIT_POST_TITLE: '게시글 수정',
  EDIT_POST_DESC: '내용을 수정하고 저장하세요',
  EDITING_SUFFIX: '게시글 수정 중',
  EDITOR_HELP: '에디터를 사용해서 텍스트 서식, 이미지, 링크 등을 추가할 수 있습니다.',
  SAVING: '저장 중...',
  SAVE_COMPLETE: '수정 완료',
  TIP_CATEGORY: '팁 & 노하우',
  NEWS_CATEGORY: '뉴스 & 업데이트',
  PROJECT_CATEGORY: '프로젝트 소개',
} as const