'use server'

import type { Album } from "./types"
import { supabase } from './supabase'

export async function generateId(name: string): Promise<string> {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-")
}

async function getAuthorizedUrl(url: string, type: 'audio' | 'cover' = 'audio'): Promise<string> {
  // Convert direct B2 URL to a relative API route
  const fileName = url.split('/file/cannonball-music/')[1]
  if (!fileName) return url
  return `/${type === 'audio' ? 'api/audio' : 'api/cover'}/${encodeURIComponent(fileName)}`
}

async function normalizeAlbum(album: any): Promise<Album> {
  return {
    id: album.id,
    original_album_name: album.original_album_name,
    title: album.title,
    cover_image: album.cover_image,
    year: album.year || 'Unknown',
    notes: album.notes || '',
    tracks: await Promise.all((album.tracks || []).map(async (track: any) => ({
      id: track.id,
      title: track.title,
      duration: typeof track.duration === 'number' ? track.duration.toString() : '0:00',
      audio_url: await getAuthorizedUrl(track.audio_url),
      album_id: album.id,
      album_title: album.title,
      cover_image: album.cover_image
    }))),
    gallery: album.gallery || [],
    comments: album.comments || [],
    personnel: album.personnel || []
  }
}

export async function getAlbumById(id: string): Promise<Album | null> {
  try {
    const { data: album, error } = await supabase
      .from('albums')
      .select('*, tracks(*)')
      .eq('id', id)
      .single()

    if (error || !album) return null
    return normalizeAlbum(album)
  } catch (error) {
    console.error('Error getting album:', error)
    return null
  }
}

export async function updateAlbum(id: string, updatedAlbum: Album): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('albums')
      .update(updatedAlbum)
      .eq('id', id)

    return !error
  } catch (error) {
    console.error('Error updating album:', error)
    return false
  }
}

export async function getAllAlbums(): Promise<Album[]> {
  const { data: albums, error } = await supabase
    .from('albums')
    .select('*, tracks(*)')
    .order('year', { ascending: false })

  if (error || !albums) return []
  return Promise.all(albums.map(normalizeAlbum))
}
