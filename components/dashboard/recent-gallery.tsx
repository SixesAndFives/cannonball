'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Film, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { getRecentGalleryItems } from '@/lib/services/dashboard-service'
import type { GalleryItem } from '@/lib/types'

export function RecentGallery() {
  const [items, setItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null)

  const openLightbox = (item: GalleryItem) => {
    setSelectedItem(item)
  }

  const closeLightbox = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setSelectedItem(null)
  }

  const navigateImage = (direction: "next" | "prev") => {
    if (!selectedItem) return

    const currentIndex = items.findIndex(item => item.id === selectedItem.id)
    let newIndex

    if (direction === "next") {
      newIndex = (currentIndex + 1) % items.length
    } else {
      newIndex = (currentIndex - 1 + items.length) % items.length
    }

    setSelectedItem(items[newIndex])
  }

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
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => openLightbox(item)}
            className="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
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
          {item.caption && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="text-white text-sm truncate">{item.caption}</p>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>

    {/* Lightbox */}
    {selectedItem && (
      <div
        className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
        onClick={closeLightbox}
      >
        <button
          className="absolute top-4 right-4 text-white hover:text-gray-300 z-50"
          onClick={closeLightbox}
        >
          <X size={24} />
        </button>

        <button
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 z-50"
          onClick={(e) => {
            e.stopPropagation()
            navigateImage("prev")
          }}
        >
          <ChevronLeft size={24} />
        </button>

        <button
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 z-50"
          onClick={(e) => {
            e.stopPropagation()
            navigateImage("next")
          }}
        >
          <ChevronRight size={24} />
        </button>

        <div
          className="relative max-w-7xl mx-auto px-4 w-full"
          onClick={(e) => e.stopPropagation()}
        >
          {selectedItem.type === 'video' ? (
            <video
              src={selectedItem.url}
              controls
              className="max-h-[80vh] mx-auto"
            />
          ) : (
            <div className="relative aspect-video">
              <Image
                src={selectedItem.url}
                alt={selectedItem.title || ''}
                fill
                className="object-contain"
              />
            </div>
          )}
          {selectedItem.caption && (
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-black bg-opacity-50 text-white">
              <p>{selectedItem.caption}</p>
            </div>
          )}
        </div>
      </div>
    )}
  </>
  )
}
