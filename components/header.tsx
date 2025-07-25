'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useAuth } from '@/contexts/auth-context'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Menu } from 'lucide-react'

export function Header({ onOpenMenu }: { onOpenMenu: () => void }) {
  const { user, setUser } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)

  // Mount effect
  useEffect(() => {
    console.log('=== Header Component Mount ===', {
      time: new Date().toISOString(),
      mounted: false,
      hasUser: !!user,
      user: user ? {
        id: user.id,
        full_name: user.full_name,
        profile_image: user.profile_image,
      } : null
    })
    setMounted(true)
    setAuthChecked(true)
  }, [])

  // Auth check effect
  useEffect(() => {
    if (!authChecked) return

    // pathname from hook at top level
    console.log('🔒 AUTH CHECK', {
      time: new Date().toISOString(),
      hasUser: !!user,
      pathname,
      shouldRedirect: !user && pathname !== '/',
      authChecked
    })

    if (!user && pathname !== '/') {
      console.log('🔒 REDIRECTING TO HOME', {
        time: new Date().toISOString(),
        from: pathname
      })
      router.replace('/')
    }
  }, [user, router, authChecked, pathname])

  useEffect(() => {
    console.log('=== Header User Update ===', {
      time: new Date().toISOString(),
      mounted,
      hasUser: !!user,
      user: user ? {
        id: user.id,
        full_name: user.full_name,
        profile_image: user.profile_image,
      } : null
    })
  }, [user, mounted])

  return (
    <header className="border-b border-blue-200 bg-blue-50/95 backdrop-blur-md sticky top-0 z-50">
      <div className="flex w-full items-center py-3">
        <div className="flex-1">
          <div className="max-w-[1400px] w-full mx-auto px-4 flex items-center justify-between">
            <div>
              <div className="flex sm:flex-row flex-col sm:items-center gap-2">
                <span className="text-2xl font-bold">CANNONBALL</span>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 hidden sm:inline">-</span>
                  <span className="italic font-normal text-gray-700 text-sm sm:text-base sm:inline">you have reached the center of the universe</span>
                </div>
              </div>
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
                          src={user.profile_image || '/images/default-avatar.png'}
                          alt={user.full_name}
                          width={32}
                          height={32}
                          className="object-cover"
                          onError={() => {
                            console.log('=== Header Profile Image Error ===', {
                              time: new Date().toISOString(),
                              userId: user.id,
                              profileImage: user.profile_image,
                              fallback: '/images/default-avatar.png'
                            })
                          }}
                          onLoad={() => {
                            console.log('=== Header Profile Image Load Success ===', {
                              time: new Date().toISOString(),
                              userId: user.id,
                              profileImage: user.profile_image || '/images/default-avatar.png'
                            })
                          }}
                        />
                      </div>
                      <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 cursor-pointer z-10 relative">{user.full_name}</Link>
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
                <Link href="/comments" className="text-gray-600 hover:text-gray-900">
                  Comments
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
