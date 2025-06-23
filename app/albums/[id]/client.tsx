'use client'

import { useState, useTransition, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { FooterPlayer } from '@/components/footer-player'
import { TrackList } from '@/components/track-list'
import { usePlayer } from '@/contexts/player-context'
import { AlbumGallery } from "@/components/album-gallery"
import { AlbumHeader } from "@/components/album-header"
import { PersonnelList } from "@/components/personnel-list"
import { GalleryUploader } from "@/components/gallery-uploader"
import { CommentList } from "@/components/comment-list"
import { useToast } from "@/hooks/use-toast"
import { updateAlbum } from "@/lib/album-client"
import type { Album, Track, Comment, User } from "@/lib/types"

type UserWithoutPassword = Omit<User, 'password'>

interface AlbumDetailClientProps {
  initialAlbum: Album | null
  users: UserWithoutPassword[]
  currentUser: UserWithoutPassword | null
}

export function AlbumDetailClient({ initialAlbum, users, currentUser }: AlbumDetailClientProps) {
  const { toast } = useToast()
  const { setUser } = useAuth()
  const [album, setAlbum] = useState<Album | null>(initialAlbum)
  const [galleryKey, setGalleryKey] = useState(0)

  // Initialize auth context with server user
  useEffect(() => {
    if (currentUser) {
      setUser(currentUser)
    }
  }, [currentUser, setUser])

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
    <div className="container mx-auto py-6 space-y-8">
      <main className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6">
        <div className="space-y-6">
          <AlbumHeader album={album} />
          <PersonnelList 
            album={album}
            users={users}
            onUpdate={(userIds) => {
              const updatedAlbum = { ...album, personnel: userIds }
              startTransition(async () => {
                const success = await updateAlbum(album.id, updatedAlbum)
                if (success) {
                  setAlbum(updatedAlbum)
                  toast({
                    title: "Personnel updated",
                    description: "Album personnel has been updated successfully.",
                  })
                } else {
                  toast({
                    title: "Error",
                    description: "Failed to update personnel. Please try again.",
                    variant: "destructive",
                  })
                }
              })
            }}
          />
        </div>
        <div>
          <Tabs defaultValue="tracks" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="tracks" className="flex-1">
                Tracks
              </TabsTrigger>
              <TabsTrigger value="comments" className="flex-1">
                Comments
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
                    const tracksWithAlbumInfo = album.tracks
                      .filter(t => t.audioUrl)
                      .map(t => ({
                        id: t.id,
                        title: t.title,
                        audioUrl: t.audioUrl!,
                        albumId: album.id,
                        albumTitle: album.title,
                        coverImage: album.coverImage || null
                      }))

                    playTrack(
                      tracksWithAlbumInfo[index],
                      index,
                      tracksWithAlbumInfo
                    )
                  }
                }}
                currentTrackIndex={currentTrack.albumId === album.id ? currentTrack.trackIndex : null}
              />
            </TabsContent>

            <TabsContent value="comments" className="space-y-4">
              <CommentList
                albumId={album.id}
                comments={album.comments || []}
                onCommentAdded={(newComment: Comment) => {
                  setAlbum({
                    ...album,
                    comments: [...(album.comments || []), newComment]
                  })
                }}
                onCommentDeleted={(commentId: string) => {
                  setAlbum({
                    ...album,
                    comments: (album.comments || []).filter(c => c.id !== commentId)
                  })
                }}
              />
            </TabsContent>

            <TabsContent value="gallery" className="space-y-6">
              <GalleryUploader 
                albumId={album.id}
                users={users}
                userId={currentUser?.id || ''}
                onSuccess={() => {
                  // Force gallery to refresh by remounting it with a key
                  setGalleryKey(prev => prev + 1)
                }}
              />
              <AlbumGallery key={galleryKey} albumId={album.id} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
