'use client'

import { useState, useEffect } from 'react'
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
import type { Track } from '@/lib/types'
import { TrackList, TrackListRef } from './track-list'
import { forwardRef } from 'react'

interface TrackListDndWrapperProps {
  tracks: Track[]
  album_id: string
  on_update_track: (trackId: string, updatedTrack: Track) => Promise<void>
  on_delete_track: (trackId: string) => void
  on_play_track: (index: number | null) => void
  current_track_index: number | null
  onReorder?: (updates: { id: string; position: number }[]) => Promise<void>
}

export const TrackListDndWrapper = forwardRef<TrackListRef, TrackListDndWrapperProps>(function TrackListDndWrapper(
  { tracks, onReorder, ...props },
  ref
) {
  // Sort tracks by position
  const sortedTracks = [...tracks].sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
  const [items, setItems] = useState(sortedTracks)
  const itemIds = items.map(item => item.id)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    console.log('=== Drag End Event ===');
    console.log('Active:', active);
    console.log('Over:', over);

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id)
      const newIndex = items.findIndex((item) => item.id === over.id)

      const newItems = arrayMove(items, oldIndex, newIndex)
      setItems(newItems)

      console.log('Old Index:', oldIndex);
      console.log('New Index:', newIndex);
      console.log('New Items:', newItems.map(item => ({ id: item.id, title: item.title })));

      if (onReorder) {
        const updates = newItems.map((item, index) => {
          console.log(`Setting position ${index} for track ${item.id} (${item.title})`);
          return {
            id: item.id,
            position: index,
          };
        })

        try {
          await onReorder(updates)
        } catch (error) {
          console.error('Error reordering tracks:', error)
          setItems(tracks) // Revert on error
        }
      }
    }
  }

  useEffect(() => {
    // Always keep tracks sorted by position
    const sortedTracks = [...tracks].sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
    setItems(sortedTracks)
  }, [tracks])

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
        <TrackList
          ref={ref}
          tracks={items}
          onReorder={onReorder}
          {...props}
        />
      </SortableContext>
    </DndContext>
  )
})

export default TrackListDndWrapper
