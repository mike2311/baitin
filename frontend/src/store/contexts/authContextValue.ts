import { createContext } from 'react'
import { User } from '../../services/api/auth'

export interface AuthContextType {
  user: User | null
  loading: boolean
  login: (username: string, password: string, company?: string) => Promise<void>
  logout: () => Promise<void>
  isAuthenticated: boolean
}

/**
 * Auth context value (split from AuthContext.tsx for Fast Refresh compatibility)
 */
export const AuthContext = createContext<AuthContextType | undefined>(undefined)


