'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export function Header() {
  const { user, setUser } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="block">
              <div className="relative w-40 h-12 overflow-hidden">
                <Image
                  src="/images/logo.jpg"
                  alt="Cannonball Logo"
                  fill
                  className="object-contain"
                />
              </div>
            </Link>
            <h1 className="text-2xl font-bold tracking-wider">THE VAULT</h1>
          </div>
          <div className="flex items-center gap-6">
            {mounted && user && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">{user.fullName}</span>
                <div className="relative w-8 h-8 rounded-full overflow-hidden">
                  <Image
                    src={user.profileImage || ''}
                    alt={user.fullName}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            )}
            <nav className="text-sm">
              <Link href="/albums" className="text-gray-600 hover:text-gray-900">Albums</Link>
              <span className="text-gray-300 mx-2">|</span>
              <Link href="/gallery" className="text-gray-600 hover:text-gray-900">Gallery</Link>
              <span className="text-gray-300 mx-2">|</span>
              <button
                onClick={() => {
                  setUser(null)
                  router.push('/login')
                }}
                className="text-gray-600 hover:text-gray-900"
              >
                Sign Out
              </button>
            </nav>

          </div>
        </div>
      </div>
    </header>
  )
}
