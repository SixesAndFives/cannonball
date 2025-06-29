import './globals.css'
import Link from 'next/link'
import { PlayerProvider } from '@/contexts/player-context'
import { AuthProvider } from '@/contexts/auth-context'
import { Toaster } from 'sonner'
import { ClientWrapper } from '@/components/client-wrapper'
import { metadata } from './metadata'

export { metadata }

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head />
      <body>
        <AuthProvider>
          <PlayerProvider>
            <ClientWrapper>
              {children}
            </ClientWrapper>
          </PlayerProvider>
          <Toaster position="top-center" />
        </AuthProvider>
      </body>
    </html>
  )
}
