import { useEffect, useState, useCallback } from 'react'
import { signIn, logOut, getCurrentSession, onAuthChange } from '../services/auth.js'

export function useAuth () {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true

    getCurrentSession().then((session) => {
      if (!active) return
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const unsubscribe = onAuthChange((session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      active = false
      unsubscribe()
    }
  }, [])

  const login = useCallback(async (email, password) => {
    setError(null)
    try {
      const session = await signIn(email, password)
      setUser(session.user)
    } catch (err) {
      setError(err.message)
      throw err
    }
  }, [])

  const logout = useCallback(async () => {
    await logOut()
    setUser(null)
  }, [])

  return { user, loading, error, login, logout }
}
