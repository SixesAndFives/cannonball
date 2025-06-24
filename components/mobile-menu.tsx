'use client'

import { useAuth } from '@/contexts/auth-context'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const { user } = useAuth()

  return (
    <div className="md:hidden">
      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-[998]" onClick={onClose} />
      )}

      {/* Menu panel */}
      {isOpen && (
        <div className="mobile-menu-panel fixed right-0 top-0 h-auto max-h-screen w-64 shadow-lg z-[999] overflow-y-auto rounded-l-lg">
          <div className="relative p-4">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-gray-600 hover:text-gray-900"
              aria-label="Close menu"
            >
              <X size={24} />
            </button>

            {user && (
              <div className="flex items-center gap-3 pb-4 mb-4 border-b">
                <div className="relative w-10 h-10 rounded-full overflow-hidden">
                  <Image
                    src={user.profileImage || ''}
                    alt={user.fullName}
                    fill
                    className="object-cover"
                  />
                </div>
                <span className="text-gray-900 font-medium">{user.fullName}</span>
              </div>
            )}

            <nav className="space-y-4">
              <Link
                href="/albums"
                className="block text-gray-600 hover:text-gray-900"
                onClick={onClose}
              >
                Albums
              </Link>
              <Link
                href="/playlists"
                className="block text-gray-600 hover:text-gray-900"
                onClick={onClose}
              >
                Playlists
              </Link>
              <Link
                href="/gallery"
                className="block text-gray-600 hover:text-gray-900"
                onClick={onClose}
              >
                Gallery
              </Link>
            </nav>
          </div>
        </div>
      )}
    </div>
  )
}
