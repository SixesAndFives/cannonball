'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { toast } from 'sonner'
import type { Track, Playlist } from '@/lib/types'

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
      console.log('Fetching favorites for user:', user)
      const response = await fetch('/api/playlists')
      const data = await response.json()
      console.log('All playlists:', data)
      const userFavorites = data.find((p: Playlist) => 
        p.id === `${user?.id}-favorites` || p.id.endsWith('-favorites') && p.createdBy === user?.id
      )
      console.log('Found user favorites:', userFavorites)
      setFavorites(userFavorites || null)
    } catch (error) {
      console.error('Error fetching favorites:', error)
    } finally {
      setLoading(false)
    }
  }

  const isInFavorites = (track: Track) => {
    if (!favorites) {
      console.log('No favorites playlist found')
      return false
    }
    const isInFavs = favorites.tracks.some(t => t.id === track.id)
    console.log('isInFavorites:', { track, isInFavs, favoriteTracks: favorites.tracks })
    return isInFavs
  }

  const toggleFavorite = async (track: Track) => {
    console.log('toggleFavorite called with:', { track, user, favorites })
    if (!user || !favorites) {
      console.log('Early return due to:', { hasUser: !!user, hasFavorites: !!favorites })
      return
    }

    try {
      const isCurrentlyInFavorites = isInFavorites(track)
      
      const response = await fetch(
        isCurrentlyInFavorites 
          ? `/api/playlists/${favorites.id}/tracks/${track.id}`
          : `/api/playlists/${favorites.id}/tracks`,
        {
          method: isCurrentlyInFavorites ? 'DELETE' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: !isCurrentlyInFavorites ? JSON.stringify({ track }) : undefined
        }
      )

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
              duration: track.duration,
              audioUrl: track.audioUrl
            }]
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
