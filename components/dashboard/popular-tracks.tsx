'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatDuration } from '@/lib/format-duration'
import { getMostPlayedTracks } from '@/lib/services/track-service'
import type { Track } from '@/lib/types'

interface PopularTracksProps {
  onPlayTrack?: (track: Track) => void
}

export function PopularTracks({ onPlayTrack }: PopularTracksProps) {
  const [tracks, setTracks] = useState<Track[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadTracks() {
      const popularTracks = await getMostPlayedTracks(8)
      setTracks(popularTracks)
      setLoading(false)
    }
    loadTracks()
  }, [])

  if (loading) {
    return <div className="text-gray-500">Loading tracks...</div>
  }

  if (tracks.length === 0) {
    return <div className="text-gray-500">No tracks found</div>
  }

  return (
    <div className="space-y-4">
      {tracks.map((track) => (
        <div key={track.id} className="flex items-center gap-4 p-2 hover:bg-gray-50 rounded-lg group">
          <div className="flex-shrink-0">
            <Link href={`/albums/${track.album_id}`}>
              <Image
                src={track.cover_image || '/images/default-album.png'}
                alt={track.album_title || ''}
                width={48}
                height={48}
                className="rounded-md object-cover"
              />
            </Link>
          </div>
          <div className="flex-grow min-w-0">
            <div className="flex items-baseline justify-between gap-2">
              <div className="min-w-0">
                <h4 className="font-medium truncate">{track.title}</h4>
                <Link 
                  href={`/albums/${track.album_id}`}
                  className="text-sm text-gray-500 hover:text-gray-700 truncate block"
                >
                  {track.album_title}
                </Link>
              </div>
              <div className="flex items-center gap-4 flex-shrink-0">
                <span className="text-sm text-gray-500">{track.plays?.toLocaleString()} plays</span>
                {track.duration && (
                  <span className="text-sm text-gray-500">{formatDuration(track.duration)}</span>
                )}
              </div>
            </div>
          </div>
          {onPlayTrack && (
            <Button
              variant="ghost"
              size="icon"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => onPlayTrack(track)}
            >
              <Play className="h-4 w-4" />
            </Button>
          )}
        </div>
      ))}
    </div>
  )
}
