"use client"

import Image from "next/image"
import type { Album } from "@/lib/types"

interface AlbumHeaderProps {
  album: Album
}

export function AlbumHeader({ album }: AlbumHeaderProps) {

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200">
      <div className="relative w-full max-w-[300px] mx-auto aspect-square">
        <Image
          src={album.coverImage || '/images/playlists/EmptyCover.png'}
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
  )
}
