import type { Album, Track } from "./types"
import albumsData from './albums.json'

type TrackData = {
  url?: string;
  file?: string;
  title?: string;
}

// Map the albums from our JSON file to match the UI's expectations
export const albums: Album[] = albumsData.albums.map(album => {
  // Handle both old and new album formats
  const id = album.id || album.originalAlbumName?.toLowerCase().replace(/\s+/g, '-') || ''
  const title = album.title || album.originalAlbumName || ''
  const originalAlbumName = album.originalAlbumName || album.title || ''

  // Map tracks to our Track type
  const tracks: Track[] = album.tracks.map((track: TrackData) => ({
    url: track.url || track.file || '',
    title: track.title
  }))

  return {
    id,
    originalAlbumName,
    title,
    year: album.year,
    coverImage: album.coverImage,
    tracks,
    gallery: album.gallery || [],
    comments: album.comments || [],
    personnel: album.personnel || []
  }
})
