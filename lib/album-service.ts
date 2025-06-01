'use server'

import type { Album } from "./types"
import albumsData from './albums.json'

export async function generateId(name: string): Promise<string> {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-")
}

async function getAuthorizedUrl(url: string): Promise<string> {
  // Convert direct B2 URL to a relative API route
  const fileName = url.split('/file/cannonball-music/')[1]
  if (!fileName) return url
  return `/api/audio/${encodeURIComponent(fileName)}`
}

async function normalizeAlbum(album: any): Promise<Album> {
  const id = album.id || await generateId(album.originalAlbumName)
  return {
    id,
    originalAlbumName: album.originalAlbumName,
    title: album.title || album.originalAlbumName,
    coverImage: album.coverImage,
    year: album.year,
    notes: album.notes,
    tracks: await Promise.all(album.tracks.map(async (track: any) => ({
      id: track.id || `track-${Math.random().toString(36).slice(2)}`,
      title: track.title || track.url.split('/').pop()?.replace(/\.\w+$/, '') || 'Untitled Track',
      duration: track.duration || '0:00',
      audioUrl: await getAuthorizedUrl(track.url)
    }))),
    gallery: album.gallery || [],
    comments: album.comments || [],
    personnel: album.personnel || []
  }
}

export async function getAlbumById(id: string): Promise<Album | null> {
  try {
    const album = albumsData.albums.find(async album => {
      const albumId = album.id || await generateId(album.originalAlbumName)
      return albumId === id
    })
    
    return album ? await normalizeAlbum(album) : null
  } catch (error) {
    console.error("Error reading album:", error)
    return null
  }
}

export async function updateAlbum(id: string, updatedAlbum: Album): Promise<boolean> {
  try {
    const response = await fetch(`/api/albums/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedAlbum),
    })

    if (!response.ok) {
      throw new Error('Failed to update album')
    }

    const data = await response.json()
    return data.success
  } catch (error) {
    console.error("Error updating album:", error)
    return false
  }
}

export async function getAllAlbums(): Promise<Album[]> {
  const albums = await Promise.all(albumsData.albums.map(normalizeAlbum))
  return albums
}
