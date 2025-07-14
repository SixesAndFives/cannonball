import { supabase } from '@/lib/supabase/server'
import { Track } from '@/lib/types'

export async function reorderPlaylistTracks(playlistId: string, updates: { id: string; position: number }[]) {
  console.log('=== Reordering Playlist Tracks ===');
  console.log('Playlist ID:', playlistId);
  console.log('Updates:', JSON.stringify(updates, null, 2));

  // Update each track's position directly using the playlist_track.id
  for (const update of updates) {
    console.log(`Updating position for playlist_tracks(id, track_id, position, 
        tracks(id, title, duration, audio_url, album_id, 
          albums(title, cover_image)
        )
      )`);
    
    // Use explicit position field and ensure it's treated as a number
    const { error } = await supabase
      .from('playlist_tracks')
      .update({
        position: update.position
      })
      .eq('id', update.id);

    if (error) {
      console.error('Error updating track position:', error);
      throw new Error('Failed to reorder tracks');
    }

    // Verify the update
    const { data: verify } = await supabase
      .from('playlist_tracks')
      .select('position')
      .eq('id', update.id)
      .single();

    console.log(`Verified position for ${update.id}:`, verify);
  }
}
