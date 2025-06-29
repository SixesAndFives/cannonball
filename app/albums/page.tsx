import { AlbumGrid } from "@/components/album-grid"
import { getAllAlbums } from "@/lib/album-service"
import { headers } from 'next/headers'

// Force dynamic rendering and disable caching
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AlbumsPage() {
  // Get headers and await the Promise
  const requestHeaders = await headers()
  
  console.log('=== Albums Page Request ===', {
    time: new Date().toISOString(),
    environment: typeof window === 'undefined' ? 'server-side' : 'client-side',
    nodeEnv: process.env.NODE_ENV,
    host: requestHeaders.get('host') || 'unknown',
    userAgent: (requestHeaders.get('user-agent') || 'unknown').substring(0, 50) + '...',
    cache: requestHeaders.get('cache-control') || 'none',
    stage: 'start'
  })

  console.log('=== Fetching albums from service ===', {
    time: new Date().toISOString(),
    stage: 'pre-fetch'
  })

  const albums = await getAllAlbums();
  
  console.log('=== Albums data received ===', {
    count: albums.length,
    sampleAlbums: albums.slice(0, 2).map(a => ({
      id: a.id,
      title: a.title,
      year: a.year,
      trackCount: a.tracks.length
    })),
    time: new Date().toISOString(),
    stage: 'post-fetch'
  })

  console.log('=== Rendering Albums Page ===', {
    time: new Date().toISOString(),
    stage: 'pre-render'
  })

  const page = (
    <main className="container mx-auto px-4 py-4">
      <AlbumGrid albums={albums} />
    </main>
  )

  console.log('=== Albums Page Complete ===', {
    time: new Date().toISOString(),
    stage: 'complete'
  })

  return page
}
