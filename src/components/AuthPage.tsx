'use client'
import { useState } from 'react'
import { Eye, EyeOff, Sparkles, ArrowRight, Lock, Mail } from 'lucide-react'

interface AuthPageProps {
  onLogin: (email: string, password: string) => Promise<void>
  onRegister: (email: string, password: string) => Promise<void>
}

export default function AuthPage({ onLogin, onRegister }: AuthPageProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'login') await onLogin(email, password)
      else await onRegister(email, password)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo / Header */}
        <div className="text-center mb-8" style={{ animation: 'fadeUp 0.6s ease-out forwards' }}>
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 glass-btn"
            style={{ background: 'linear-gradient(135deg, rgba(96,180,255,0.3), rgba(93,232,216,0.3))' }}>
            <Sparkles size={28} style={{ color: 'var(--accent-cyan)' }} />
          </div>
          <h1 className="text-3xl font-bold mb-2" style={{
            fontFamily: 'var(--font-display)',
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
          }}>
            AI Chatbot
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
            {mode === 'login' ? 'Welcome back. Sign in to continue.' : 'Create your account to get started.'}
          </p>
        </div>

        {/* Card */}
        <div className="glass rounded-3xl p-8" style={{
          animation: 'fadeUp 0.6s ease-out 0.1s both',
          boxShadow: '0 24px 80px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.4)',
        }}>
          {/* Mode toggle */}
          <div className="flex rounded-2xl p-1 mb-6 glass-subtle">
            {(['login', 'register'] as const).map(m => (
              <button key={m} onClick={() => { setMode(m); setError('') }}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-300"
                style={{
                  fontFamily: 'var(--font-display)',
                  color: mode === m ? '#fff' : 'var(--text-secondary)',
                  background: mode === m
                    ? 'linear-gradient(135deg, rgba(96,180,255,0.4), rgba(93,232,216,0.25))'
                    : 'transparent',
                  border: mode === m ? '1px solid rgba(255,255,255,0.3)' : '1px solid transparent',
                  boxShadow: mode === m ? '0 4px 16px rgba(0,0,0,0.2)' : 'none',
                }}>
                {m === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{
                color: 'var(--text-secondary)',
                fontFamily: 'var(--font-display)',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}>Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="glass-input w-full pl-10 pr-4 py-3 rounded-2xl text-sm"
                  style={{ fontFamily: 'var(--font-body)' }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{
                color: 'var(--text-secondary)',
                fontFamily: 'var(--font-display)',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}>Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-muted)' }} />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={8}
                  className="glass-input w-full pl-10 pr-12 py-3 rounded-2xl text-sm"
                  style={{ fontFamily: 'var(--font-body)' }}
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-100 opacity-60">
                  {showPw
                    ? <EyeOff size={16} style={{ color: 'var(--text-secondary)' }} />
                    : <Eye size={16} style={{ color: 'var(--text-secondary)' }} />
                  }
                </button>
              </div>
              {mode === 'register' && (
                <p className="mt-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                  Minimum 8 characters
                </p>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-xl px-4 py-3 text-sm" style={{
                background: 'rgba(255, 80, 80, 0.12)',
                border: '1px solid rgba(255, 80, 80, 0.3)',
                color: '#ff9090',
              }}>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all duration-300"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '15px',
                background: loading
                  ? 'rgba(255,255,255,0.1)'
                  : 'linear-gradient(135deg, rgba(96,180,255,0.5) 0%, rgba(93,232,216,0.4) 100%)',
                border: '1px solid rgba(255,255,255,0.35)',
                color: 'white',
                boxShadow: loading ? 'none' : '0 8px 32px rgba(96,180,255,0.25), inset 0 1px 0 rgba(255,255,255,0.4)',
                cursor: loading ? 'not-allowed' : 'pointer',
                letterSpacing: '-0.01em',
              }}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  {mode === 'login' ? 'Signing in…' : 'Creating account…'}
                </span>
              ) : (
                <>
                  {mode === 'login' ? 'Sign In' : 'Create Account'}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center mt-4 text-xs" style={{ color: 'var(--text-muted)' }}>
          Auth Gateway · Chatbot Service · Jaeger Tracing
        </p>
      </div>
    </div>
  )
}
