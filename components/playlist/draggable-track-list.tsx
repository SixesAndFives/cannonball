'use client'

import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { DraggableTrackItem } from './draggable-track-item'
import type { PlaylistTrack } from '@/lib/types'

interface DraggableTrackListProps {
  tracks: PlaylistTrack[]
  onReorder?: (newOrder: { id: string; position: number }[]) => Promise<void>
  isEditing?: boolean
  onPlay?: (track: PlaylistTrack) => void
  currentTrackId?: string
}

export function DraggableTrackList({
  tracks,
  onReorder,
  isEditing = false,
  onPlay,
  currentTrackId,
}: DraggableTrackListProps) {
  const [items, setItems] = useState(tracks)
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id)
      const newIndex = items.findIndex((item) => item.id === over.id)

      const newItems = arrayMove(items, oldIndex, newIndex)
      setItems(newItems)

      // Create updated positions using playlist_track.id
      const updates = newItems.map((item, index) => ({
        id: item.id, // Use playlist_track.id directly
        position: index,
      }))

      // Call the onReorder callback if provided
      if (onReorder) {
        try {
          await onReorder(updates)
        } catch (error) {
          console.error('Error reordering tracks:', error)
          // Revert to original order on error
          setItems(tracks)
        }
      }
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        <div className="space-y-1">
          {items.map((track) => (
            <DraggableTrackItem
              key={track.id}
              track={track}
              isEditing={isEditing}
              onPlay={onPlay}
              isPlaying={track.id === currentTrackId}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
