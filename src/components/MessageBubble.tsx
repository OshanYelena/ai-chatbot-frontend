'use client'
import { Message } from '@/lib/api'
import { Sparkles, User } from 'lucide-react'

interface MessageBubbleProps {
  message: Message
  index: number
}

export default function MessageBubble({ message, index }: MessageBubbleProps) {
  const isUser = message.role === 'user'

  return (
    <div
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
      style={{ animation: `fadeUp 0.35s ease-out ${Math.min(index * 0.05, 0.3)}s both` }}
    >
      {/* Avatar */}
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
        style={isUser ? {
          background: 'linear-gradient(135deg, rgba(184,143,255,0.4), rgba(96,180,255,0.3))',
          border: '1px solid rgba(255,255,255,0.25)',
          boxShadow: '0 4px 16px rgba(184,143,255,0.2)',
        } : {
          background: 'linear-gradient(135deg, rgba(93,232,216,0.3), rgba(96,180,255,0.25))',
          border: '1px solid rgba(255,255,255,0.25)',
          boxShadow: '0 4px 16px rgba(93,232,216,0.15)',
        }}>
        {isUser
          ? <User size={14} style={{ color: 'var(--accent-purple)' }} />
          : <Sparkles size={14} style={{ color: 'var(--accent-cyan)' }} />
        }
      </div>

      {/* Bubble */}
      <div className="max-w-[72%]">
        <div
          className="rounded-2xl px-4 py-3 text-sm leading-relaxed"
          style={isUser ? {
            background: 'linear-gradient(135deg, rgba(96,180,255,0.22), rgba(93,232,216,0.14))',
            border: '1px solid rgba(255,255,255,0.25)',
            boxShadow: '0 4px 20px rgba(96,180,255,0.12), inset 0 1px 0 rgba(255,255,255,0.35)',
            color: 'var(--text-primary)',
            borderBottomRightRadius: '6px',
          } : {
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.14)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.2)',
            color: 'var(--text-primary)',
            borderBottomLeftRadius: '6px',
          }}>
          {message.streaming && !message.content ? (
            <div className="flex items-center gap-1.5 py-1">
              {[0, 0.2, 0.4].map((delay, i) => (
                <div key={i} className="w-2 h-2 rounded-full"
                  style={{
                    background: 'var(--accent-cyan)',
                    animation: `pulse 1.4s ease-in-out ${delay}s infinite`,
                    opacity: 0.7,
                  }} />
              ))}
            </div>
          ) : (
            <span className={message.streaming ? 'cursor-blink' : ''}>
              {message.content}
            </span>
          )}
        </div>

        {/* Timestamp */}
        {!message.streaming && (
          <p className="mt-1 px-1 text-xs" style={{
            color: 'var(--text-muted)',
            textAlign: isUser ? 'right' : 'left',
            fontSize: '10px',
          }}>
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>
    </div>
  )
}
