'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import type { User } from '@/lib/types'

type AuthUser = Omit<User, 'password'>

interface AuthContextType {
  user: AuthUser | null
  setUser: (user: AuthUser | null) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  // Transform any camelCase to snake_case
  const normalizeUser = (user: any): AuthUser => ({
    id: user.id,
    user_name: user.user_name || user.userName,
    full_name: user.full_name || user.fullName,
    profile_image: user.profile_image || user.profileImage,
    instruments: user.instruments,
    created_at: user.created_at || user.createdAt
  })

  useEffect(() => {
    const savedUser = localStorage.getItem('auth-user')
    console.log('AuthContext - Loading user from localStorage:', savedUser)
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser)
        console.log('AuthContext - Parsed user:', JSON.stringify(parsedUser, null, 2))
        // Transform any camelCase to snake_case
        const normalizedUser = normalizeUser(parsedUser)
        console.log('AuthContext - Normalized user:', JSON.stringify(normalizedUser, null, 2))
        setUser(normalizedUser)
      } catch (error) {
        console.error('Error parsing user from localStorage:', error)
        localStorage.removeItem('auth-user')
      }
    }
    setIsInitialized(true)
  }, [])

  const updateUser = (newUser: AuthUser | null) => {
    console.log('AuthContext - Updating user:', JSON.stringify(newUser, null, 2))
    if (newUser) {
      // Only normalize if the user is different
      const currentJson = user ? JSON.stringify(user) : null
      const newJson = JSON.stringify(newUser)
      
      if (currentJson !== newJson) {
        const normalizedUser = normalizeUser(newUser)
        console.log('AuthContext - Normalized user:', JSON.stringify(normalizedUser, null, 2))
        setUser(normalizedUser)
        localStorage.setItem('auth-user', JSON.stringify(normalizedUser))
      }
    } else if (user !== null) { // Only clear if currently set
      setUser(null)
      localStorage.removeItem('auth-user')
    }
  }

  return (
    <AuthContext.Provider value={{ user, setUser: updateUser }}>
      {isInitialized ? children : null}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
