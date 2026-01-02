import { useContext } from 'react'
import { AuthContext } from './authContextValue'

/**
 * useAuth hook (split from AuthContext.tsx for Fast Refresh compatibility)
 */
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}


