'use client'
import { useState, useEffect } from 'react'
import { Plus, MessageSquare, Clock, LogOut, Sparkles, ChevronRight, User } from 'lucide-react'
import { chatApi, Conversation } from '@/lib/api'

interface SidebarProps {
  activeConversationId: string | null
  onSelectConversation: (id: string) => void
  onNewConversation: () => void
  onLogout: () => void
  userEmail: string
  refreshTrigger: number
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function Sidebar({
  activeConversationId, onSelectConversation, onNewConversation, onLogout, userEmail, refreshTrigger
}: SidebarProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    chatApi.conversations()
      .then(data => setConversations(data.sort((a, b) =>
        new Date(b.last_activity_at).getTime() - new Date(a.last_activity_at).getTime()
      )))
      .catch(() => setConversations([]))
      .finally(() => setLoading(false))
  }, [refreshTrigger])

  return (
    <div className="flex flex-col h-full glass-subtle" style={{
      borderRight: '1px solid rgba(255,255,255,0.1)',
      minWidth: 0,
    }}>
      {/* Header */}
      <div className="p-4 pb-3">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, rgba(96,180,255,0.4), rgba(93,232,216,0.3))', border: '1px solid rgba(255,255,255,0.3)' }}>
            <Sparkles size={14} style={{ color: 'var(--accent-cyan)' }} />
          </div>
          <span className="font-bold text-base truncate" style={{
            fontFamily: 'var(--font-display)',
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
          }}>AI Chatbot</span>
        </div>

        {/* New chat button */}
        <button
          onClick={onNewConversation}
          className="w-full glass-btn rounded-2xl py-2.5 px-3 flex items-center gap-2.5 text-sm font-medium"
          style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
          <Plus size={16} style={{ color: 'var(--accent-cyan)' }} />
          New Conversation
        </button>
      </div>

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 rounded-xl shimmer" style={{
              background: 'rgba(255,255,255,0.04)',
              animationDelay: `${i * 0.1}s`,
            }} />
          ))
        ) : conversations.length === 0 ? (
          <div className="text-center py-8 px-4">
            <MessageSquare size={24} className="mx-auto mb-2 opacity-30" style={{ color: 'var(--text-muted)' }} />
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No conversations yet</p>
          </div>
        ) : (
          conversations.map((conv, i) => {
            const active = conv.conversation_id === activeConversationId
            return (
              <button
                key={conv.conversation_id}
                onClick={() => onSelectConversation(conv.conversation_id)}
                className="w-full text-left rounded-xl p-3 transition-all duration-200 group"
                style={{
                  background: active ? 'rgba(96,180,255,0.15)' : 'transparent',
                  border: active ? '1px solid rgba(96,180,255,0.3)' : '1px solid transparent',
                  animation: `fadeUp 0.3s ease-out ${i * 0.04}s both`,
                }}>
                <div className="flex items-start gap-2.5">
                  <MessageSquare size={13} className="mt-0.5 flex-shrink-0" style={{
                    color: active ? 'var(--accent-blue)' : 'var(--text-muted)'
                  }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs leading-snug line-clamp-2 mb-1" style={{
                      color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                      fontWeight: active ? 500 : 400,
                    }}>
                      {conv.last_message || conv.summary || 'New conversation'}
                    </p>
                    <div className="flex items-center gap-1">
                      <Clock size={10} style={{ color: 'var(--text-muted)' }} />
                      <span className="text-xs" style={{ color: 'var(--text-muted)', fontSize: '10px' }}>
                        {timeAgo(conv.last_activity_at)}
                      </span>
                    </div>
                  </div>
                  {active && <ChevronRight size={12} style={{ color: 'var(--accent-blue)', flexShrink: 0 }} />}
                </div>
              </button>
            )
          })
        )}
      </div>

      {/* User / Logout */}
      <div className="p-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <div className="glass-subtle rounded-2xl p-3 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, rgba(184,143,255,0.3), rgba(96,180,255,0.2))', border: '1px solid rgba(255,255,255,0.2)' }}>
            <User size={14} style={{ color: 'var(--accent-purple)' }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>
              {userEmail}
            </p>
          </div>
          <button onClick={onLogout} className="glass-btn rounded-lg p-1.5 flex-shrink-0"
            title="Sign out" style={{ border: 'none' }}>
            <LogOut size={13} style={{ color: 'var(--text-secondary)' }} />
          </button>
        </div>
      </div>
    </div>
  )
}
