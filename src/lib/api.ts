const AUTH_URL = process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:8001'
const CHAT_URL = process.env.NEXT_PUBLIC_CHAT_URL || 'http://localhost:8000'

// ── Token storage ─────────────────────────────────────────────────────────────
export const tokenStore = {
  get: () => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('access_token')
  },
  set: (token: string) => localStorage.setItem('access_token', token),
  getRefresh: () => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('refresh_token')
  },
  setRefresh: (token: string) => localStorage.setItem('refresh_token', token),
  clear: () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
  },
  getUser: (): { user_id: string; email: string } | null => {
    if (typeof window === 'undefined') return null
    const raw = localStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
  },
  setUser: (user: { user_id: string; email: string }) =>
    localStorage.setItem('user', JSON.stringify(user)),
}

// ── Auth API ──────────────────────────────────────────────────────────────────
export const authApi = {
  register: async (email: string, password: string) => {
    const res = await fetch(`${AUTH_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.detail || 'Registration failed')
    return data
  },

  login: async (email: string, password: string) => {
    const res = await fetch(`${AUTH_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.detail || 'Login failed')
    tokenStore.set(data.access_token)
    tokenStore.setRefresh(data.refresh_token)
    return data
  },

  logout: async () => {
    const refresh_token = tokenStore.getRefresh()
    if (refresh_token) {
      await fetch(`${AUTH_URL}/api/v1/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token }),
      }).catch(() => {})
    }
    tokenStore.clear()
  },

  me: async () => {
    const res = await fetch(`${AUTH_URL}/api/v1/auth/me`, {
      headers: { Authorization: `Bearer ${tokenStore.get()}` },
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.detail || 'Unauthorized')
    return data
  },
}

// ── Chat API ──────────────────────────────────────────────────────────────────
export const chatApi = {
  send: async (message: string, conversation_id?: string) => {
    const res = await fetch(`${CHAT_URL}/api/v1/chat/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenStore.get()}`,
      },
      body: JSON.stringify({ message, ...(conversation_id ? { conversation_id } : {}) }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.detail || 'Chat failed')
    return data as { reply: string; user_id: string; conversation_id: string }
  },

  stream: (message: string, conversation_id?: string): ReadableStream => {
    return new ReadableStream({
      async start(controller) {
        try {
          const res = await fetch(`${CHAT_URL}/api/v1/chat/stream`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${tokenStore.get()}`,
            },
            body: JSON.stringify({ message, ...(conversation_id ? { conversation_id } : {}) }),
          })
          if (!res.body) { controller.close(); return }
          const reader = res.body.getReader()
          const decoder = new TextDecoder()
          while (true) {
            const { done, value } = await reader.read()
            if (done) { controller.close(); break }
            controller.enqueue(decoder.decode(value))
          }
        } catch (e) {
          controller.error(e)
        }
      },
    })
  },

  conversations: async () => {
    const res = await fetch(`${CHAT_URL}/api/v1/conversations/`, {
      headers: { Authorization: `Bearer ${tokenStore.get()}` },
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.detail || 'Failed to load conversations')
    return data as Conversation[]
  },

  // Fetch full message history for a conversation
  getMessages: async (conversation_id: string) => {
    const res = await fetch(`${CHAT_URL}/api/v1/conversations/${conversation_id}/messages`, {
      headers: { Authorization: `Bearer ${tokenStore.get()}` },
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.detail || 'Failed to load messages')
    return data as ConversationHistory
  },
}

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  streaming?: boolean
}

export interface Conversation {
  conversation_id: string
  summary: string | null
  created_at: string
  last_activity_at: string
  last_message: string | null
}

export interface ConversationHistory {
  conversation_id: string
  summary: string | null
  messages: Array<{
    id: string
    role: string
    content: string
    created_at: string
  }>
}
