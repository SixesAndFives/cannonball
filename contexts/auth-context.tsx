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

  useEffect(() => {
    const savedUser = localStorage.getItem('auth-user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setIsInitialized(true)
  }, [])

  const updateUser = (newUser: AuthUser | null) => {
    setUser(newUser)
    if (newUser) {
      localStorage.setItem('auth-user', JSON.stringify(newUser))
    } else {
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
