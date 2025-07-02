import { AlbumGrid } from "@/components/album-grid"
import { getAllAlbums } from "@/lib/album-service"
import { headers } from 'next/headers'

// Force dynamic rendering and disable caching
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AlbumsPage() {
  try {
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

    console.log('=== Calling getAllAlbums ===', {
      time: new Date().toISOString(),
      stage: 'pre-fetch'
    })

    const albums = await getAllAlbums();
    
    console.log('=== Albums data received ===', {
      time: new Date().toISOString(),
      count: albums.length,
      firstAlbum: albums[0] ? { id: albums[0].id, title: albums[0].title } : null,
      hasData: albums.length > 0,
      stage: 'data-received'
    })

    console.log('=== Albums data sample ===', {
      time: new Date().toISOString(),
      sampleAlbums: albums.slice(0, 2).map(a => ({
        id: a.id,
        title: a.title,
        year: a.year,
        trackCount: a.tracks.length
      })),
      stage: 'post-fetch'
    })

    console.log('=== Rendering Albums Page ===', {
      time: new Date().toISOString(),
      stage: 'pre-render'
    })

    return (
      <div className="min-h-screen bg-gray-50 pb-24">
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-7xl mx-auto">
            <AlbumGrid albums={albums} />
          </div>
        </main>
      </div>
    )
  } catch (error) {
    console.error('Error in AlbumsPage:', {
      error,
      time: new Date().toISOString(),
      stage: 'error'
    })
    return (
      <div className="min-h-screen bg-gray-50 pb-24">
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-7xl mx-auto text-center text-red-600">
            Error loading albums. Please try again.
          </div>
        </main>
      </div>
    )
  }
}
