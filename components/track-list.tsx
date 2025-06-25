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
  albumId: string
  onUpdateTrack: (trackId: string, updatedTrack: Track) => Promise<void>
  onDeleteTrack: (trackId: string) => void
  onPlayTrack: (index: number) => void
  currentTrackIndex: number | null
}

export interface TrackListRef {
  playTrack: (index: number, autoPlay?: boolean) => void
}

export const TrackList = forwardRef<TrackListRef, TrackListProps>(function TrackList(
  { tracks, albumId, onUpdateTrack, onDeleteTrack, onPlayTrack, currentTrackIndex },
  ref
) {
  const [editingTrackId, setEditingTrackId] = useState<string | null>(null)
  const [editedTitle, setEditedTitle] = useState("")
  const [deleteTrackId, setDeleteTrackId] = useState<string | null>(null)
  const [addToPlaylistTrack, setAddToPlaylistTrack] = useState<Track | null>(null)
  const { isInFavorites, toggleFavorite } = useFavorites(albumId)

  const handleDeleteClick = async (trackId: string) => {
    try {
      console.log('Deleting track', { albumId, trackId })
      const response = await fetch('/api/delete-track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ albumId, trackId })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete track')
      }

      onDeleteTrack?.(trackId)
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
        onUpdateTrack(track.id, { ...track, title: editedTitle })
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
    playTrack: (index: number) => onPlayTrack(index)
  }))

  const handlePlayClick = (index: number) => {
    onPlayTrack(index)
  }

  const handleNextTrack = () => {
    if (currentTrackIndex === null || currentTrackIndex >= tracks.length - 1) {
      return
    }
    onPlayTrack(currentTrackIndex + 1)
  }

  const handlePreviousTrack = () => {
    if (currentTrackIndex === null || currentTrackIndex <= 0) {
      return
    }
    onPlayTrack(currentTrackIndex - 1)
  }

  return (
    <div className="track-list space-y-4">
      <div className="bg-white shadow rounded-lg divide-y">
        {tracks.map((track, index) => (
          <div
            key={`${track.id}-${index}`}
            className={cn(
              "flex items-center justify-between p-4 hover:bg-gray-50",
              currentTrackIndex === index && "bg-gray-50"
            )}
          >
            <div className="flex items-center gap-4 flex-1">
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
                <div className="flex items-center justify-between flex-1">
                  <span className="text-sm text-gray-900">{track.title}</span>
                  <div className="flex items-center gap-2">
                    {/* Admin actions - desktop only */}
                    <div className="hidden md:flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditClick(track)}
                        className="h-8 w-8 text-gray-600 hover:text-gray-700 hover:bg-gray-50"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteTrackId(track.id)}
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
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
                      variant={currentTrackIndex === index ? "default" : "ghost"}
                      size="icon"
                      onClick={() => handlePlayClick(index)}
                      data-track-index={index}
                      className="h-8 w-8 md:h-auto md:w-auto md:px-4"
                    >
                      {currentTrackIndex === index ? (
                        <>
                          <span className="hidden md:inline">Now Playing</span>
                          <Pause className="h-4 w-4 md:hidden" />
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 md:mr-2" />
                          <span className="hidden md:inline">Play Track</span>
                        </>
                      )}
                    </Button>
                    <span className="text-sm text-gray-500 w-16 text-right">{formatDuration(track.duration ? parseFloat(track.duration) : 0)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      <ConfirmDialog
        open={deleteTrackId !== null}
        onOpenChange={(open) => !open && setDeleteTrackId(null)}
        onConfirm={() => {
          if (deleteTrackId) {
            onDeleteTrack(deleteTrackId)
            setDeleteTrackId(null)
          }
        }}
        title="Delete Track"
        description="Are you sure you want to delete this track? This action cannot be undone."
      />
      {addToPlaylistTrack && (
        <AddToPlaylistDialog
          track={addToPlaylistTrack}
          isOpen={addToPlaylistTrack !== null}
          onClose={() => setAddToPlaylistTrack(null)}
        />
      )}
    </div>
  )
})
