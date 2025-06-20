'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Button } from './ui/button'

export function Header() {
  const router = useRouter()
  const { user, setUser } = useAuth()

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="block">
              <h1 className="text-2xl font-semibold text-gray-900">Cannonball</h1>
              <p className="text-sm text-gray-500">Private Music Archive</p>
            </Link>
            <nav className="space-x-4 text-sm">
              <Link href="/albums" className="text-gray-600 hover:text-gray-900">Albums</Link>
              <span className="text-gray-300">|</span>
              <Link href="/gallery" className="text-gray-600 hover:text-gray-900">Gallery</Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            {user && (
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
            <Button 
              variant="ghost" 
              onClick={() => {
                setUser(null)
                router.push('/')
              }}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
