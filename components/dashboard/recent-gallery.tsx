'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Film } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { getRecentGalleryItems } from '@/lib/services/dashboard-service'
import type { GalleryItem } from '@/lib/types'

export function RecentGallery() {
  const [items, setItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadGalleryItems() {
      const recentItems = await getRecentGalleryItems()
      setItems(recentItems)
      setLoading(false)
    }
    loadGalleryItems()
  }, [])

  if (loading) {
    return <div className="text-gray-500">Loading gallery items...</div>
  }

  if (items.length === 0) {
    return <div className="text-gray-500">No gallery items yet</div>
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {items.map((item) => (
        <Link
          key={item.id}
          href={`/gallery/${item.id}/edit`}
          className="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
        >
          {item.type === 'video' ? (
            <>
              {item.thumbnail_url ? (
                <Image
                  src={item.thumbnail_url}
                  alt={item.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                  <Film className="w-8 h-8 text-gray-400" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                <Film className="w-8 h-8 text-white" />
              </div>
            </>
          ) : (
            <Image
              src={item.url}
              alt={item.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <h3 className="text-white font-medium truncate">{item.title}</h3>
              <p className="text-gray-300 text-sm truncate">
                {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
