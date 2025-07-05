import { supabase } from '../lib/supabase'
import { getFolders, getTracksFromB2 } from '../lib/b2-client'
import type { Album, Track } from '../lib/types'

// Normalize duration values that might be in milliseconds
function normalizeDuration(duration: number | string | undefined): number {
    if (!duration) return 300; // Default to 5 minutes if no duration
    const value = Number(duration);
    
    // If it has many decimal places and is very precise (like 128128.39712667785)
    // it's likely in milliseconds
    if (value.toString().includes('.') && value.toString().split('.')[1].length > 3) {
        return Math.round(value / 1000);
    }
    
    // Otherwise, just round the value as-is
    // This preserves actual long durations (like hour+ long songs)
    return Math.round(value);
}

// Folders to exclude from album sync
const EXCLUDED_FOLDERS = ['Images', 'images', 'thumbnails', 'gallery', 'JSON']

export async function syncAlbums(): Promise<void> {
  console.log('Starting album sync with Supabase...')
  try {
    // Get current albums from Supabase
    const { data: currentAlbums, error: fetchError } = await supabase
      .from('albums')
      .select('*, tracks(*)')

    if (fetchError) {
      throw new Error(`Failed to fetch albums: ${fetchError.message}`)
    }

    // Get all folders from B2
    const folders = await getFolders()
    console.log('Found folders in B2:', folders)

    // Create a set of B2 folders for quick lookup
    const b2Folders = new Set(folders)

    // Remove albums and their tracks that no longer exist in B2
    const albumsToDelete = currentAlbums?.filter(album => !b2Folders.has(album.original_album_name)) || []
    
    for (const album of albumsToDelete) {
      console.log(`Removing album no longer in B2: ${album.original_album_name}`)
      
      // First delete all tracks for this album
      const { error: deleteTracksError } = await supabase
        .from('tracks')
        .delete()
        .eq('album_id', album.id)

      if (deleteTracksError) {
        console.error(`Failed to delete tracks for album ${album.id}:`, deleteTracksError)
        continue
      }

      // Then delete the album
      const { error: deleteAlbumError } = await supabase
        .from('albums')
        .delete()
        .eq('id', album.id)

      if (deleteAlbumError) {
        console.error(`Failed to delete album ${album.id}:`, deleteAlbumError)
      }
    }

    // Create a set of existing albums for quick lookup
    const existingAlbums = new Set((currentAlbums || []).map(album => album.original_album_name))

    // Add new albums from B2
    for (const folder of folders) {
      // Skip excluded folders
      if (EXCLUDED_FOLDERS.includes(folder)) {
        console.log(`Skipping excluded folder: ${folder}`)
        continue
      }

      // Skip if album already exists
      if (existingAlbums.has(folder)) {
        console.log(`Skipping existing album: ${folder}`)
        continue
      }

      console.log(`Processing new album: ${folder}`)
      
      // Get tracks and cover image from the folder
      const { tracks, cover_image } = await getTracksFromB2(folder)
      
      // Create new album entry
      const albumId = folder.toLowerCase().replace(/\s+/g, '-')
      
      // Get year from first track's metadata if available
      const albumYear = tracks[0]?.year
      
      // Insert the new album into Supabase
      const { error: insertAlbumError } = await supabase
        .from('albums')
        .insert({
          id: albumId,
          original_album_name: folder,
          title: folder,
          cover_image,
          personnel: '[]',  // Empty JSON array
          year: albumYear || null  // Use track year or null if not available
        })

      if (insertAlbumError) {
        console.error(`Failed to insert album ${albumId}:`, insertAlbumError)
        continue
      }

      // Insert tracks
      for (const track of tracks) {
        // Ensure duration is a valid number
        const durationInSeconds = Math.round(track.duration || 300);

        console.log(`Track ${track.title} duration:`, {
          original: track.duration,
          final: durationInSeconds
        });
        console.log('=== TRACK BEFORE INSERT ===', {
          title: track.title,
          fullTrack: track
        });

        const { error: insertTrackError } = await supabase
          .from('tracks')
          .insert({
            id: track.id,
            album_id: albumId,
            title: track.title,
            duration: durationInSeconds,
            audio_url: track.audio_url,
            artist: track.artist,
            year: track.year,
            bitrate: track.bitrate,
            sample_rate: track.sample_rate,
            channels: track.channels,
            lossless: track.lossless
          })

        if (insertTrackError) {
          console.error(`Failed to insert track ${track.id} for album ${albumId}:`, insertTrackError)
        }
      }

      console.log(`Added new album: ${folder} with ${tracks.length} tracks`)
    }

    console.log('Albums sync completed successfully')
  } catch (error) {
    console.error('Error syncing albums:', error)
    throw error
  }
}

// Run syncAlbums if this file is executed directly
if (require.main === module) {
  console.log('Running sync directly...')
  syncAlbums().catch(console.error)
}
