import type { Album } from "@/lib/types"
import { AlbumCard } from "./album-card"

interface AlbumGridProps {
  albums: Album[]
}

export function AlbumGrid({ albums }: AlbumGridProps) {
  // Group albums by year
  const albumsByYear = albums.reduce((acc, album) => {
    const year = album.year || 'Unknown'
    if (!acc[year]) {
      acc[year] = []
    }
    acc[year].push(album)
    return acc
  }, {} as Record<string, Album[]>)

  // Sort years in descending order
  const sortedYears = Object.keys(albumsByYear)
    .sort((a, b) => {
      if (a === 'Unknown') return 1
      if (b === 'Unknown') return -1
      return parseInt(b) - parseInt(a)
    })

  // Sort albums within each year by title
  sortedYears.forEach(year => {
    albumsByYear[year].sort((a, b) => 
      a.title.toLowerCase().localeCompare(b.title.toLowerCase())
    )
  })

  return (
    <div className="space-y-6">
      {sortedYears.map(year => (
        <div key={year} className="space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 px-1">{year}</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3">
            {albumsByYear[year].map((album) => (
              <AlbumCard key={album.id} album={album} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
