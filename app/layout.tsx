import type { Metadata } from 'next'
import './globals.css'
import Link from 'next/link'
import { PlayerProvider } from '@/contexts/player-context'
import { AuthProvider } from '@/contexts/auth-context'
import { Toaster } from 'sonner'
import { Header } from '@/components/header'

export const metadata: Metadata = {
  title: 'v0 App',
  description: 'Created with v0',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
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
