import { useState, useEffect, ReactNode } from 'react'
import { authApi, User } from '../../services/api/auth'
import { AuthContext } from './authContextValue'

/**
 * Authentication Context Provider
 * 
 * Provides authentication state and methods throughout the application.
 * Manages user session, token storage, and authentication status.
 * 
 * Reference: Task 02-01 - Authentication Framework Setup
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing token and validate
    const token = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')

    if (token && storedUser) {
      try {
        const userData = JSON.parse(storedUser)
        setUser(userData)
        // Validate token with backend (but don't block if it fails)
        authApi.getMe().catch(() => {
          // Token invalid, clear storage
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          setUser(null)
        })
      } catch (err) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
    setLoading(false)
  }, [])

  const login = async (username: string, password: string, company?: string) => {
    const response = await authApi.login({ username, password, company })
    if (response.access_token && response.user) {
      localStorage.setItem('token', response.access_token)
      localStorage.setItem('user', JSON.stringify(response.user))
      setUser(response.user)
    } else {
      throw new Error('Invalid login response')
    }
  }

  const logout = async () => {
    await authApi.logout()
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

