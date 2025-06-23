'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import type { Track, Playlist } from '@/lib/types'

interface AddToPlaylistDialogProps {
  track: Track
  isOpen: boolean
  onClose: () => void
}

export function AddToPlaylistDialog({ track, isOpen, onClose }: AddToPlaylistDialogProps) {
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [loading, setLoading] = useState(true)
  const [newPlaylistTitle, setNewPlaylistTitle] = useState('')
  const [creating, setCreating] = useState(false)
  // toast is imported from sonner

  useEffect(() => {
    if (isOpen) {
      fetchPlaylists()
    }
  }, [isOpen])

  const fetchPlaylists = async () => {
    try {
      const response = await fetch('/api/playlists')
      const data = await response.json()
      setPlaylists(data)
    } catch (error) {
      console.error('Error fetching playlists:', error)
      toast({
        title: 'Error',
        description: 'Failed to load playlists',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePlaylist = async () => {
    if (!newPlaylistTitle.trim()) return

    setCreating(true)
    try {
      // Create the playlist
      const createResponse = await fetch('/api/playlists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newPlaylistTitle.trim(),
          tracks: [track]
        }),
      })

      if (!createResponse.ok) {
        throw new Error('Failed to create playlist')
      }

      const newPlaylist = await createResponse.json()
      setPlaylists([...playlists, newPlaylist])
      setNewPlaylistTitle('')
      
      toast.success(`Created playlist "${newPlaylistTitle}" and added track`)
      onClose()
    } catch (error) {
      console.error('Error creating playlist:', error)
      toast.error('Failed to create playlist')
    } finally {
      setCreating(false)
    }
  }

  const handleAddToPlaylist = async (playlistId: string) => {
    try {
      const response = await fetch(`/api/playlists/${playlistId}/tracks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ track }),
      })

      if (!response.ok) {
        throw new Error('Failed to add track to playlist')
      }

      toast.success(`Added "${track.title}" to playlist`)
      onClose()
    } catch (error) {
      console.error('Error adding track to playlist:', error)
      toast.error('Failed to add track to playlist')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add to Playlist</DialogTitle>
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
                    {playlist.coverImage ? (
                      <img
                        src={playlist.coverImage}
                        alt={playlist.title}
                        className="h-10 w-10 object-cover rounded"
                      />
                    ) : (
                      <div className="h-10 w-10 bg-gray-100 rounded flex items-center justify-center">
                        <span className="text-gray-400">🎵</span>
                      </div>
                    )}
                    <span>{playlist.title}</span>
                  </div>
                </Button>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
