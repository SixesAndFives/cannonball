'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Play, Pause } from 'lucide-react'
import type { PlaylistTrack } from '@/lib/types'

interface DraggableTrackItemProps {
  track: PlaylistTrack
  isEditing?: boolean
  onPlay?: (track: PlaylistTrack) => void
  isPlaying?: boolean
}

export function DraggableTrackItem({
  track,
  isEditing = false,
  onPlay,
  isPlaying = false,
}: DraggableTrackItemProps) {
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
      className={`group flex items-center gap-2 py-2.5 px-3 border-b border-gray-100 last:border-b-0 ${
        isDragging
          ? 'bg-gray-100/80 shadow-sm'
          : 'hover:bg-gray-50/80 transition-colors duration-200'
      }`}
    >
      {isEditing && (
        <button
          className="flex-shrink-0 text-gray-300 hover:text-gray-400 cursor-grab active:cursor-grabbing transition-colors duration-200"
          {...attributes}
          {...listeners}
        >
          <GripVertical size={18} />
        </button>
      )}
      
      <button
        onClick={() => onPlay?.(track)}
        className="flex items-center flex-grow min-w-0 group/play"
      >
        <div className="w-8 h-8 flex-shrink-0 relative flex items-center justify-center mr-3">
          {isPlaying ? (
            <Pause className="w-4 h-4 text-blue-600" />
          ) : (
            <Play className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-all duration-200" />
          )}
        </div>
        <div className="min-w-0 flex-grow flex items-center gap-x-4">
          <span className="text-sm text-gray-600 truncate">{track.title}</span>
          <span className="text-xs text-gray-400 whitespace-nowrap">{track.album_title}</span>
        </div>
      </button>
    </div>
  )
}
