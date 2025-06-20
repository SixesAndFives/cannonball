'use client'

import { getAllGalleryItems } from '@/lib/gallery-client'
import { Header } from '@/components/header'
import { Film, X } from 'lucide-react'
import Image from 'next/image'
import type { GalleryItem } from '@/lib/types'
import { useEffect, useState } from 'react'

export default function GalleryPage() {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([])
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null)

  useEffect(() => {
    getAllGalleryItems().then(setGalleryItems)
  }, [])

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-6">
        <div className="mt-8">
        <h2 className="text-xl font-medium text-gray-800 mb-4">Gallery</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleryItems.map((item) => (
            <div 
              key={item.id} 
              className="aspect-video relative overflow-hidden rounded-lg shadow-md cursor-pointer bg-gray-100" 
              onClick={() => setSelectedItem(item)}
            >
              {item.type === 'image' ? (
                <Image
                  src={item.url}
                  alt={item.caption || ''}
                  className="object-cover"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              ) : (
                <div className="relative w-full h-full bg-black">
                  <Image
                    src={item.thumbnailUrl || item.url}
                    alt={item.caption || ''}
                    className="object-contain"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    quality={90}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Film className="w-8 h-8 text-white opacity-75" />
                  </div>
                </div>
              )}
              {item.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2">
                  <p className="text-sm">{item.caption}</p>
                </div>
              )}
            </div>
          ))}
        </div>
        </div>
      </main>

      <dialog
        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 p-4 backdrop-blur-sm"
        open={!!selectedItem}
        onClick={() => setSelectedItem(null)}
      >
        {selectedItem && (
          <div className="relative max-w-[95vw] max-h-[95vh] bg-black rounded-lg overflow-hidden">
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-2 right-2 z-10 p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-75"
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
                />
              </div>
            ) : (
              <div className="relative w-[90vw] h-[85vh] flex items-center justify-center">
                <video
                  src={selectedItem.url}
                  controls
                  autoPlay
                  className="max-w-full max-h-full w-auto h-auto"
                />
              </div>
            )}
          </div>
        )}
      </dialog>
    </>
  )
}
