/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { apiGet, apiPost } from '../utils/api.js'

const STORAGE_KEY = 'henryme-session'
const AuthContext = createContext(null)

const loadSession = () => {
  if (typeof window === 'undefined') return { user: null, token: null }
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) return { user: null, token: null }
  try {
    return JSON.parse(raw)
  } catch {
    return { user: null, token: null }
  }
}

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const session = loadSession()
  const [user, setUser] = useState(session.user)
  const [token, setToken] = useState(session.token)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (token && user) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, token }))
      return
    }
    window.localStorage.removeItem(STORAGE_KEY)
  }, [token, user])

  useEffect(() => {
    if (!token || user) return
    let active = true

    const fetchMe = async () => {
      setLoading(true)
      try {
        const response = await apiGet('/users/me')
        if (!active) return
        setUser(response.user)
      } catch {
        if (!active) return
        setUser(null)
        setToken(null)
      } finally {
        if (active) setLoading(false)
      }
    }

    fetchMe()
    return () => {
      active = false
    }
  }, [token, user])

  const login = async ({ email, password }) => {
    const response = await apiPost('/auth/login', { email, password })
    setUser(response.user)
    setToken(response.token)
    return response
  }

  const signup = async ({ name, email, password }) => {
    const response = await apiPost('/auth/signup', { name, email, password })
    setUser(response.user)
    setToken(response.token)
    return response
  }

  const logout = () => {
    setUser(null)
    setToken(null)
  }

  const value = useMemo(
    () => ({
      user,
      token,
      isLoggedIn: Boolean(user),
      isLoading: loading,
      login,
      signup,
      logout,
    }),
    [user, token, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
