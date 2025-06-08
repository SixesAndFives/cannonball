'use client'

import { useState, useTransition } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { FooterPlayer } from '@/components/footer-player'
import { TrackList } from '@/components/track-list'
import { usePlayer } from '@/contexts/player-context'
import { AlbumGallery } from "@/components/album-gallery"
import { AlbumHeader } from "@/components/album-header"
import { useToast } from "@/hooks/use-toast"
import { updateAlbum } from "@/lib/album-client"
import type { Album, Track } from "@/lib/types"

export function AlbumDetailClient({ initialAlbum }: { initialAlbum: Album | null }) {
  const { toast } = useToast()
  const [album, setAlbum] = useState<Album | null>(initialAlbum)
  const [isEditingNotes, setIsEditingNotes] = useState(false)
  const [editedNotes, setEditedNotes] = useState(initialAlbum?.notes || "")
  const [isPending, startTransition] = useTransition()
  const { playTrack, currentTrack } = usePlayer()
  const currentTrackIndex = currentTrack.trackIndex

  const handleDeleteTrack = (trackId: string) => {
    if (!album) return

    const updatedAlbum = {
      ...album,
      tracks: album.tracks.filter(track => track.id !== trackId)
    }
    setAlbum(updatedAlbum)
  }

  const handleSaveNotes = () => {
    if (!album) return

    const updatedAlbum = { ...album, notes: editedNotes }
    startTransition(async () => {
      const success = await updateAlbum(album.id, updatedAlbum)
      if (success) {
        setAlbum(updatedAlbum)
        setIsEditingNotes(false)
        toast({
          title: "Notes saved",
          description: "Your album notes have been updated.",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to save notes. Please try again.",
          variant: "destructive",
        })
      }
    })
  }

  const handleUpdateAlbum = async (updatedAlbum: Album) => {
    startTransition(async () => {
      const success = await updateAlbum(updatedAlbum.id, updatedAlbum)
      if (success) {
        setAlbum(updatedAlbum)
        toast({
          title: "Album updated",
          description: "Album details have been saved successfully.",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to update album. Please try again.",
          variant: "destructive",
        })
      }
    })
  }

  const handleUpdateTrack = async (trackId: string, updatedTrack: Track) => {
    if (!album) return

    const updatedTracks = album.tracks.map(track => 
      track.id === trackId ? updatedTrack : track
    )

    const updatedAlbum = { ...album, tracks: updatedTracks }
    startTransition(async () => {
      const success = await updateAlbum(album.id, updatedAlbum)
      if (success) {
        setAlbum(updatedAlbum)
        toast({
          title: "Track updated",
          description: "Track name has been saved successfully.",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to update track. Please try again.",
          variant: "destructive",
        })
      }
    })
  }

  const handleCancelEditNotes = () => {
    if (!album) return
    setEditedNotes(album.notes || "")
    setIsEditingNotes(false)
  }

  const handleDownloadAlbum = () => {
    toast({
      title: "Download started",
      description: "The full album is being downloaded.",
    })
  }

  if (!album) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Album Not Found</h1>
          <p className="text-gray-600 mb-4">The album you're looking for doesn't exist.</p>
          <Button asChild>
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-24">
      <header className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="block">
              <h1 className="text-2xl font-semibold text-gray-900">Cannonball</h1>
              <p className="text-sm text-gray-500">Private Music Archive</p>
            </Link>
            <nav className="space-x-4 text-sm">
              <Link href="/" className="text-gray-600 hover:text-gray-900">Home</Link>
              <span className="text-gray-300">|</span>
              <Link href="/" className="text-gray-600 hover:text-gray-900">Albums</Link>
              <span className="text-gray-300">|</span>
              <Link href="/gallery" className="text-gray-600 hover:text-gray-900">Gallery</Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto py-6 space-y-8">
        <main className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6">
          <div>
            <AlbumHeader
              album={album}
              onUpdate={handleUpdateAlbum}
            />
          </div>
          <div>
            <Tabs defaultValue="tracks" className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="tracks" className="flex-1">
                  Tracks
                </TabsTrigger>
                <TabsTrigger value="notes" className="flex-1">
                  Notes
                </TabsTrigger>
                <TabsTrigger value="gallery" className="flex-1">
                  Gallery
                </TabsTrigger>
              </TabsList>

              <TabsContent value="tracks" className="space-y-4">
                <TrackList
                  tracks={album.tracks}
                  albumId={album.id}
                  onUpdateTrack={handleUpdateTrack}
                  onDeleteTrack={handleDeleteTrack}
                  onPlayTrack={(index) => {
                    const track = album.tracks[index]
                    if (track.audioUrl) {
                      playTrack(
                        { ...track, audioUrl: track.audioUrl },
                        album.id,
                        album.title,
                        album.coverImage || null,
                        index,
                        album.tracks.filter(t => t.audioUrl).map(t => ({ ...t, audioUrl: t.audioUrl! }))
                      )
                    }
                  }}
                  currentTrackIndex={currentTrack.albumId === album.id ? currentTrack.trackIndex : null}
                />
              </TabsContent>

              <TabsContent value="notes" className="space-y-4">
                <div className="space-y-4">
                  {isEditingNotes ? (
                    <div className="space-y-4">
                      <Textarea
                        value={editedNotes}
                        onChange={(e) => setEditedNotes(e.target.value)}
                        className="min-h-[200px]"
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={handleSaveNotes}
                          disabled={isPending}
                        >
                          Save Notes
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsEditingNotes(false)
                            setEditedNotes(album.notes || "")
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="prose max-w-none">
                        {album.notes ? (
                          <div
                            dangerouslySetInnerHTML={{
                              __html: album.notes.replace(/\n/g, "<br />"),
                            }}
                          />
                        ) : (
                          <p className="text-gray-500 italic">
                            No notes available
                          </p>
                        )}
                      </div>
                      <Button onClick={() => setIsEditingNotes(true)}>
                        Edit Notes
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="gallery" className="space-y-4">
                <AlbumGallery images={album.gallery || []} />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>

      {/* FooterPlayer is now rendered by PlayerProvider */}
    </div>
  )
}
