'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, Sparkles, Zap, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { chatApi, Message } from '@/lib/api'
import MessageBubble from './MessageBubble'
import Sidebar from './Sidebar'

interface ChatAppProps {
  userEmail: string
  onLogout: () => void
}

const SUGGESTIONS = [
  "What can you help me with?",
  "Tell me something interesting",
  "Help me brainstorm ideas",
  "Explain a complex topic simply",
]

export default function ChatApp({ userEmail, onLogout }: ChatAppProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [useStreaming, setUseStreaming] = useState(true)

  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const newId = () => `msg-${Date.now()}-${Math.random().toString(36).slice(2)}`

  const handleSend = useCallback(async (text: string) => {
    const msg = text.trim()
    if (!msg || sending) return
    setInput('')
    setSending(true)

    const userMsg: Message = {
      id: newId(), role: 'user', content: msg, timestamp: new Date()
    }
    setMessages(prev => [...prev, userMsg])

    if (useStreaming) {
      const assistantId = newId()
      const assistantMsg: Message = {
        id: assistantId, role: 'assistant', content: '', timestamp: new Date(), streaming: true
      }
      setMessages(prev => [...prev, assistantMsg])

      let fullContent = ''
      let convId = conversationId

      try {
        const stream = chatApi.stream(msg, conversationId ?? undefined)
        const reader = stream.getReader()
        const decoder = new TextDecoder()

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = typeof value === 'string' ? value : decoder.decode(value)

          // Parse SSE lines
          const lines = chunk.split('\n')
          for (const line of lines) {
            if (line.startsWith('event: token')) continue
            if (line.startsWith('data: ') && !line.includes('event: done')) {
              const data = line.slice(6)
              // check if it looks like a conversation ID (UUID)
              if (/^[0-9a-f-]{36}$/.test(data)) {
                convId = data
                if (!conversationId) setConversationId(data)
              } else {
                fullContent += data
                setMessages(prev => prev.map(m =>
                  m.id === assistantId ? { ...m, content: fullContent } : m
                ))
              }
            }
            if (line.startsWith('event: done')) {
              const dataLine = lines[lines.indexOf(line) + 1] || ''
              const id = dataLine.replace('data: ', '').trim()
              if (id && /^[0-9a-f-]{36}$/.test(id)) {
                convId = id
                if (!conversationId) setConversationId(id)
              }
            }
          }
        }

        setMessages(prev => prev.map(m =>
          m.id === assistantId ? { ...m, streaming: false } : m
        ))
        if (convId) setConversationId(convId)
        setRefreshTrigger(n => n + 1)
      } catch {
        setMessages(prev => prev.map(m =>
          m.id === assistantId ? { ...m, content: 'Something went wrong. Please try again.', streaming: false } : m
        ))
      }
    } else {
      // Non-streaming fallback
      const assistantId = newId()
      setMessages(prev => [...prev, {
        id: assistantId, role: 'assistant', content: '', timestamp: new Date(), streaming: true
      }])
      try {
        const res = await chatApi.send(msg, conversationId ?? undefined)
        setMessages(prev => prev.map(m =>
          m.id === assistantId ? { ...m, content: res.reply, streaming: false } : m
        ))
        setConversationId(res.conversation_id)
        setRefreshTrigger(n => n + 1)
      } catch {
        setMessages(prev => prev.map(m =>
          m.id === assistantId ? { ...m, content: 'Something went wrong. Please try again.', streaming: false } : m
        ))
      }
    }

    setSending(false)
    inputRef.current?.focus()
  }, [sending, conversationId, useStreaming])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend(input)
    }
  }

  const handleNewConversation = () => {
    setMessages([])
    setConversationId(null)
    inputRef.current?.focus()
  }

  const handleSelectConversation = (id: string) => {
    setMessages([])
    setConversationId(id)
    // We just set the ID; the next message sent will continue this conversation
  }

  const isEmpty = messages.length === 0

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <div className="transition-all duration-300 flex-shrink-0 overflow-hidden"
        style={{ width: sidebarOpen ? '260px' : '0px' }}>
        {sidebarOpen && (
          <Sidebar
            activeConversationId={conversationId}
            onSelectConversation={handleSelectConversation}
            onNewConversation={handleNewConversation}
            onLogout={onLogout}
            userEmail={userEmail}
            refreshTrigger={refreshTrigger}
          />
        )}
      </div>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3 glass-subtle"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)}
              className="glass-btn rounded-xl p-2" style={{ border: 'none' }}>
              {sidebarOpen
                ? <PanelLeftClose size={16} style={{ color: 'var(--text-secondary)' }} />
                : <PanelLeftOpen size={16} style={{ color: 'var(--text-secondary)' }} />
              }
            </button>
            <div>
              <h2 className="font-semibold text-sm" style={{
                fontFamily: 'var(--font-display)',
                color: 'var(--text-primary)',
                letterSpacing: '-0.01em',
              }}>
                {conversationId ? 'Conversation' : 'New Chat'}
              </h2>
              {conversationId && (
                <p className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                  {conversationId.slice(0, 8)}…
                </p>
              )}
            </div>
          </div>

          {/* Streaming toggle */}
          <div className="flex items-center gap-2">
            <Zap size={12} style={{ color: useStreaming ? 'var(--accent-amber)' : 'var(--text-muted)' }} />
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Stream</span>
            <button
              onClick={() => setUseStreaming(!useStreaming)}
              className="relative w-9 h-5 rounded-full transition-all duration-300"
              style={{
                background: useStreaming
                  ? 'linear-gradient(135deg, rgba(96,180,255,0.5), rgba(93,232,216,0.4))'
                  : 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.25)',
              }}>
              <span className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all duration-300"
                style={{
                  left: useStreaming ? '18px' : '2px',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                }} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          {isEmpty ? (
            <div className="flex flex-col items-center justify-center h-full px-6 text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                style={{
                  background: 'linear-gradient(135deg, rgba(93,232,216,0.2), rgba(96,180,255,0.15))',
                  border: '1px solid rgba(255,255,255,0.2)',
                  animation: 'float 5s ease-in-out infinite',
                  boxShadow: '0 8px 32px rgba(93,232,216,0.1)',
                }}>
                <Sparkles size={28} style={{ color: 'var(--accent-cyan)' }} />
              </div>
              <h3 className="text-xl font-bold mb-2" style={{
                fontFamily: 'var(--font-display)',
                color: 'var(--text-primary)',
                letterSpacing: '-0.02em',
              }}>
                How can I help you?
              </h3>
              <p className="mb-8 text-sm max-w-xs" style={{ color: 'var(--text-secondary)' }}>
                I remember context across your conversations. Ask me anything.
              </p>

              {/* Suggestion chips */}
              <div className="grid grid-cols-2 gap-2 max-w-md w-full">
                {SUGGESTIONS.map((s, i) => (
                  <button key={i} onClick={() => handleSend(s)}
                    className="glass-btn rounded-xl px-3 py-2.5 text-left text-xs transition-all"
                    style={{
                      color: 'var(--text-secondary)',
                      fontFamily: 'var(--font-body)',
                      animation: `fadeUp 0.4s ease-out ${i * 0.08}s both`,
                    }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
              {messages.map((msg, i) => (
                <MessageBubble key={msg.id} message={msg} index={i} />
              ))}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="px-4 pb-4 pt-2">
          <div className="max-w-3xl mx-auto">
            <div className="glass rounded-2xl p-3 flex items-end gap-3"
              style={{
                boxShadow: '0 8px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.35)',
                border: '1px solid rgba(255,255,255,0.25)',
              }}>
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => {
                  setInput(e.target.value)
                  e.target.style.height = 'auto'
                  e.target.style.height = Math.min(e.target.scrollHeight, 140) + 'px'
                }}
                onKeyDown={handleKeyDown}
                placeholder="Message AI… (Enter to send, Shift+Enter for newline)"
                rows={1}
                className="flex-1 resize-none bg-transparent outline-none text-sm leading-relaxed"
                style={{
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-body)',
                  maxHeight: '140px',
                  minHeight: '24px',
                }}
              />
              <button
                onClick={() => handleSend(input)}
                disabled={!input.trim() || sending}
                className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200"
                style={{
                  background: input.trim() && !sending
                    ? 'linear-gradient(135deg, rgba(96,180,255,0.5), rgba(93,232,216,0.4))'
                    : 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.25)',
                  cursor: !input.trim() || sending ? 'not-allowed' : 'pointer',
                  boxShadow: input.trim() && !sending ? '0 4px 16px rgba(96,180,255,0.2)' : 'none',
                  opacity: !input.trim() || sending ? 0.5 : 1,
                }}>
                {sending
                  ? <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  : <Send size={15} style={{ color: 'white' }} />
                }
              </button>
            </div>
            <p className="text-center mt-2 text-xs" style={{ color: 'var(--text-muted)', fontSize: '10px' }}>
              Memory-aware · {useStreaming ? 'Streaming mode' : 'Standard mode'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
