'use client'

import { useState, useTransition } from "react"
import Link from "next/link"
import { ArrowLeft, Download, Edit, Plus, Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { AlbumHeader } from "@/components/album-header"
import { TrackList } from "@/components/track-list"
import { AlbumGallery } from "@/components/album-gallery"
import { useToast } from "@/hooks/use-toast"
import { updateAlbum } from "@/lib/album-client"
import type { Album, Track } from "@/lib/types"

export function AlbumDetailClient({ initialAlbum }: { initialAlbum: Album | null }) {
  const { toast } = useToast()
  const [album, setAlbum] = useState<Album | null>(initialAlbum)
  const [isEditingNotes, setIsEditingNotes] = useState(false)
  const [editedNotes, setEditedNotes] = useState(initialAlbum?.notes || "")
  const [isPending, startTransition] = useTransition()

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
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/">
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back to home</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{album.title}</h1>
            <p className="text-sm text-gray-500">
              {album.year ? `Released in ${album.year}` : "Release date unknown"}
            </p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Tabs defaultValue="tracks" className="space-y-4">
              <TabsList>
                <TabsTrigger value="tracks">Tracks</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
                <TabsTrigger value="gallery">Gallery</TabsTrigger>
              </TabsList>

              <TabsContent value="tracks" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-medium text-gray-800">Tracks</h2>
                  <Button onClick={handleDownloadAlbum}>
                    <Download className="h-4 w-4 mr-1" />
                    Download All
                  </Button>
                </div>
                <TrackList
                  tracks={album.tracks}
                  albumId={album.id}
                  onUpdateTrack={handleUpdateTrack}
                  onDeleteTrack={handleDeleteTrack}
                />
              </TabsContent>

              <TabsContent value="notes" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-medium text-gray-800">Notes</h2>
                  {!isEditingNotes ? (
                    <Button onClick={() => setIsEditingNotes(true)} disabled={isPending}>
                      <Edit className="h-4 w-4 mr-1" />
                      Edit Notes
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button onClick={handleSaveNotes} disabled={isPending}>
                        <Save className="h-4 w-4 mr-1" />
                        Save
                      </Button>
                      <Button variant="outline" onClick={handleCancelEditNotes} disabled={isPending}>
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>

                {isEditingNotes ? (
                  <Textarea
                    value={editedNotes}
                    onChange={(e) => setEditedNotes(e.target.value)}
                    className="min-h-[200px]"
                    placeholder="Add notes about this album..."
                    disabled={isPending}
                  />
                ) : (
                  <div className="prose max-w-none">
                    {album.notes ? (
                      <div className="whitespace-pre-wrap">{album.notes}</div>
                    ) : (
                      <p className="text-gray-500 italic">No notes available.</p>
                    )}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="gallery" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-medium text-gray-800">Gallery</h2>
                  <Button>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Photos
                  </Button>
                </div>
                <AlbumGallery images={album.gallery || []} />
              </TabsContent>
            </Tabs>
          </div>

          <div>
            <AlbumHeader 
              album={album} 
              onUpdate={handleUpdateAlbum}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
