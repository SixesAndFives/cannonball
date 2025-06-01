import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import albumsData from '@/lib/albums.json'

export async function POST(request: Request) {
  try {
    const { albumId, trackId } = await request.json()
    console.log('Deleting track:', { albumId, trackId })
    
    // Find the album
    const album = albumsData.albums.find(a => a.id === albumId)
    if (!album) {
      console.log('Album not found:', albumId)
      return NextResponse.json({ error: 'Album not found' }, { status: 404 })
    }
    
    // Remove the track
    const trackIndex = album.tracks.findIndex(t => t.id === trackId)
    if (trackIndex === -1) {
      console.log('Track not found:', trackId)
      return NextResponse.json({ error: 'Track not found' }, { status: 404 })
    }
    
    album.tracks.splice(trackIndex, 1)
    console.log('Track removed, saving file...')
    
    // Save the updated albums.json
    const albumsPath = path.join(process.cwd(), 'lib', 'albums.json')
    await fs.writeFile(albumsPath, JSON.stringify(albumsData, null, 2))
    console.log('File saved successfully')
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting track:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
