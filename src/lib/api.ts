export type ApiPost = {
  id: string
  title: string
  content: string
  authorId: string
  author: {
    name: string
    alias: string | null
    anonymousId: string | null
  }
  room: {
    id: string
    name: string
    icon: string
    gradient: string
  }
  category: string
  duration: string
  isVoiceNote: boolean
  expiresAt: string | null
  createdAt: string
}

export type ApiRoom = {
  id: string
  name: string
  description: string
  icon: string
  gradient: string
  isTrending: boolean
  memberCount: number
  recentPostCount: number
  lastActivity: string | null
  createdAt: string
}

export type ApiReaction = {
  tea: number
  spicy: number
  cap: number
  hearts: number
}

// API base URL comes from env for consistency across environments.
// Set VITE_API_URL to your hosted backend (e.g., https://api.example.com)
// Falls back to production URL, then "/api" for local dev
const getApiBase = () => {
  const envUrl = import.meta.env.VITE_API_URL as string | undefined
  if (envUrl) {
    return envUrl.replace(/\/$/, "")
  }
  
  // Production fallback
  if (import.meta.env.PROD) {
    return "https://bwp-back-1.onrender.com"
  }
  
  // Development fallback
  return "/api"
}

export const API_BASE = getApiBase()

// Debug logging
console.log('🔧 [API] Environment VITE_API_URL:', import.meta.env.VITE_API_URL)
console.log('🔧 [API] Environment PROD:', import.meta.env.PROD)
console.log('🔧 [API] Resolved API_BASE:', API_BASE)

const isBrowser = typeof window !== 'undefined'

const getStoredUser = (): ApiUser | null => {
  if (!isBrowser) return null
  const raw = window.localStorage.getItem('user')
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export const getAuthToken = (): string | null => {
  if (!isBrowser) return null
  const storedUser = getStoredUser()
  if (storedUser?.token) {
    return storedUser.token
  }
  return window.localStorage.getItem('authToken')
}

const authHeaders = (headers: Record<string, string> = {}) => {
  const token = getAuthToken()
  if (token) {
    return {
      ...headers,
      Authorization: `Bearer ${token}`,
    }
  }
  return headers
}

// Agora
export async function getRtcToken(params: { channel: string; uid?: string | number; role?: 'publisher' | 'subscriber'; expireSeconds?: number }): Promise<{ token: string; uid: string | number }>{
  const res = await fetch(`${API_BASE}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  })
  if (!res.ok) throw new Error("Failed to get token")
  return res.json()
}

export async function getPosts(roomId?: string): Promise<ApiPost[]> {
  const url = roomId ? `${API_BASE}/posts?roomId=${roomId}` : `${API_BASE}/posts`
  const res = await fetch(url)
  if (!res.ok) throw new Error("Failed to fetch posts")
  return res.json()
}

export async function deletePost(postId: string) {
  const res = await fetch(`${API_BASE}/posts/${postId}`, {
    method: "DELETE",
    headers: authHeaders({
      "Content-Type": "application/json",
    }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'unknown' }))
    throw new Error(err.error || 'delete_failed')
  }
  return res.json()
}

export async function createPost(data: { 
  title: string
  content: string
  roomId: string
  category: string
  duration: string
  isVoiceNote?: boolean
}) {
  const res = await fetch(`${API_BASE}/posts`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("Failed to create post")
  return res.json()
}

export type ApiUser = { 
  id: string; 
  name: string; 
  email: string | null; 
  alias?: string | null; 
  anonymousId?: string | null; 
  token?: string;
}

export async function getUsers(): Promise<ApiUser[]> {
  const res = await fetch(`${API_BASE}/users`)
  if (!res.ok) throw new Error("Failed to fetch users")
  return res.json()
}

export async function createUser(data: { name: string; email: string; password: string }): Promise<ApiUser> {
  console.log('🔵 [FRONTEND] Creating user with data:', { ...data, password: '[HIDDEN]' });
  
  const res = await fetch(`${API_BASE}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  
  console.log('🔵 [FRONTEND] Create user response status:', res.status);
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    console.error('❌ [FRONTEND] Create user failed:', errorData);
    throw new Error(errorData.error || "Failed to create user")
  }
  
  const userData = await res.json();
  console.log('✅ [FRONTEND] User created successfully:', userData);
  return userData;
}

export async function loginUser(data: { email: string; password: string }): Promise<ApiUser> {
  console.log('🔵 [FRONTEND] Logging in user with email:', data.email);
  
  const res = await fetch(`${API_BASE}/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  
  console.log('🔵 [FRONTEND] Login response status:', res.status);
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    console.error('❌ [FRONTEND] Login failed:', errorData);
    throw new Error(errorData.error || "Failed to login")
  }
  
  const userData = await res.json();
  console.log('✅ [FRONTEND] Login successful:', userData);
  return userData;
}

export async function createAnonymousUser(): Promise<ApiUser> {
  console.log('🔵 [FRONTEND] Creating anonymous user');
  
  const res = await fetch(`${API_BASE}/users/anonymous`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  })
  
  console.log('🔵 [FRONTEND] Anonymous user response status:', res.status);
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    console.error('❌ [FRONTEND] Anonymous user creation failed:', errorData);
    throw new Error(errorData.error || "Failed to create anonymous user")
  }
  
  const userData = await res.json();
  console.log('✅ [FRONTEND] Anonymous user created successfully:', userData);
  return userData;
}

export async function logoutUser(userId: string): Promise<{ message: string; isDemo?: boolean }> {
  console.log('🔵 [FRONTEND] Logging out user with ID:', userId);
  
  const res = await fetch(`${API_BASE}/users/logout`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ userId }),
  })
  
  console.log('🔵 [FRONTEND] Logout response status:', res.status);
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    console.error('❌ [FRONTEND] Logout failed:', errorData);
    throw new Error(errorData.error || "Failed to logout")
  }
  
  const logoutData = await res.json();
  console.log('✅ [FRONTEND] Logout successful:', logoutData);
  return logoutData;
}

// Rooms API
export async function getRooms(trending?: boolean): Promise<ApiRoom[]> {
  const url = trending !== undefined ? `${API_BASE}/rooms?trending=${trending}` : `${API_BASE}/rooms`
  const res = await fetch(url)
  if (!res.ok) throw new Error("Failed to fetch rooms")
  return res.json()
}

export async function getRoom(roomId: string): Promise<ApiRoom & { recentPosts: ApiPost[] }> {
  const res = await fetch(`${API_BASE}/rooms/${roomId}`)
  if (!res.ok) throw new Error("Failed to fetch room")
  return res.json()
}

export async function createRoom(data: {
  name: string
  description: string
  icon?: string
  gradient?: string
}): Promise<ApiRoom> {
  const res = await fetch(`${API_BASE}/rooms`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.error || "Failed to create room")
  }
  return res.json()
}

// Reactions API
export async function addReaction(postId: string, reactionType: 'tea' | 'spicy' | 'cap' | 'hearts') {
  const res = await fetch(`${API_BASE}/reactions`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ postId, reactionType }),
  })
  if (!res.ok) throw new Error("Failed to add reaction")
  return res.json()
}

export async function removeReaction(postId: string, reactionType: 'tea' | 'spicy' | 'cap' | 'hearts') {
  const res = await fetch(`${API_BASE}/reactions`, {
    method: "DELETE",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ postId, reactionType }),
  })
  if (!res.ok) throw new Error("Failed to remove reaction")
  return res.json()
}

export async function getPostReactions(postId: string, userId?: string): Promise<{ reactions: ApiReaction; totalReactions: number; userReaction?: { reactionType: string; createdAt: string } }> {
  const url = userId ? `${API_BASE}/reactions/${postId}?userId=${userId}` : `${API_BASE}/reactions/${postId}`
  const res = await fetch(url, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error("Failed to fetch reactions")
  return res.json()
}

// User Profile API
export async function getUserPosts(userId: string): Promise<ApiPost[]> {
  const res = await fetch(`${API_BASE}/posts?authorId=${userId}`)
  if (!res.ok) throw new Error("Failed to fetch user posts")
  return res.json()
}

export async function getUserStats(userId: string): Promise<{
  totalPosts: number
  totalReactions: number
  topCategory: string
  memberSince: string
  streak: number
  averageReactions: number
}> {
  const res = await fetch(`${API_BASE}/users/${userId}/stats`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error("Failed to fetch user stats")
  return res.json()
}

// Badges API
export type ApiBadge = {
  id: string
  name: string
  description: string
  icon: string
  rarity: 'common' | 'rare' | 'legendary'
  earned: boolean
  earnedAt: string | null
  meetsRequirements: boolean
  requirements: {
    postsRequired: number
    reactionsRequired: number
    daysActive: number
    category: string | null
  }
}

export async function getUserBadges(userId: string): Promise<ApiBadge[]> {
  const res = await fetch(`${API_BASE}/badges/${userId}`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error("Failed to fetch user badges")
  return res.json()
}

export async function checkAndAwardBadges(userId: string): Promise<{ newBadges: ApiBadge[]; totalNew: number }> {
  const res = await fetch(`${API_BASE}/badges/${userId}/check`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
  })
  if (!res.ok) throw new Error("Failed to check badges")
  return res.json()
}

// Comments API
export type ApiComment = {
  id: string
  content: string
  authorId: string
  author: {
    name: string
    alias: string | null
    anonymousId: string | null
  }
  createdAt: string
  replies?: ApiComment[]
}

export async function getPostComments(postId: string): Promise<ApiComment[]> {
  const res = await fetch(`${API_BASE}/comments/${postId}`)
  if (!res.ok) throw new Error("Failed to fetch comments")
  return res.json()
}

export async function createComment(data: {
  postId: string
  content: string
  parentCommentId?: string
}): Promise<ApiComment> {
  const res = await fetch(`${API_BASE}/comments`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.error || "Failed to create comment")
  }
  return res.json()
}

export async function deleteComment(commentId: string): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE}/comments/${commentId}`, {
    method: "DELETE",
    headers: authHeaders({ "Content-Type": "application/json" }),
  })
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.error || "Failed to delete comment")
  }
  return res.json()
}

// Chat API Types
export type ApiChat = {
  _id: string
  participants: Array<{
    _id: string
    name: string
    email: string
    alias?: string
  }>
  messages: Array<{
    _id: string
    sender: {
      _id: string
      name: string
      alias?: string
    }
    content: string
    timestamp: string
    messageType: 'text' | 'image' | 'file'
    readBy: Array<{
      user: string
      readAt: string
    }>
    isDeleted: boolean
  }>
  lastMessage?: {
    content: string
    timestamp: string
    sender: {
      _id: string
      name: string
    }
  }
  unreadCount?: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type ApiChatMessage = {
  _id: string
  sender: {
    _id: string
    username: string
    avatar?: string
  }
  content: string
  timestamp: string
  messageType: 'text' | 'image' | 'file'
  readBy: Array<{
    user: string
    readAt: string
  }>
  isDeleted: boolean
}

// Chat API Functions
export async function getUserChats(userId: string): Promise<ApiChat[]> {
  const res = await fetch(`${API_BASE}/chats/user/${userId}`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error("Failed to fetch user chats")
  return res.json()
}

export async function getChat(userId1: string, userId2: string): Promise<ApiChat> {
  const res = await fetch(`${API_BASE}/chats/between/${userId1}/${userId2}`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error("Failed to fetch chat")
  return res.json()
}

export async function sendMessage(data: {
  senderId: string
  receiverId: string
  content: string
  messageType?: 'text' | 'image' | 'file'
}): Promise<{ message: string; chat: ApiChat }> {
  const res = await fetch(`${API_BASE}/chats/send`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.error || "Failed to send message")
  }
  return res.json()
}

export async function markMessagesAsRead(data: {
  chatId: string
  userId: string
  messageId?: string
}): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE}/chats/mark-read`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.error || "Failed to mark messages as read")
  }
  return res.json()
}

export async function deleteMessage(data: {
  chatId: string
  messageId: string
  userId: string
}): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE}/chats/message`, {
    method: "DELETE",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.error || "Failed to delete message")
  }
  return res.json()
}

export async function getUnreadCount(userId: string): Promise<{ unreadCount: number }> {
  const res = await fetch(`${API_BASE}/chats/unread/${userId}`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error("Failed to fetch unread count")
  return res.json()
}

export async function searchUsers(query: string): Promise<ApiUser[]> {
  const res = await fetch(`${API_BASE}/chats/search-users?query=${encodeURIComponent(query)}`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error("Failed to search users")
  return res.json()
}


