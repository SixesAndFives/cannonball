'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { FooterPlayer } from '@/components/footer-player'
import { Track } from '@/lib/types'

interface PlayerContextType {
  currentTrack: {
    track: Track | null
    album_id: string | null
    album_title: string | null
    cover_image: string | null
    track_index: number | null
  }
  playlist: Track[]
  playTrack: (track: Track, track_index: number, playlist: Track[]) => void
  playNext: () => void
  playPrevious: () => void
  clearTrack: () => void
}

const PlayerContext = createContext<PlayerContextType | null>(null)

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<PlayerContextType['currentTrack']>({
    track: null,
    album_id: null,
    album_title: null,
    cover_image: null,
    track_index: null
  })
  const [playlist, setPlaylist] = useState<Track[]>([])

  const playTrack = (
    track: Track,
    track_index: number,
    newPlaylist: Track[]
  ) => {
    setCurrentTrack({
      track,
      album_id: track.album_id || null,
      album_title: track.album_title || null,
      cover_image: track.cover_image || null,
      track_index
    })
    setPlaylist(newPlaylist)
  }

  const playNext = () => {
    if (currentTrack.track_index === null || !playlist.length) return
    const nextIndex = currentTrack.track_index + 1
    if (nextIndex < playlist.length) {
      playTrack(
        playlist[nextIndex],
        nextIndex,
        playlist
      )
    }
  }

  const playPrevious = () => {
    if (currentTrack.track_index === null || !playlist.length) return
    const prevIndex = currentTrack.track_index - 1
    if (prevIndex >= 0) {
      playTrack(
        playlist[prevIndex],
        prevIndex,
        playlist
      )
    }
  }

  const clearTrack = () => {
    setCurrentTrack({
      track: null,
      album_id: null,
      album_title: null,
      cover_image: null,
      track_index: null
    })
    setPlaylist([])
  }

  return (
    <PlayerContext.Provider value={{
      currentTrack,
      playlist,
      playTrack,
      playNext,
      playPrevious,
      clearTrack
    }}>
      {children}
      {currentTrack.track && (
        <FooterPlayer
          src={currentTrack.track.audio_url}
          title={currentTrack.track.title}
          album_title={currentTrack.album_title || ''}
          cover_image={currentTrack.cover_image || undefined}
          onNext={currentTrack.track_index !== null && currentTrack.track_index < playlist.length - 1 ? playNext : undefined}
          onClose={clearTrack}
          onPrevious={currentTrack.track_index !== null && currentTrack.track_index > 0 ? playPrevious : undefined}
          autoPlay={true}
        />
      )}
    </PlayerContext.Provider>
  )
}

export function usePlayer() {
  const context = useContext(PlayerContext)
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider')
  }
  return context
}
