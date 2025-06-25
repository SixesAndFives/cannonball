import { createClient } from '@supabase/supabase-js'
import { promises as fs } from 'fs'
import path from 'path'

// Environment variables
const supabaseUrl = 'https://rafhkwpcmpzcfejmakzi.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhZmhrd3BjbXB6Y2Zlam1ha3ppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODY0NjUsImV4cCI6MjA2NjM2MjQ2NX0.ir1xHiP5jjMQL356m-_Vkg9zDxy5JS3lhsXrM3vpRdU'

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

function generateTrackId(albumId: string, trackTitle: string): string {
  // Replace any non-alphanumeric characters with hyphens and convert to lowercase
  const sanitizedTitle = trackTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  return `${albumId}_${sanitizedTitle}`
}

async function migrate() {
  try {
    // Read all JSON files
    const albumsData = await readJsonFile(path.join(process.cwd(), 'lib/albums.json'))

    // Migrate albums and tracks
    console.log('Migrating albums and tracks...')
    for (const album of albumsData.albums) {
      console.log(`Processing album: ${album.title || album.originalAlbumName}`)
      
      // Insert album
      const { error: albumError } = await supabase
        .from('albums')
        .upsert({
          id: album.id,
          original_album_name: album.originalAlbumName,
          title: album.title || album.originalAlbumName,
          cover_image: album.coverImage,
          year: album.year || (album.tracks?.[0]?.year) || null,
          notes: album.notes || '',
          gallery: album.gallery || [],
          comments: album.comments || [],
          personnel: album.personnel || []
        })
      
      if (albumError) {
        console.error('Error inserting album:', album.id, albumError)
        continue // Skip tracks if album insert failed
      }

      // Insert tracks with composite IDs
      if (album.tracks) {
        for (const track of album.tracks as Track[]) {
          const trackId = generateTrackId(album.id, track.title)
          console.log(`Processing track: ${trackId}`)
          
          const trackData = {
            id: trackId,
            album_id: album.id,
            title: track.title,
            duration: Number(track.duration),
            audio_url: track.audioUrl,
            artist: track.artist || 'Cannonball',
            year: track.year || album.year,
            bitrate: track.bitrate ? Math.round(track.bitrate) : null,
            sample_rate: track.sampleRate,
            channels: track.channels,
            lossless: track.lossless
          }

          const { error: trackError } = await supabase
            .from('tracks')
            .upsert(trackData)
          
          if (trackError) {
            console.error('Error inserting track:', trackId, trackError)
          }
        }
      }
    }

    console.log('Migration completed successfully!')
  } catch (error) {
    console.error('Migration failed:', error)
  }
}

migrate()
