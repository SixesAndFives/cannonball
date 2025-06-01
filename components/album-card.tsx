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


  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200 transition-shadow hover:shadow-md">
      <div className="relative aspect-square">
        <Image
          src={album.coverImage || '/images/placeholder-album.jpg'}
          alt={album.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
          // Images are now local, so we can use Next.js optimization
        />

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
