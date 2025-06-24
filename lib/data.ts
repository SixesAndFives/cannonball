import type { Album, Track, GalleryItem, Comment } from "./types"
import albumsData from './albums.json'

type RawAlbum = {
  id?: string
  originalAlbumName?: string
  title?: string
  year?: number
  coverImage?: string
  notes?: string
  tracks: Array<{
    id: string
    title: string
    duration: number
    audioUrl: string
    artist?: string
    album?: string
    year?: number
    trackNumber?: number
    genre?: string
    comment?: string
    composer?: string
    bitrate?: number
    sampleRate?: number
    channels?: number
    lossless?: boolean
  }>
  gallery?: GalleryItem[]
  comments?: Comment[]
  personnel?: string[]
}

// Map the albums from our JSON file to match the UI's expectations
export const albums: Album[] = (albumsData.albums as RawAlbum[]).map(album => {
  // Handle both old and new album formats
  const id = album.id || album.originalAlbumName?.toLowerCase().replace(/\s+/g, '-') || ''
  const title = album.title || album.originalAlbumName || ''
  const originalAlbumName = album.originalAlbumName || album.title || ''

  // Map tracks to our Track type
  const tracks: Track[] = album.tracks.map((track: any) => ({
    id: track.id,
    title: track.title,
    duration: track.duration,
    audioUrl: track.audioUrl,
    artist: track.artist,
    album: track.album,
    year: track.year,
    trackNumber: track.trackNumber,
    genre: track.genre,
    comment: track.comment,
    composer: track.composer,
    bitrate: track.bitrate,
    sampleRate: track.sampleRate,
    channels: track.channels,
    lossless: track.lossless
  }))

  return {
    id,
    originalAlbumName,
    title,
    year: album.year,
    coverImage: album.coverImage,
    notes: album.notes,
    tracks,
    gallery: album.gallery,
    comments: album.comments || [],
    personnel: album.personnel || []
  }
})
