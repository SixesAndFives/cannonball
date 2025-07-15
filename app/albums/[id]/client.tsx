'use client'

import { useState, useTransition, useEffect, useRef } from "react"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FooterPlayer } from '@/components/footer-player'
import { TrackListDndWrapper } from "@/components/track-list-dnd-wrapper"
import type { TrackListRef } from "@/components/track-list"
import { usePlayer } from '@/contexts/player-context'
import { AlbumGallery } from "@/components/album-gallery"
import { useRouter } from 'next/navigation'
import { AlbumHeader } from "@/components/album-header"
import { PersonnelList } from "@/components/personnel-list"
import { GalleryUploader } from "@/components/gallery-uploader"
import { CommentList } from "@/components/comment-list"
import { useToast } from "@/hooks/use-toast"
import { updateAlbum } from "@/lib/album-client"
import type { Album, Track, Comment, User } from "@/lib/types"

type UserWithoutPassword = Omit<User, 'password'>

interface AlbumDetailClientProps {
  initial_album: Album | null
  users: UserWithoutPassword[]
  current_user: UserWithoutPassword | null
}

export function AlbumDetailClient({ initial_album, users, current_user }: AlbumDetailClientProps) {
  const { toast } = useToast()
  const { user, setUser } = useAuth()
  const [album, setAlbum] = useState<Album | null>(initial_album)
  const [galleryKey, setGalleryKey] = useState(0)
  const router = useRouter()



  // Initialize auth context with server user only if not already set
  useEffect(() => {
    if (!current_user) {
      setUser(current_user)
    }
  }, [current_user, setUser, user])

  const [isPending, startTransition] = useTransition()
  const { playTrack, currentTrack } = usePlayer()
  const currentTrackIndex = currentTrack.track_index
  const trackListRef = useRef<TrackListRef>(null)

  const handlePlayTrack = (index: number | null) => {
    if (!album || index === null) return;
    const track = album.tracks[index]
    if (track?.audio_url) {
      const tracksWithAlbumInfo = album.tracks
        .filter(t => t.audio_url)
        .map(t => ({
          ...t,
          album_id: album.id,
          album_title: album.title,
          cover_image: album.cover_image
        }))
      playTrack(tracksWithAlbumInfo[index], index, tracksWithAlbumInfo)
    }
  }

  const handleReorder = async (updates: { id: string; position: number }[]) => {
    if (!album) return;
    
    console.log('=== Client Reorder Request ===');
    console.log('Album ID:', album.id);
    console.log('Updates:', updates);

    try {
      const response = await fetch(`/api/albums/${album.id}/reorder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })

      if (!response.ok) {
        throw new Error('Failed to update track order')
      }

      // Update local state
      setAlbum(prev => {
        if (!prev) return prev;

        // Create a new array with updated positions
        const updatedTracks = prev.tracks.map(track => {
          const update = updates.find(u => u.id === track.id)
          return update ? { ...track, position: update.position } : track
        })

        // Sort by position
        updatedTracks.sort((a, b) => (a.position ?? 0) - (b.position ?? 0))

        return {
          ...prev,
          tracks: updatedTracks
        }
      })

      toast({ title: 'Track order updated successfully' })
    } catch (error) {
      console.error('Error updating track order:', error)
      toast({ title: 'Failed to update track order', variant: 'destructive' })
    }
  }

  const handleDeleteTrack = async (trackId: string) => {
    if (!album) return
    console.log('CLIENT - Deleting track:', { album_id: album.id, trackId })

    try {
      const response = await fetch('/api/delete-track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ album_id: album.id, trackId })
      })

      const data = await response.json()
      console.log('CLIENT - Delete track response:', data)

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete track')
      }

      // Update local state only after successful deletion
      const updatedAlbum = {
        ...album,
        tracks: album.tracks.filter(track => track.id !== trackId)
      }
      setAlbum(updatedAlbum)
      
      toast({
        title: 'Track deleted',
        description: 'The track has been removed successfully.'
      })
    } catch (error) {
      console.error('CLIENT - Error deleting track:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete track',
        variant: 'destructive'
      })
    }
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
          <Button
            variant="outline"
            onClick={() => router.push(`/albums/${album.id}/edit`)}
          >
            Edit Album
          </Button>
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
              <TrackListDndWrapper
                ref={trackListRef}
                tracks={album.tracks}
                album_id={album.id}
                on_update_track={handleUpdateTrack}
                on_delete_track={handleDeleteTrack}
                on_play_track={handlePlayTrack}
                current_track_index={currentTrackIndex}
                onReorder={handleReorder}
              />
            </TabsContent>

            <TabsContent value="comments" className="space-y-4">
              <CommentList
                album_id={album.id}
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
                album_id={album.id}
                users={users}
                userId={current_user?.id || ''}
                onSuccess={() => {
                  // Force gallery to refresh by remounting it with a key
                  setGalleryKey(prev => prev + 1)
                }}
              />
              <AlbumGallery key={galleryKey} album_id={album.id} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
