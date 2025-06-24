'use client'

import { useState } from 'react'
import { Header } from './header'
import { MobileMenu } from './mobile-menu'

export function ClientWrapper({ children }: { children: React.ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <>
      <Header onOpenMenu={() => setIsMenuOpen(true)} />
      <MobileMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      {children}
    </>
  )
}
