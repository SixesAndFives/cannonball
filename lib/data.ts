import type { Album, Track, GalleryItem, Comment } from "./types"
import albumsData from './albums.json'

type RawAlbum = {
  id?: string
  original_album_name?: string
  title?: string
  year?: number
  cover_image?: string
  notes?: string
  tracks: Array<{
    id: string
    title: string
    duration: number
    audio_url: string
    artist?: string
    album?: string
    year?: number
    track_number?: number
    genre?: string
    comment?: string
    composer?: string
    bitrate?: number
    sample_rate?: number
    channels?: number
    lossless?: boolean
  }>
  gallery?: GalleryItem[]
  comments?: Comment[]
  personnel?: string[]
}

// Map the albums from our JSON file to match the UI's expectations
export const albums: Album[] = (albumsData.albums as unknown as RawAlbum[]).map(album => {
  // Handle both old and new album formats
  const id = album.id || album.original_album_name?.toLowerCase().replace(/\s+/g, '-') || ''
  const title = album.title || album.original_album_name || ''
  const original_album_name = album.original_album_name || album.title || ''

  // Map tracks to our Track type
  const tracks: Track[] = album.tracks.map((track: any) => ({
    id: track.id,
    title: track.title,
    duration: track.duration,
    audio_url: track.audio_url || track.audioUrl,
    artist: track.artist,
    album: track.album,
    year: track.year,
    track_number: track.track_number || track.trackNumber,
    genre: track.genre,
    comment: track.comment,
    composer: track.composer,
    bitrate: track.bitrate,
    sample_rate: track.sample_rate || track.sampleRate,
    channels: track.channels,
    lossless: track.lossless
  }))

  return {
    id,
    original_album_name,
    title,
    year: album.year?.toString(),
    cover_image: album.cover_image,
    notes: album.notes,
    tracks,
    gallery: album.gallery,
    comments: album.comments || [],
    personnel: album.personnel || []
  }
})
