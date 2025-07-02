'use server'

import type { Album } from "./types"
import { supabase } from './supabase'

export async function generateId(name: string): Promise<string> {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-")
}

async function getAuthorizedUrl(url: string, type: 'audio' | 'cover' = 'audio'): Promise<string> {
  console.log('=== Converting URL ===', {
    time: new Date().toISOString(),
    originalUrl: url,
    type,
    stage: 'start'
  })

  // Convert direct B2 URL to a relative API route
  const fileName = url.split('/file/cannonball-music/')[1]
  
  if (!fileName) {
    console.log('=== URL Conversion Skipped ===', {
      time: new Date().toISOString(),
      originalUrl: url,
      reason: 'No cannonball-music path found',
      stage: 'skip'
    })
    return url
  }

  const convertedUrl = `/${type === 'audio' ? 'api/audio' : 'api/cover'}/${encodeURIComponent(fileName)}`
  
  console.log('=== URL Conversion Complete ===', {
    time: new Date().toISOString(),
    originalUrl: url,
    fileName,
    convertedUrl,
    stage: 'complete'
  })

  return convertedUrl
}

async function normalizeAlbum(album: any): Promise<Album> {
  console.log('=== Raw Album Data ===', {
    time: new Date().toISOString(),
    albumId: album.id,
    trackCount: album.tracks?.length ?? 0,
    sampleTrack: album.tracks?.[0],
    stage: 'normalize'
  })

  return {
    id: album.id,
    original_album_name: album.original_album_name,
    title: album.title,
    cover_image: album.cover_image,
    year: album.year || 'Unknown',
    notes: album.notes || '',
    tracks: await Promise.all((album.tracks || []).map(async (track: any) => {
      console.log('=== Processing Track URL ===', {
        time: new Date().toISOString(),
        trackId: track.id,
        rawUrl: track.audio_url,
        stage: 'start'
      })
      const normalizedTrack = {
        id: track.id,
        title: track.title,
        duration: typeof track.duration === 'number' ? track.duration.toString() : '0:00',
        audio_url: await getAuthorizedUrl(track.audio_url),
        album_id: album.id,
        album_title: album.title,
        cover_image: album.cover_image
      };

      return normalizedTrack;
    })),
    gallery: album.gallery || [],
    comments: album.comments || [],
    personnel: album.personnel || []
  };
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
  console.log('=== Getting all albums from Supabase ===', {
    time: new Date().toISOString(),
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    stage: 'start'
  })

  const { data: albums, error } = await supabase
    .from('albums')
    .select('*, tracks(*)')
    .order('year', { ascending: false })
    .abortSignal(new AbortController().signal) // Prevents caching

  if (error) {
    console.error('Error fetching albums:', {
      code: error.code,
      message: error.message,
      details: error.details,
      time: new Date().toISOString(),
      stage: 'supabase-error'
    })
    return []
  }

  if (!albums) {
    console.log('No albums found')
    return []
  }

  console.log('Raw albums from Supabase:', {
    count: albums.length,
    firstAlbum: albums[0] ? { id: albums[0].id, title: albums[0].title } : null,
    time: new Date().toISOString()
  })

  return Promise.all(albums.map(normalizeAlbum))
}
