import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cannonball Archive',
  description: 'Music archive for Cannonball - you have reached the center of the universe',
  manifest: '/manifest.json',
  themeColor: '#eff6ff',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Cannonball',
  },
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
