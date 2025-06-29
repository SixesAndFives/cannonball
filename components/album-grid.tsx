import type { Album } from "@/lib/types"
import { AlbumCard } from "./album-card"

interface AlbumGridProps {
  albums: Album[]
}

export function AlbumGrid({ albums }: AlbumGridProps) {
  console.log('=== AlbumGrid Component Render ===', {
    albumCount: albums.length,
    sampleAlbums: albums.slice(0, 2).map(a => ({
      id: a.id,
      title: a.title,
      year: a.year,
      trackCount: a.tracks.length
    })),
    time: new Date().toISOString(),
    environment: typeof window === 'undefined' ? 'server-side' : 'client-side'
  })

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {albums.map((album) => {
        console.log('Rendering album:', {
          id: album.id,
          title: album.title,
          trackCount: album.tracks.length,
          time: new Date().toISOString()
        })
        return <AlbumCard key={album.id} album={album} />
      })}
    </div>
  )
}
