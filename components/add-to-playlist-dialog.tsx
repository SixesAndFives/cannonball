'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/contexts/auth-context'
import type { Track, Playlist } from '@/lib/types'

interface AddToPlaylistDialogProps {
  track: Track | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddToPlaylistDialog({ track, open, onOpenChange }: AddToPlaylistDialogProps) {
  const { user } = useAuth()
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [loading, setLoading] = useState(true)
  const [newPlaylistTitle, setNewPlaylistTitle] = useState('')
  const [creating, setCreating] = useState(false)
  // toast is imported from sonner

  useEffect(() => {
    if (open) {
      fetchPlaylists()
    }
  }, [open])

  const fetchPlaylists = async () => {
    if (!user) return
    try {
      const response = await fetch('/api/playlists')
      const data = await response.json()
      // Show all non-favorites playlists plus user's own favorites
      const filteredPlaylists = data.filter((p: Playlist) => {
        const isFavorites = p.id.endsWith('-favorites')
        // If it's not a favorites playlist, show it
        if (!isFavorites) return true
        // If it is a favorites playlist, only show if it belongs to the current user
        return p.user_id === user.id
      })
      setPlaylists(filteredPlaylists)
    } catch (error) {
      console.error('Error fetching playlists:', error)
      toast.error('Failed to load playlists')
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePlaylist = async () => {
    if (!newPlaylistTitle.trim() || !user) return

    setCreating(true)
    try {
      // First create the playlist
      const formData = new FormData()
      formData.append('title', newPlaylistTitle.trim())
      formData.append('user_id', user.id)

      console.log('Creating playlist with:', {
        title: newPlaylistTitle.trim(),
        user_id: user.id
      })

      const createResponse = await fetch('/api/playlists', {
        method: 'POST',
        body: formData
      })

      if (!createResponse.ok) {
        throw new Error('Failed to create playlist')
      }

      const newPlaylist = await createResponse.json()

      // Then add the track to the new playlist
      if (track) {
        const addTrackResponse = await fetch(`/api/playlists/${newPlaylist.id}/tracks`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ track })
        })

        if (!addTrackResponse.ok) {
          throw new Error('Failed to add track to playlist')
        }
      }

      setPlaylists([...playlists, newPlaylist])
      setNewPlaylistTitle('')
      onOpenChange(false)
      toast.success(`Created playlist "${newPlaylistTitle}" and added track`)
    } catch (error) {
      console.error('Error creating playlist:', error)
      toast.error('Failed to create playlist')
    } finally {
      setCreating(false)
    }
  }

  const normalizeTrack = (track: Track) => ({
    id: track.id,
    title: track.title,
    audio_url: track.audio_url,
    duration: track.duration,
    album_id: track.album_id,
    album_title: track.album_title,
    cover_image: track.cover_image
  })

  const handleAddToPlaylist = async (playlistId: string) => {
    if (!user || !track) return

    try {
      const response = await fetch(`/api/playlists/${playlistId}/tracks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ track })
      })

      const data = await response.json()
      
      if (!response.ok) {
        // Check for specific error about duplicate track
        if (response.status === 400 && data.error === 'Track already exists in playlist') {
          toast.error(`This track is already in the playlist`)
          return
        }
        throw new Error(data.error || 'Failed to add track to playlist')
      }

      if (track) {
        toast.success(`Added "${track.title}" to playlist`)
      }
      onOpenChange(false)
    } catch (error) {
      console.error('Error adding track to playlist:', error)
      toast.error('Failed to add track to playlist')
    }
  }

  return open ? (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-auto" aria-describedby="playlist-dialog-description">
        <DialogHeader>
          <DialogTitle>Add to Playlist</DialogTitle>
          <p id="playlist-dialog-description" className="text-sm text-gray-500">
            Choose a playlist or create a new one to add this track.
          </p>
        </DialogHeader>
        
        <div className="flex items-center gap-2 mb-4">
          <Input
            placeholder="Create new playlist"
            value={newPlaylistTitle}
            onChange={(e) => setNewPlaylistTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreatePlaylist()}
          />
          <Button
            onClick={handleCreatePlaylist}
            disabled={!newPlaylistTitle.trim() || creating}
          >
            Create
          </Button>
        </div>

        <Separator className="my-4" />
        
        <ScrollArea className="max-h-[300px] pr-4">
          <div className="space-y-2">
            {loading ? (
              <div className="text-sm text-gray-500">Loading playlists...</div>
            ) : playlists.length === 0 ? (
              <div className="text-sm text-gray-500">No playlists found</div>
            ) : (
              playlists.map((playlist) => (
                <Button
                  key={playlist.id}
                  variant="ghost"
                  className="w-full justify-start gap-2 text-left"
                  onClick={() => handleAddToPlaylist(playlist.id)}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={playlist.cover_image || '/images/playlists/EmptyCover.png'}
                      alt={playlist.title}
                      className="h-10 w-10 object-cover rounded"
                      onError={(e) => {
                        const img = e.target as HTMLImageElement
                        img.src = '/images/playlists/EmptyCover.png'
                      }}
                    />
                    <span>
                      {playlist.id.endsWith('-favorites')
                        ? `${user?.full_name}'s Favorites`
                        : playlist.title
                      }
                    </span>
                  </div>
                </Button>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  ) : null
}
