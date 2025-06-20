import type { Metadata } from 'next'
import './globals.css'
import Link from 'next/link'
import { PlayerProvider } from '@/contexts/player-context'
import { AuthProvider } from '@/contexts/auth-context'
import { Toaster } from 'sonner'
import { Header } from '@/components/header'

export const metadata: Metadata = {
  title: 'Cannonball Archive',
  description: 'Music archive for Cannonball'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/images/logo.jpg" />
        <link rel="shortcut icon" href="/images/logo.jpg" />
      </head>
      <body>
        <AuthProvider>
          <PlayerProvider>
            {children}
          </PlayerProvider>
          <Toaster position="top-center" />
        </AuthProvider>
      </body>
    </html>
  )
}
