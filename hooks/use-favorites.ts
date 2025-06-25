'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { toast } from 'sonner'
import type { Track, Playlist, PlaylistTrack } from '@/lib/types'

export function useFavorites(albumId: string) {
  const { user } = useAuth()
  const [favorites, setFavorites] = useState<Playlist | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchFavorites()
    }
  }, [user])

  const fetchFavorites = async () => {
    try {
      const response = await fetch('/api/playlists')
      const data = await response.json()
      // Find favorites playlist by username (e.g. 'daniel-favorites')
      console.log('Searching for favorites playlist with user:', user?.userName);
      const userFavorites = data.find((p: Playlist) => {
        if (!user?.userName) {
          console.log('No username found in user object');
          return false;
        }
        // Check both formats: 'dminton-favorites' and 'daniel-favorites'
        const shortNameId = `${user.userName.toLowerCase()}-favorites`;
        const fullNameId = `${user.fullName?.split(' ')[0].toLowerCase()}-favorites`;
        const found = p.id === shortNameId || p.id === fullNameId;
        console.log('Checking playlist:', { 
          playlistId: p.id, 
          shortNameId, 
          fullNameId,
          found 
        });
        return found;
      })
      setFavorites(userFavorites || null)
    } catch (error) {
      console.error('Error fetching favorites:', error)
    } finally {
      setLoading(false)
    }
  }

  const isInFavorites = (track: Track) => {
    if (!favorites) return false
    return favorites.tracks.some(t => t.id === track.id)
  }

  const toggleFavorite = async (track: Track) => {
    console.log('toggleFavorite called with:', { track, user, favorites })
    if (!user) {
      console.log('Early return - no user found in auth context')
      return
    }
    if (!favorites) {
      console.log('Early return - no favorites playlist found. User:', user.userName)
      return
    }

    try {
      const isCurrentlyInFavorites = isInFavorites(track)
      console.log('Track favorite status:', { isCurrentlyInFavorites, trackId: track.id })
      
      // Construct the URL for the request
      const baseUrl = `/api/playlists/${favorites.id}/tracks`
      const deleteUrl = `${baseUrl}/${encodeURIComponent(track.id)}`
      const url = isCurrentlyInFavorites ? deleteUrl : baseUrl
      
      console.log('Making request:', {
        url,
        baseUrl,
        deleteUrl,
        method: isCurrentlyInFavorites ? 'DELETE' : 'POST',
        playlistId: favorites.id,
        trackId: track.id,
        trackIdEncoded: encodeURIComponent(track.id)
      })

      console.log('Sending request with config:', {
        method: isCurrentlyInFavorites ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        hasBody: !isCurrentlyInFavorites
      })

      const response = await fetch(url, {
        method: isCurrentlyInFavorites ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: !isCurrentlyInFavorites ? JSON.stringify({ track }) : undefined
      })

      const data = await response.json()
      console.log('Response:', { status: response.status, data })

      if (!response.ok) throw new Error()

      // Update local state
      // Update local state optimistically
      setFavorites(prev => {
        if (!prev) return null
        const updatedTracks = isCurrentlyInFavorites
          ? prev.tracks.filter(t => t.id !== track.id)
          : [...prev.tracks, { 
              id: track.id,
              title: track.title,
              duration: typeof track.duration === 'string' ? parseInt(track.duration, 10) : (track.duration || 0),
              audio_url: track.audio_url,
              album_id: track.album_id,
              album_title: track.album_title || document.title.split(' | ')[0] // Get album title from page title
            } as PlaylistTrack]
        return {
          ...prev,
          tracks: updatedTracks
        }
      })

      toast.success(
        isCurrentlyInFavorites ? 'Removed from Favorites' : 'Added to Favorites',
        {
          description: `${track.title} has been ${isCurrentlyInFavorites ? 'removed from' : 'added to'} your favorites.`
        }
      )

    } catch (error) {
      console.error('Error toggling favorite:', error)
      toast.error('Failed to update favorites', {
        description: 'Please try again.'
      })
    }
  }

  return {
    favorites,
    loading,
    isInFavorites,
    toggleFavorite
  }
}
