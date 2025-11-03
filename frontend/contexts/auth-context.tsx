"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { User } from "@/lib/types"
import { login as apiLogin, register as apiRegister, logout, isAuthenticated as checkAuth, getCurrentUser } from "@/lib/api"

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  isAuthenticated: boolean
  isLoading: boolean // Add loading state to prevent premature redirects
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true) // Start with true to prevent premature redirects

  useEffect(() => {
    // Check if user is authenticated on mount
    // This runs once when AuthProvider mounts to check for existing token
    const checkAuthAndFetchUser = async () => {
      const authStatus = checkAuth()
      setIsAuthenticated(authStatus)
      
      // If authenticated, fetch user data from backend
      if (authStatus) {
        const response = await getCurrentUser()
        if (response.success && response.data?.user) {
          const userData = response.data.user
          // Transform backend user to frontend format
          const currentUser: User = {
            id: userData.id.toString(),
            username: userData.email,
            name: userData.name,
          }
          setUser(currentUser)
        } else {
          // Token exists but is invalid, clear auth status and user
          setIsAuthenticated(false)
          setUser(null)
        }
      }
      
      setIsLoading(false) // Mark as loaded after checking auth status
    }
    
    checkAuthAndFetchUser()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const response = await apiLogin(email, password)
    
    if (response.success && response.data?.user) {
      const userData = response.data.user
      // Transform backend user to frontend format
      const loggedInUser: User = {
        id: userData.id.toString(),
        username: userData.email,
        name: userData.name,
      }
      setUser(loggedInUser)
      setIsAuthenticated(true)
      return { success: true }
    }
    
    return { success: false, error: response.error }
  }

  const register = async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const response = await apiRegister(name, email, password)
    
    // Registration successful, but need to login
    // Return true to redirect to login page
    if (response.success) {
      return { success: true }
    }
    
    return { success: false, error: response.error }
  }

  const handleLogout = () => {
    // Call API logout to remove token
    logout()
    // Clear local state
    setUser(null)
    setIsAuthenticated(false)
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout: handleLogout, isAuthenticated, isLoading }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
