"use client"

import Image from "next/image"
import { useState } from "react"
import { Button } from "./ui/button"
import { PencilIcon } from "lucide-react"
import { AlbumEditor } from "./album-editor"
import type { Album } from "@/lib/types"

interface AlbumHeaderProps {
  album: Album
  onUpdate: (updates: { title?: string; cover_image?: File; year?: string }) => Promise<void>
}

export function AlbumHeader({ album, onUpdate }: AlbumHeaderProps) {
  const [isEditing, setIsEditing] = useState(false)

  return (
    <>
      <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200">
        <div className="relative w-full max-w-[300px] mx-auto aspect-square group">
          <Button
            variant="secondary"
            size="icon"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
            onClick={() => setIsEditing(true)}
          >
            <PencilIcon className="h-4 w-4" />
          </Button>
          <Image
            src={album.cover_image || '/images/playlists/EmptyCover.png'}
            alt={album.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 300px"
            className="object-cover"
            onError={(e) => {
              if (e.target instanceof HTMLImageElement) {
                e.target.src = '/images/playlists/EmptyCover.png';
              }
            }}
          />
        </div>
        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-gray-900 text-center">{album.title}</h2>
            {album.year && (
              <p className="text-gray-600 text-center">{album.year}</p>
            )}
          </div>
        </div>
      </div>

      <AlbumEditor
        album={album}
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        onSave={onUpdate}
      />
    </>
  )
}
