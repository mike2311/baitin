import apiClient from './client'

export interface LoginRequest {
  username: string
  password: string
  company?: string
}

export interface LoginResponse {
  access_token: string
  user: {
    id: number
    username: string
    role: string
    company: string
  }
}

export interface User {
  id: number
  username: string
  role: string
  company: string
}

/**
 * Authentication API Service
 * 
 * Handles login, logout, and user information retrieval.
 * 
 * Reference: Task 02-01 - Authentication Framework Setup
 */
export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials)
    return response.data
  },

  getMe: async (): Promise<User> => {
    const response = await apiClient.get<User>('/auth/me')
    return response.data
  },

  logout: async (): Promise<void> => {
    // For PoC, just clear local storage
    // In production, would call logout endpoint
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },
}


