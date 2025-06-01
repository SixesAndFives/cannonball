"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { GalleryItem } from "@/lib/types"

interface AlbumGalleryProps {
  images: GalleryItem[]
}

export function AlbumGallery({ images }: AlbumGalleryProps) {
  if (images.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No gallery images available
      </div>
    )
  }

  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null)

  const openLightbox = (image: GalleryItem) => {
    setSelectedImage(image)
  }

  const closeLightbox = () => {
    setSelectedImage(null)
  }

  const navigateImage = (direction: "next" | "prev") => {
    if (!selectedImage) return

    const currentIndex = images.findIndex((img) => img.id === selectedImage.id)
    let newIndex

    if (direction === "next") {
      newIndex = (currentIndex + 1) % images.length
    } else {
      newIndex = (currentIndex - 1 + images.length) % images.length
    }

    setSelectedImage(images[newIndex])
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((image) => (
          <div
            key={image.id}
            className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 cursor-pointer"
            onClick={() => openLightbox(image)}
          >
            <Image
              src={image.url}
              alt={image.caption}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover hover:scale-105 transition-transform duration-300"
            />
            {image.caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2 text-sm">
                {image.caption}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white hover:bg-gray-800"
            onClick={closeLightbox}
          >
            <X className="h-6 w-6" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-gray-800"
            onClick={() => navigateImage("prev")}
          >
            <ChevronLeft className="h-8 w-8" />
          </Button>

          <div className="relative h-[80vh] w-full max-w-4xl">
            <Image
              src={selectedImage.url}
              alt={selectedImage.caption}
              fill
              sizes="80vw"
              className="object-contain"
            />
            {selectedImage.caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white p-4 text-center">
                {selectedImage.caption}
              </div>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-gray-800"
            onClick={() => navigateImage("next")}
          >
            <ChevronRight className="h-8 w-8" />
          </Button>
        </div>
      )}
    </>
  )
}
