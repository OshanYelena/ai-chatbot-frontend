'use client'
import Background from '@/components/Background'
import AuthPage from '@/components/AuthPage'
import ChatApp from '@/components/ChatApp'
import { useAuth } from '@/hooks/useAuth'

export default function Home() {
  const { user, loading, login, register, logout } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Background />
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl glass-btn flex items-center justify-center"
            style={{ animation: 'pulse 2s ease-in-out infinite' }}>
            <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          </div>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading…</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Background />
      {user
        ? <ChatApp userEmail={user.email} onLogout={logout} />
        : <AuthPage onLogin={login} onRegister={register} />
      }
    </>
  )
}
