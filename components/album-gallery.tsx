'use client'

import * as React from 'react'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ImageIcon, Film, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { getAlbumGallery } from '@/lib/gallery-client'
import type { GalleryItem } from "@/lib/types"

interface AlbumGalleryProps {
  albumId: string
}

export function AlbumGallery({ albumId }: AlbumGalleryProps) {
  const [items, setItems] = useState<GalleryItem[]>([])
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Function to load gallery items with retry for new uploads
  const loadGallery = async (isRetry = false) => {
    try {
      const items = await getAlbumGallery(albumId)
      setItems(items)
      
      // If this is a retry and we got items, we can stop retrying
      if (isRetry) {
        setIsLoading(false)
      }
    } catch (error) {
      console.error('Error loading gallery:', error)
      setIsLoading(false)
    }
  }

  // Initial load
  useEffect(() => {
    setIsLoading(true)
    loadGallery()
  }, [albumId])

  // Retry mechanism for new uploads
  useEffect(() => {
    if (!isLoading) return

    // Try up to 3 times with 1 second delay
    let retryCount = 0
    const maxRetries = 3
    
    const retryTimer = setInterval(() => {
      if (retryCount >= maxRetries) {
        clearInterval(retryTimer)
        setIsLoading(false)
        return
      }
      
      retryCount++
      loadGallery(true)
    }, 1000)

    return () => clearInterval(retryTimer)
  }, [isLoading])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <ImageIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-600">No photos or videos yet</p>
      </div>
    )
  }

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

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="group relative aspect-square cursor-pointer overflow-hidden rounded-lg bg-gray-100"
            onClick={() => openLightbox(item)}
          >
            {item.type === 'video' ? (
              <div className="relative h-full w-full">
                <video
                  src={item.url}
                  className="h-full w-full object-cover"
                />
                <Film className="absolute inset-0 m-auto w-8 h-8 text-white opacity-75" />
              </div>
            ) : (
              <Image
                src={item.url}
                alt={item.caption || item.title || 'Gallery image'}
                fill
                className="object-cover transition-transform group-hover:scale-105"
              />
            )}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4 opacity-0 transition-opacity group-hover:opacity-100">
              <p className="text-sm text-white truncate">{item.title}</p>
            </div>
          </div>
        ))}
      </div>

      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={closeLightbox}
        >
          <div 
            className="relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-lg bg-white flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative flex-1 min-h-0">
              {selectedItem.type === 'video' ? (
                <video
                  src={selectedItem.url}
                  controls
                  className="w-full h-full object-contain"
                />
              ) : (
                <Image
                  src={selectedItem.url}
                  alt={selectedItem.caption || selectedItem.title || 'Gallery image'}
                  width={1200}
                  height={800}
                  className="w-full h-full object-contain"
                />
              )}
            </div>
            <div className="p-4 bg-white border-t">
              <h3 className="text-lg font-semibold">{selectedItem.title}</h3>
              {selectedItem.caption && (
                <p className="text-gray-600 mt-1">{selectedItem.caption}</p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-900"
              onClick={closeLightbox}
            >
              <X className="h-6 w-6" />
            </Button>



            <div className="absolute top-1/2 -translate-y-1/2 left-4">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-black/20"
                onClick={() => navigateImage("prev")}
              >
                <ChevronLeft className="h-8 w-8" />
              </Button>
            </div>

            <div className="absolute top-1/2 -translate-y-1/2 right-4">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-black/20"
                onClick={() => navigateImage("next")}
              >
                <ChevronRight className="h-8 w-8" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
