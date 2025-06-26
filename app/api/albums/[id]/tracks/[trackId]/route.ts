import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import albumsData from '@/lib/albums.json'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; trackId: string }> }
) {
  console.log('Deleting track:', params)
  try {
    const { id, trackId } = await params
    const album_id = decodeURIComponent(id)
    const decodedTrackId = decodeURIComponent(trackId)
    
    // Find the album
    console.log('Looking for album:', album_id)
    const albumIndex = albumsData.albums.findIndex(album => {
      console.log('Checking album:', album.id)
      return album.id === album_id
    })
    if (albumIndex === -1) {
      return NextResponse.json({ error: 'Album not found' }, { status: 404 })
    }
    
    // Find and remove the track
    const album = albumsData.albums[albumIndex]
    console.log('Found album:', album.title)
    console.log('Looking for track:', decodedTrackId)
    const trackIndex = album.tracks.findIndex(track => track.id === decodedTrackId)
    if (trackIndex === -1) {
      return NextResponse.json({ error: 'Track not found' }, { status: 404 })
    }
    
    // Remove the track
    album.tracks.splice(trackIndex, 1)
    
    // Save the updated albums.json
    const albumsPath = path.join(process.cwd(), 'lib', 'albums.json')
    console.log('Writing to:', albumsPath)
    await fs.writeFile(albumsPath, JSON.stringify(albumsData, null, 2))
    console.log('Successfully deleted track')
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting track:', error)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ error: 'Failed to delete track' }, { status: 500 })
  }
}
