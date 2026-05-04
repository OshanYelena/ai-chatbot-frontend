'use client'
import { useState, useEffect, useCallback } from 'react'
import { authApi, tokenStore } from '@/lib/api'

interface User { user_id: string; email: string; is_active: boolean; created_at: string }

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = tokenStore.get()
    if (!token) { setLoading(false); return }
    authApi.me()
      .then(u => { setUser(u); tokenStore.setUser({ user_id: u.user_id, email: u.email }) })
      .catch(() => tokenStore.clear())
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    await authApi.login(email, password)
    const u = await authApi.me()
    setUser(u)
    tokenStore.setUser({ user_id: u.user_id, email: u.email })
  }, [])

  const register = useCallback(async (email: string, password: string) => {
    await authApi.register(email, password)
    await login(email, password)
  }, [login])

  const logout = useCallback(async () => {
    await authApi.logout()
    setUser(null)
  }, [])

  return { user, loading, login, register, logout }
}
