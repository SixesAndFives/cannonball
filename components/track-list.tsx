'use client'

import { useState, forwardRef, useImperativeHandle } from "react"
import { Pencil, Play, Pause, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AudioPlayer } from "@/components/audio-player"
import { cn } from "@/lib/utils"
import { formatDuration } from "@/lib/format-duration"
import type { Track } from "@/lib/types"
import { ConfirmDialog } from "@/components/confirm-dialog"

interface TrackListProps {
  tracks: Track[]
  albumId: string
  onUpdateTrack?: (trackId: string, updatedTrack: Track) => void
  onDeleteTrack?: (trackId: string) => void
}

export interface TrackListRef {
  playTrack: (index: number, autoPlay?: boolean) => void
}

export const TrackList = forwardRef<TrackListRef, TrackListProps>(function TrackList(
  { tracks, albumId, onUpdateTrack, onDeleteTrack },
  ref
) {
  const [editingTrackId, setEditingTrackId] = useState<string | null>(null)
  const [editedTitle, setEditedTitle] = useState("")
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number | null>(null)
  const [deleteTrackId, setDeleteTrackId] = useState<string | null>(null)

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

  const handleSave = (track: Track) => {
    if (!onUpdateTrack) return
    onUpdateTrack(track.id, { ...track, title: editedTitle })
    setEditingTrackId(null)
  }

  const handleCancel = () => {
    setEditingTrackId(null)
    setEditedTitle("")
  }

  const playTrack = (index: number, autoPlay: boolean = false) => {
    if (index === currentTrackIndex && !autoPlay) {
      setCurrentTrackIndex(null)
    } else {
      setCurrentTrackIndex(index)
    }
  }

  // Expose playTrack method via ref
  useImperativeHandle(ref, () => ({
    playTrack
  }))

  const handlePlayTrack = (index: number, autoPlay: boolean = false) => {
    if (index === currentTrackIndex && !autoPlay) {
      setCurrentTrackIndex(null)
    } else {
      setCurrentTrackIndex(index)
    }
  }

  const handleNextTrack = () => {
    if (currentTrackIndex === null || currentTrackIndex >= tracks.length - 1) return
    setCurrentTrackIndex(currentTrackIndex + 1)
  }

  const handlePreviousTrack = () => {
    if (currentTrackIndex === null || currentTrackIndex <= 0) return
    setCurrentTrackIndex(currentTrackIndex - 1)
  }

  return (
    <div className="track-list space-y-4">
      {currentTrackIndex !== null && tracks[currentTrackIndex]?.audioUrl && (
        <div className="sticky top-4 z-10">
          <AudioPlayer
            src={tracks[currentTrackIndex].audioUrl}
            title={tracks[currentTrackIndex].title}
            onNext={currentTrackIndex < tracks.length - 1 ? handleNextTrack : undefined}
            onPrevious={currentTrackIndex > 0 ? handlePreviousTrack : undefined}
            autoPlay={true}
          />
        </div>
      )}

      <div className="bg-white shadow rounded-lg divide-y">
        {tracks.map((track, index) => (
          <div
            key={track.id}
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
                  <div className="flex items-center gap-2">
                    {onUpdateTrack && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditClick(track)}
                          className="h-8 w-8"
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
                      </>
                    )}
                    <span className="text-sm text-gray-900">{track.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={currentTrackIndex === index ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePlayTrack(index, true)}
                      data-track-index={index}
                    >
                      {currentTrackIndex === index ? (
                        "Now Playing"
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Play Track
                        </>
                      )}
                    </Button>
                    <span className="text-sm text-gray-500 w-16 text-right">{formatDuration(track.duration)}</span>
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
        onConfirm={() => deleteTrackId && handleDeleteClick(deleteTrackId)}
        title="Delete Track"
        description="Are you sure you want to delete this track? This action cannot be undone."
      />
    </div>
  )
})
