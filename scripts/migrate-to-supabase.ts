import { createClient } from '@supabase/supabase-js'
import { promises as fs } from 'fs'
import path from 'path'

// You'll need to provide these
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function readJsonFile(filePath: string) {
  const data = await fs.readFile(filePath, 'utf8')
  return JSON.parse(data)
}

interface Track {
  id: string;
  title: string;
  duration: number;
  audioUrl: string;
  artist?: string;
  year?: number;
  bitrate?: number;
  sampleRate?: number;
  channels?: number;
  lossless?: boolean;
}

async function migrate() {
  try {
    // Read all JSON files
    const usersData = await readJsonFile(path.join(process.cwd(), 'lib/users.json'))
    const albumsData = await readJsonFile(path.join(process.cwd(), 'lib/albums.json'))
    const playlistsData = await readJsonFile(path.join(process.cwd(), 'lib/playlists.json'))

    // Migrate users
    console.log('Migrating users...')
    for (const user of usersData.users) {
      const { error } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          full_name: user.fullName,
          user_name: user.userName,
          password: user.password, // Note: In production, we should hash these
          profile_image: user.profileImage,
          created_at: user.createdAt,
          instruments: user.instruments
        })
      if (error) console.error('Error inserting user:', user.id, error)
    }

    // Migrate albums and tracks
    console.log('Migrating albums and tracks...')
    for (const album of albumsData.albums) {
      // Insert album
      const { error: albumError } = await supabase
        .from('albums')
        .upsert({
          id: album.id,
          original_album_name: album.originalAlbumName,
          title: album.title || album.originalAlbumName,
          cover_image: album.coverImage,
          year: album.year || (album.tracks?.[0]?.year) || 'Unknown',
          notes: album.notes || '',
          gallery: album.gallery || [],
          comments: album.comments || [],
          personnel: album.personnel || []
        })
      if (albumError) console.error('Error inserting album:', album.id, albumError)

      // Insert tracks
      for (const track of album.tracks as Track[]) {
        const trackData = {
          id: track.id,
          album_id: album.id,
          title: track.title,
          duration: Number(track.duration),
          audio_url: track.audioUrl,
          artist: track.artist || 'Cannonball',
          year: track.year,
          bitrate: track.bitrate ? Math.round(track.bitrate) : null,
          sample_rate: track.sampleRate,
          channels: track.channels,
          lossless: track.lossless
        };
        console.log('Inserting track:', track.id);
        console.log('Track data:', JSON.stringify(trackData, null, 2));
        console.log('Duration type:', typeof trackData.duration);
        console.log('Duration value:', trackData.duration);
        const { error: trackError } = await supabase
          .from('tracks')
          .upsert(trackData)
        if (trackError) console.error('Error inserting track:', track.id, trackError)
      }

      // Insert album personnel if present
      if (album.personnel) {
        for (const userId of album.personnel) {
          const { error: personnelError } = await supabase
            .from('album_personnel')
            .upsert({
              album_id: album.id,
              user_id: userId
            })
          if (personnelError) console.error('Error inserting album personnel:', album.id, userId, personnelError)
        }
      }

      // Insert comments if present
      if (album.comments) {
        for (const comment of album.comments) {
          const { error: commentError } = await supabase
            .from('comments')
            .upsert({
              id: comment.id,
              album_id: album.id,
              user_id: comment.userId,
              content: comment.content,
              created_at: comment.createdAt
            })
          if (commentError) console.error('Error inserting comment:', comment.id, commentError)
        }
      }
    }

    // Migrate playlists and playlist tracks
    console.log('Migrating playlists...')
    for (const playlist of playlistsData.playlists) {
      const { error: playlistError } = await supabase
        .from('playlists')
        .upsert({
          id: playlist.id,
          title: playlist.title,
          cover_image: playlist.coverImage,
          created_by: playlist.createdBy,
          created_at: new Date(playlist.createdAt).toISOString()
        })
      if (playlistError) console.error('Error inserting playlist:', playlist.id, playlistError)

      // Insert playlist tracks
      if (playlist.tracks) {
        for (const track of playlist.tracks) {
          const { error: playlistTrackError } = await supabase
            .from('playlist_tracks')
            .upsert({
              playlist_id: playlist.id,
              track_id: track.id
            })
          if (playlistTrackError) console.error('Error inserting playlist track:', playlist.id, track.id, playlistTrackError)
        }
      }
    }

    console.log('Migration completed successfully!')
  } catch (error) {
    console.error('Migration failed:', error)
  }
}

migrate()
