'use client'

import { useState, useEffect } from 'react'
import { ImageIcon, X } from 'lucide-react'
import Image from 'next/image'
import { GalleryGrid } from '@/components/gallery-grid'
import type { GalleryItem } from '@/lib/types'

interface AlbumGalleryProps {
  album_id: string
}

export function AlbumGallery({ album_id }: AlbumGalleryProps) {
  const [items, setItems] = useState<GalleryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null)

  // Function to load gallery items with retry for new uploads
  const loadGallery = async (isRetry = false) => {
    try {
      const response = await fetch(`/api/albums/${album_id}/gallery`)
      if (!response.ok) throw new Error('Failed to load gallery items')
      const items = await response.json()
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
  }, [album_id])

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
  }, [isLoading, album_id])

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

  const handleDelete = async (itemId: string) => {
    try {
      const response = await fetch(`/api/albums/${album_id}/gallery/${itemId}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) throw new Error('Failed to delete gallery item')
      
      // Update local state
      setItems(prevItems => prevItems.filter(item => item.id !== itemId))
    } catch (error) {
      console.error('Error deleting gallery item:', error)
      throw error
    }
  }

  return (
    <div>
      <GalleryGrid
        items={items}
        onItemDelete={handleDelete}
        onItemUpdate={async (itemId: string, updates: { caption?: string; taggedUsers?: string[] }) => {
          try {
            const response = await fetch(`/api/albums/${album_id}/gallery/${itemId}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                ...updates,
                tagged_users: updates.taggedUsers
              })
            })
            
            if (!response.ok) throw new Error('Failed to update gallery item')
            
            const updatedItem = await response.json()
            
            // Update local state with the response from the server
            setItems(prevItems =>
              prevItems.map(item =>
                item.id === itemId ? updatedItem : item
              )
            )
          } catch (error) {
            console.error('Failed to update gallery item:', error)
            // TODO: Add error toast
          }
        }}
        onItemSelect={setSelectedItem}
      />

      {selectedItem && (
        <div 
          className="fixed inset-0 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm z-50"
          onClick={(e) => {
            // Only close if clicking the backdrop
            if (e.target === e.currentTarget) setSelectedItem(null)
          }}
        >
          <div 
            className="relative max-w-[95vw] max-h-[95vh] bg-black rounded-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/75 transition-colors duration-200"
            >
              <X size={24} />
            </button>
            {selectedItem.type === 'image' ? (
              <div className="relative w-[90vw] h-[85vh]">
                <Image
                  src={selectedItem.url}
                  alt={selectedItem.caption || ''}
                  className="object-contain"
                  fill
                  sizes="90vw"
                  priority
                  quality={95}
                />
              </div>
            ) : (
              <video
                src={selectedItem.url}
                controls
                className="max-w-[90vw] max-h-[85vh] object-contain"
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}
