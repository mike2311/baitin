import apiClient from './client'

/**
 * Type definitions for reference data
 */
export interface Zstdcode {
  id: number
  stdCode: string
  description: string | null
  createdAt: string
}

export interface Zorigin {
  id: number
  origin: string
  description: string | null
  createdAt: string
}

/**
 * Reference Data API Service
 * 
 * API methods for reference/lookup tables (zstdcode, zorigin).
 * 
 * Reference: Phase 1.5 - Legacy Data Migration
 */
export const referenceApi = {
  /**
   * Get all standard codes
   */
  getStandardCodes: async (): Promise<Zstdcode[]> => {
    const response = await apiClient.get<Zstdcode[]>('/reference/standard-codes')
    return response.data
  },

  /**
   * Get standard code by code
   */
  getStandardCode: async (stdCode: string): Promise<Zstdcode> => {
    const response = await apiClient.get<Zstdcode>(`/reference/standard-codes/${stdCode}`)
    return response.data
  },

  /**
   * Get all origins
   */
  getOrigins: async (): Promise<Zorigin[]> => {
    const response = await apiClient.get<Zorigin[]>('/reference/origins')
    return response.data
  },

  /**
   * Get origin by code
   */
  getOrigin: async (origin: string): Promise<Zorigin> => {
    const response = await apiClient.get<Zorigin>(`/reference/origins/${origin}`)
    return response.data
  },
}

