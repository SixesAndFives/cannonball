'use client'

import { useState, forwardRef, useImperativeHandle } from "react"
import { updateTrackTitle } from "@/lib/track-client"
import { Pencil, Play, Pause, Trash2, ListPlus, Heart } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AudioPlayer } from "@/components/audio-player"
import { cn } from "@/lib/utils"
import { formatDuration } from "@/lib/format-duration"
import type { Track } from "@/lib/types"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { AddToPlaylistDialog } from "@/components/add-to-playlist-dialog"
import { useFavorites } from "@/hooks/use-favorites"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface TrackListProps {
  tracks: Track[]
  album_id: string
  on_update_track: (trackId: string, updatedTrack: Track) => Promise<void>
  on_delete_track: (trackId: string) => void
  on_play_track: (index: number | null) => void
  current_track_index: number | null
}

export interface TrackListRef {
  playTrack: (index: number, autoPlay?: boolean) => void
}

export const TrackList = forwardRef<TrackListRef, TrackListProps>(function TrackList(
  { tracks, album_id, on_update_track, on_delete_track, on_play_track, current_track_index },
  ref
) {
  const [editingTrackId, setEditingTrackId] = useState<string | null>(null)
  const [editedTitle, setEditedTitle] = useState("")
  const [deleteTrackId, setDeleteTrackId] = useState<string | null>(null)
  const [addToPlaylistTrack, setAddToPlaylistTrack] = useState<Track | null>(null)
  const { isInFavorites, toggleFavorite } = useFavorites(album_id)

  const handleDeleteClick = async (trackId: string) => {
    try {
      console.log('Deleting track', { album_id, trackId })
      const response = await fetch('/api/delete-track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ album_id, trackId })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete track')
      }

      on_delete_track?.(trackId)
    } catch (error) {
      console.error('Error deleting track:', error)
      alert(error instanceof Error ? error.message : 'Failed to delete track')
    } finally {
      setDeleteTrackId(null)
    }
  }

  const handleEditClick = (track: Track) => {
    setEditingTrackId(track.id)
    setEditedTitle(track.title)
  }

  const handleSave = async (track: Track) => {
    try {
      const success = await updateTrackTitle(track.id, editedTitle)
      if (success) {
        on_update_track(track.id, { ...track, title: editedTitle })
        setEditingTrackId(null)
      } else {
        throw new Error('Failed to update track')
      }
    } catch (error) {
      console.error('Error updating track:', error)
      toast.error('Failed to update track title')
    }
  }

  const handleCancel = () => {
    setEditingTrackId(null)
    setEditedTitle("")
  }

  useImperativeHandle(ref, () => ({
    playTrack: (index: number) => on_play_track(index)
  }))

  const handlePlayClick = (index: number) => {
    on_play_track(index)
  }

  const handleClose = () => {
    on_play_track(null)
  }

  const handleNextTrack = () => {
    if (current_track_index === null || current_track_index >= tracks.length - 1) {
      return
    }
    on_play_track(current_track_index + 1)
  }

  const handlePreviousTrack = () => {
    if (current_track_index === null || current_track_index <= 0) {
      return
    }
    on_play_track(current_track_index - 1)
  }

  return (
    <div className="track-list space-y-4">
      <div className="bg-white shadow rounded-lg divide-y">
        {tracks.map((track, index) => (
          <div
            key={`${track.id}-${index}`}
            className={cn(
              "flex items-center justify-between p-4 hover:bg-gray-50",
              current_track_index === index && "bg-gray-50"
            )}
          >
            <div className="flex flex-col gap-2 flex-1">
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500 w-8 text-center">{index + 1}</span>
                {editingTrackId === track.id ? (
                  <div className="flex items-center gap-2 flex-1">
                    <Input
                      value={editedTitle}
                      onChange={(e) => setEditedTitle(e.target.value)}
                      className="flex-1"
                    />
                    <Button size="sm" onClick={() => handleSave(track)}>
                      Save
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleCancel}>
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <span className="text-sm text-gray-900 break-words flex-1">{track.title}</span>
                )}
              </div>
              <div className="flex items-center gap-2 justify-end pl-8">
                {/* Admin actions - desktop only */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditClick(track)}
                    className="h-8 w-8 text-gray-600 hover:text-gray-700 hover:bg-gray-50"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>

                {/* Always visible actions */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setAddToPlaylistTrack(track)}
                  className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                >
                  <ListPlus className="h-4 w-4" />
                </Button>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          console.log('Heart clicked for track:', track)
                          toggleFavorite(track)
                        }}
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Heart className={cn(
                          "h-4 w-4",
                          isInFavorites(track) && "fill-current"
                        )} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {isInFavorites(track) ? 'Remove from Favorites' : 'Add to Favorites'}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <Button
                  variant={current_track_index === index ? "default" : "ghost"}
                  size={current_track_index === index ? "default" : "icon"}
                  onClick={() => handlePlayClick(index)}
                  data-track-index={index}
                  className={cn(
                    "h-8",
                    current_track_index === index ? "w-auto px-3" : "w-8",
                    "md:h-auto md:w-auto md:px-4"
                  )}
                >
                  {current_track_index === index ? (
                    <>
                      <span>Playing</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 md:mr-2" />
                      <span className="hidden md:inline">Play Track</span>
                    </>
                  )}
                </Button>
                <span className="text-sm text-gray-500 w-16 text-right">{formatDuration(typeof track.duration === 'string' ? parseFloat(track.duration) : track.duration || 0)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <ConfirmDialog
        open={deleteTrackId !== null}
        onOpenChange={(open) => !open && setDeleteTrackId(null)}
        onConfirm={() => {
          if (deleteTrackId) {
            on_delete_track(deleteTrackId)
            setDeleteTrackId(null)
          }
        }}
        title="Delete Track"
        description="Are you sure you want to delete this track? This action cannot be undone."
      />
      {addToPlaylistTrack && (
        <AddToPlaylistDialog
          track={addToPlaylistTrack}
          isOpen={true}
          onClose={() => setAddToPlaylistTrack(null)}
        />
      )}
    </div>
  )
})
