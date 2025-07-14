'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { getRecentAlbums } from '@/lib/services/dashboard-service'
import type { Album } from '@/lib/types'

export function RecentAlbums() {
  const [albums, setAlbums] = useState<Album[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadAlbums() {
      const recentAlbums = await getRecentAlbums()
      setAlbums(recentAlbums)
      setLoading(false)
    }
    loadAlbums()
  }, [])

  if (loading) {
    return <div className="text-gray-500">Loading albums...</div>
  }

  if (albums.length === 0) {
    return <div className="text-gray-500">No albums yet</div>
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {albums.map((album) => (
        <Link 
          key={album.id}
          href={`/albums/${album.id}`}
          className="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
        >
          <Image
            src={album.cover_image || '/images/default-album.png'}
            alt={album.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <h3 className="text-white font-medium truncate">{album.title}</h3>
              <p className="text-gray-300 text-sm truncate">{album.year}</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
