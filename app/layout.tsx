import type { Metadata } from 'next'
import './globals.css'
import { PlayerProvider } from '@/contexts/player-context'

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
        <PlayerProvider>
          {children}
        </PlayerProvider>
      </body>
    </html>
  )
}
