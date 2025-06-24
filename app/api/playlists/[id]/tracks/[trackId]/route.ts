import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

const playlistsPath = path.join(process.cwd(), 'lib/playlists.json')

async function readPlaylists() {
  const data = await fs.readFile(playlistsPath, 'utf8')
  const { playlists } = JSON.parse(data)
  return playlists
}

async function writePlaylists(playlists: any[]) {
  await fs.writeFile(playlistsPath, JSON.stringify({ playlists }, null, 2))
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; trackId: string }> }
) {
  try {
    const { id: playlistId, trackId } = await params

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

    const playlist = playlists[playlistIndex]
    if (!playlist.tracks) {
      return NextResponse.json(
        { error: 'Playlist has no tracks' },
        { status: 404 }
      )
    }

    // Find the track to remove
    const trackIndex = playlist.tracks.findIndex((t: any) => {
      // Handle both track reference and direct track data
      return 'trackId' in t ? t.trackId === trackId : t.id === trackId
    })

    if (trackIndex === -1) {
      return NextResponse.json(
        { error: 'Track not found in playlist' },
        { status: 404 }
      )
    }

    // Remove the track
    playlist.tracks.splice(trackIndex, 1)
    await writePlaylists(playlists)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error removing track from playlist:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to remove track from playlist' },
      { status: 500 }
    )
  }
}
