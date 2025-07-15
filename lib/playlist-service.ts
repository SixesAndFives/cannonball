import { Playlist, PlaylistTrack } from './types'
import { supabase } from './supabase/server'

async function getAuthorizedUrl(url: string, type: 'audio' | 'cover' = 'audio'): Promise<string> {
  // For cover images, return the B2 URL directly
  if (type === 'cover') return url
  
  // For audio files, convert direct B2 URL to a relative API route
  const fileName = url.split('/file/cannonball-music/')[1]
  if (!fileName) return url
  return `/api/audio/${encodeURIComponent(fileName)}`
}

export async function normalizePlaylist(playlist: any): Promise<Playlist> {
  if (!playlist) {
    console.warn('normalizePlaylist - Received null/undefined playlist');
    return {
      id: '',
      title: '',
      cover_image: '',
      user_id: '',
      created_at: Date.now(),
      tracks: []
    };
  }

  console.log('normalizePlaylist - Input playlist:', JSON.stringify(playlist, null, 2));
  
  const tracks = playlist.playlist_tracks || [];
  console.log('normalizePlaylist - Raw tracks:', JSON.stringify(tracks, null, 2));
  
  const normalizedTracks: PlaylistTrack[] = await Promise.all(
    tracks.map(async (pt: any) => {
      console.log('normalizePlaylist - Processing track:', JSON.stringify(pt, null, 2));
      const track = pt.tracks || {};
      const album = track.albums || {};
      console.log('normalizePlaylist - Track and Album:', { track, album });
      return {
        id: pt.id || '',              // Use playlist_track.id
        track_id: track.id || '',      // Store original track.id
        title: track.title || 'Unknown Track',
        duration: typeof track.duration === 'number' ? track.duration.toString() : '0:00',
        audio_url: track.audio_url ? await getAuthorizedUrl(track.audio_url) : '',
        album_id: track.album_id || '',
        album_title: album.title || '',
        cover_image: album.cover_image ? await getAuthorizedUrl(album.cover_image, 'cover') : '',
        position: pt.position || 0
      };
    })
  );
  
  // Sort tracks by position
  normalizedTracks.sort((a, b) => (a.position || 0) - (b.position || 0));
  
  console.log('normalizePlaylist - Normalized tracks:', JSON.stringify(normalizedTracks, null, 2));
  
  const normalizedPlaylist = {
    id: playlist.id || '',
    title: playlist.id?.endsWith('-favorites')
      ? `${playlist.users?.full_name}'s Favorites`
      : playlist.title || '',
    cover_image: playlist.cover_image || '',
    user_id: playlist.user_id || '',
    created_at: playlist.created_at ? new Date(playlist.created_at).getTime() : Date.now(),
    tracks: normalizedTracks
  };
  
  console.log('normalizePlaylist - Final normalized playlist:', JSON.stringify(normalizedPlaylist, null, 2));
  return normalizedPlaylist;
}

export async function getAllPlaylists(): Promise<Playlist[]> {
  console.log('getAllPlaylists - Starting query');

  // Debug: Check playlists table directly
  const { data: rawPlaylists, error: rawError } = await supabase
    .from('playlists')
    .select('*');
  console.log('getAllPlaylists - Raw playlists table:', rawPlaylists, 'Error:', rawError);

  const { data: playlists, error } = await supabase
    .from('playlists')
    .select(`
      *,
      users(full_name),
      playlist_tracks(id, track_id, position, 
        tracks(id, title, duration, audio_url, album_id, 
          albums(title, cover_image)
        )
      )
    `)
    .order('created_at', { ascending: false })
    .order('position', { foreignTable: 'playlist_tracks', ascending: true })

  if (error) {
    console.error('getAllPlaylists - Error:', error);
    throw error;
  }

  // Normalize each playlist
  const normalizedPlaylists = await Promise.all(
    (playlists || []).map(playlist => normalizePlaylist(playlist))
  );

  console.log('getAllPlaylists - Normalized playlists:', JSON.stringify(normalizedPlaylists, null, 2));
  return normalizedPlaylists;
}
