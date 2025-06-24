import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import type { Track } from '@/lib/types'

const playlistsPath = path.join(process.cwd(), 'lib/playlists.json')

async function readPlaylists() {
  const data = await fs.readFile(playlistsPath, 'utf8')
  const { playlists } = JSON.parse(data)
  return playlists
}

async function writePlaylists(playlists: any[]) {
  await fs.writeFile(playlistsPath, JSON.stringify({ playlists }, null, 2))
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: playlistId } = await params
    const { track } = await request.json()

    const playlists = await readPlaylists()
    if (!Array.isArray(playlists)) {
      throw new Error('Invalid playlists data structure')
    }

    const playlistIndex = playlists.findIndex((p) => p.id === playlistId)

    if (playlistIndex === -1) {
      return NextResponse.json(
        { error: 'Playlist not found' },
        { status: 404 }
      )
    }

    // Initialize tracks array if it doesn't exist
    if (!playlists[playlistIndex].tracks) {
      playlists[playlistIndex].tracks = []
    }

    // Check if track already exists in playlist
    const trackExists = playlists[playlistIndex].tracks.some(
      (t: Track) => t.id === track.id
    )

    if (trackExists) {
      return NextResponse.json(
        { error: 'Track already exists in playlist' },
        { status: 400 }
      )
    }

    // Add track to playlist
    playlists[playlistIndex].tracks.push(track)
    await writePlaylists(playlists)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error adding track to playlist:', error)
    return NextResponse.json(
      { error: 'Failed to add track to playlist' },
      { status: 500 }
    )
  }
}
