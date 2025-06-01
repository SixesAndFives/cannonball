"use client"

import Image from "next/image"
import Link from "next/link"
import { Play, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Album } from "@/lib/types"
import { useRef, useState } from "react"

interface AlbumCardProps {
  album: Album
}

export function AlbumCard({ album }: AlbumCardProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [coverImage, setCoverImage] = useState(album.coverImage)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleCoverUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      console.log('No file selected')
      return
    }

    console.log('Selected file:', file.name)
    console.log('Album ID:', album.id)

    try {
      setIsUploading(true)
      const formData = new FormData()
      formData.append('file', file)
      formData.append('albumId', album.id)

      console.log('Uploading file...')
      const response = await fetch('/api/upload-cover', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()
      console.log('Upload response:', data)

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      setCoverImage(data.coverImage)
    } catch (error) {
      console.error('Error uploading cover:', error)
      alert(error instanceof Error ? error.message : 'Failed to upload cover image')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = '' // Reset file input
      }
    }
  }

  const handleButtonClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    console.log('Button clicked')
    fileInputRef.current?.click()
  }

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200 transition-shadow hover:shadow-md">
      <div className="relative aspect-square">
        <Image
          src={coverImage || "/placeholder.svg"}
          alt={album.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
        />
        <div className="absolute bottom-2 right-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleCoverUpload}
            disabled={isUploading}
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="bg-white/80 backdrop-blur-sm hover:bg-white/90"
            disabled={isUploading}
            onClick={handleButtonClick}
          >
            <Upload className="h-4 w-4 mr-1" />
            {isUploading ? 'Uploading...' : 'Upload Cover'}
          </Button>
        </div>
      </div>

      <div className="p-3">
        <h3 className="font-medium text-gray-900 truncate">{album.title}</h3>
        <p className="text-sm text-gray-500 mb-3">{album.year}</p>

        <div className="flex gap-2">
          <Button asChild className="flex-1 bg-gray-800 hover:bg-gray-700" size="sm">
            <Link href={`/play/${album.id}`}>
              <Play className="h-4 w-4 mr-1" />
              Play Now
            </Link>
          </Button>

          <Button asChild variant="outline" className="flex-1" size="sm">
            <Link href={`/albums/${album.id}`}>View More</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
