'use client'

import { useState } from "react"
import { Pencil, Play, Pause } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AudioPlayer } from "@/components/audio-player"
import { cn } from "@/lib/utils"
import type { Track } from "@/lib/types"

interface TrackListProps {
  tracks: Track[]
  onUpdateTrack?: (trackId: string, updatedTrack: Track) => void
}

export function TrackList({ tracks, onUpdateTrack }: TrackListProps) {
  const [editingTrackId, setEditingTrackId] = useState<string | null>(null)
  const [editedTitle, setEditedTitle] = useState("")
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number | null>(null)

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

  const handlePlayTrack = (index: number) => {
    setCurrentTrackIndex(index === currentTrackIndex ? null : index)
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
    <div className="space-y-4">
      {currentTrackIndex !== null && tracks[currentTrackIndex]?.audioUrl && (
        <div className="sticky top-4 z-10">
          <AudioPlayer
            src={tracks[currentTrackIndex].audioUrl}
            title={tracks[currentTrackIndex].title}
            onNext={currentTrackIndex < tracks.length - 1 ? handleNextTrack : undefined}
            onPrevious={currentTrackIndex > 0 ? handlePreviousTrack : undefined}
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
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditClick(track)}
                        className="h-8 w-8"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}
                    <span className="text-sm text-gray-900">{track.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePlayTrack(index)}
                    >
                      {currentTrackIndex === index ? (
                        <>
                          <Pause className="h-4 w-4 mr-2" />
                          Pause Track
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Play Track
                        </>
                      )}
                    </Button>
                    <span className="text-sm text-gray-500">{track.duration}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
