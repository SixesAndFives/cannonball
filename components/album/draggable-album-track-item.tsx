'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Play, Pause } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatDuration } from '@/lib/format-duration'
import type { Track } from '@/lib/types'

interface DraggableAlbumTrackItemProps {
  track: Track
  isEditing?: boolean
  onPlay?: () => void
  isPlaying?: boolean
}

export function DraggableAlbumTrackItem({
  track,
  isEditing = false,
  onPlay,
  isPlaying = false,
}: DraggableAlbumTrackItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: track.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center space-x-2 rounded-md p-2 ${
        isDragging ? 'bg-accent' : 'hover:bg-accent'
      }`}
    >
      <div {...attributes} {...listeners} className="cursor-grab">
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onPlay?.()}
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>

          <div className="flex-1 truncate">
            <div className="font-medium truncate">{track.title}</div>
            <div className="text-sm text-muted-foreground">
              {formatDuration(track.duration || 0)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
