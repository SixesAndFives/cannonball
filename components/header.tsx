'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Menu } from 'lucide-react'

export function Header({ onOpenMenu }: { onOpenMenu: () => void }) {
  const { user, setUser } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <header className="border-b border-blue-200 bg-blue-50/95 backdrop-blur-md sticky top-0 z-50">
      <div className="flex w-full items-center py-3">
        <div className="flex-1">
          <div className="max-w-[1400px] w-full mx-auto px-4 flex items-center justify-between">
            <div>
              <Link href="/" className="text-2xl tracking-wider hover:text-gray-700 flex items-center gap-2">
                <span className="font-bold">CANNONBALL</span>
                <span className="text-gray-600 hidden sm:inline">-</span>
                <span className="italic font-normal text-gray-700 text-base hidden sm:inline">you have reached the center of the universe</span>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              {/* Mobile menu button */}
              <button
                onClick={onOpenMenu}
                className="p-2 text-gray-600 hover:text-gray-900 md:hidden"
                aria-label="Open menu"
              >
                <Menu size={24} />
              </button>

              {/* Desktop Navigation */}
              <nav className="text-sm items-center gap-2 hidden md:flex">
                {mounted && user && (
                  <>
                    <div className="flex items-center gap-2">
                      <div className="relative w-8 h-8 rounded-full overflow-hidden">
                        <Image
                          src={user.profileImage || ''}
                          alt={user.fullName}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <span className="text-gray-600 hover:text-gray-900">{user.fullName}</span>
                    </div>
                    <span className="text-gray-300">|</span>
                  </>
                )}
                <Link href="/albums" className="text-gray-600 hover:text-gray-900">
                  Albums
                </Link>
                <span className="text-gray-300">|</span>
                <Link href="/playlists" className="text-gray-600 hover:text-gray-900">
                  Playlists
                </Link>
                <span className="text-gray-300">|</span>
                <Link href="/gallery" className="text-gray-600 hover:text-gray-900">
                  Gallery
                </Link>
                <span className="text-gray-300">|</span>
                <button
                  onClick={() => {
                    setUser(null)
                    router.push('/')
                  }}
                  className="text-gray-600 hover:text-gray-900"
                >
                  Logout
                </button>
                <button
                  onClick={onOpenMenu}
                  className="p-2 text-gray-600 hover:text-gray-900 md:hidden"
                  aria-label="Open menu"
                >
                  <Menu size={24} />
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
