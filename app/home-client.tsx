'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { UserGrid } from '@/components/user-grid'
import { useAuth } from '@/contexts/auth-context'
import type { User } from '@/lib/types'

interface HomeClientProps {
  users: Omit<User, 'password'>[]
}

export function HomeClient({ users }: HomeClientProps) {
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      router.push('/albums')
    }
  }, [user, router])

  // If user is logged in, don't render anything while redirecting
  if (user) return null

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <main className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-semibold text-center mb-8">Welcome to Cannonball</h2>
        <p className="text-gray-600 text-center mb-12">Select your profile to login</p>
        <div className="max-w-4xl mx-auto">
          <UserGrid users={users} />
        </div>
      </main>
    </div>
  )
}
