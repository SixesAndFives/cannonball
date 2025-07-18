'use server'

import { supabase } from '@/lib/supabase/server'
import type { Track } from '@/lib/types'

export async function getMostPlayedTracks(limit: number = 8): Promise<Track[]> {
  const { data, error } = await supabase
    .from('tracks')
    .select(`
      id,
      title,
      audio_url,
      duration,
      plays,
      album:albums!inner(
        id,
        title,
        cover_image
      )
    `)
    .order('plays', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching most played tracks:', error)
    return []
  }

  return data.map((track: any) => ({
    id: track.id,
    title: track.title,
    audio_url: track.audio_url,
    duration: track.duration,
    plays: track.plays || 0,
    album_id: track.album.id,
    album_title: track.album.title,
    cover_image: track.album.cover_image
  }))
}

export async function incrementTrackPlays(trackId: string): Promise<void> {
  // First get the current play count
  const { data, error: fetchError } = await supabase
    .from('tracks')
    .select('plays')
    .eq('id', trackId)
    .single()

  if (fetchError) {
    console.error('Error fetching track plays:', fetchError)
    return
  }

  // Then increment it
  const { error: updateError } = await supabase
    .from('tracks')
    .update({ plays: (data?.plays || 0) + 1 })
    .eq('id', trackId)

  if (updateError) {
    console.error('Error incrementing track plays:', updateError)
  }
}
