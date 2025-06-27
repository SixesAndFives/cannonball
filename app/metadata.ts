import { Metadata, Viewport } from 'next'

export const viewport: Viewport = {
  themeColor: '#eff6ff'
}

export const metadata: Metadata = {
  title: 'Cannonball Archive',
  description: 'Music archive for Cannonball - you have reached the center of the universe',

  icons: {
    icon: '/icons/favicon.ico',
    shortcut: '/icons/favicon.ico',
    apple: '/icons/apple-touch-icon.png',
    other: [
      {
        rel: 'icon',
        url: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        rel: 'icon',
        url: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      }
    ]
  }
}
