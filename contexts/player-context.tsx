'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { FooterPlayer } from '@/components/footer-player'

interface Track {
  id: string
  title: string
  audioUrl: string
}

interface PlayerContextType {
  currentTrack: {
    track: Track | null
    albumId: string | null
    albumTitle: string | null
    coverImage: string | null
    trackIndex: number | null
  }
  playlist: Track[]
  playTrack: (track: Track, albumId: string, albumTitle: string, coverImage: string | null, trackIndex: number, playlist: Track[]) => void
  playNext: () => void
  playPrevious: () => void
  clearTrack: () => void
}

const PlayerContext = createContext<PlayerContextType | null>(null)

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<PlayerContextType['currentTrack']>({
    track: null,
    albumId: null,
    albumTitle: null,
    coverImage: null,
    trackIndex: null
  })
  const [playlist, setPlaylist] = useState<Track[]>([])

  const playTrack = (
    track: Track,
    albumId: string,
    albumTitle: string,
    coverImage: string | null,
    trackIndex: number,
    newPlaylist: Track[]
  ) => {
    setCurrentTrack({
      track,
      albumId,
      albumTitle,
      coverImage,
      trackIndex
    })
    setPlaylist(newPlaylist)
  }

  const playNext = () => {
    if (currentTrack.trackIndex === null || !playlist.length) return
    const nextIndex = currentTrack.trackIndex + 1
    if (nextIndex < playlist.length) {
      playTrack(
        playlist[nextIndex],
        currentTrack.albumId!,
        currentTrack.albumTitle!,
        currentTrack.coverImage,
        nextIndex,
        playlist
      )
    }
  }

  const playPrevious = () => {
    if (currentTrack.trackIndex === null || !playlist.length) return
    const prevIndex = currentTrack.trackIndex - 1
    if (prevIndex >= 0) {
      playTrack(
        playlist[prevIndex],
        currentTrack.albumId!,
        currentTrack.albumTitle!,
        currentTrack.coverImage,
        prevIndex,
        playlist
      )
    }
  }

  const clearTrack = () => {
    setCurrentTrack({
      track: null,
      albumId: null,
      albumTitle: null,
      coverImage: null,
      trackIndex: null
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
          src={currentTrack.track.audioUrl}
          title={currentTrack.track.title}
          albumTitle={currentTrack.albumTitle || ''}
          coverImage={currentTrack.coverImage || undefined}
          onNext={currentTrack.trackIndex !== null && currentTrack.trackIndex < playlist.length - 1 ? playNext : undefined}
          onPrevious={currentTrack.trackIndex !== null && currentTrack.trackIndex > 0 ? playPrevious : undefined}
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
