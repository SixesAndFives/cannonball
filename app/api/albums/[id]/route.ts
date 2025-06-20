import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { NextResponse } from 'next/server'
import type { Album } from '@/lib/types'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const albumsPath = join(process.cwd(), 'lib', 'albums.json')
    const albumsData = JSON.parse(readFileSync(albumsPath, 'utf-8'))
    
    const updatedAlbum = await request.json() as Album
    
    // Ensure the ID in the URL matches the album ID
    if (params.id !== updatedAlbum.id) {
      return NextResponse.json(
        { error: 'Album ID mismatch' },
        { status: 400 }
      )
    }

    // Find and update the album
    const albumIndex = albumsData.albums.findIndex(
      (album: Album) => album.id === params.id
    )

    if (albumIndex === -1) {
      return NextResponse.json(
        { error: 'Album not found' },
        { status: 404 }
      )
    }

    // Preserve tracks and other data, only update personnel
    const existingAlbum = albumsData.albums[albumIndex]
    albumsData.albums[albumIndex] = {
      ...existingAlbum,
      personnel: updatedAlbum.personnel
    }

    // Write back to file
    writeFileSync(albumsPath, JSON.stringify(albumsData, null, 2))

    return NextResponse.json(albumsData.albums[albumIndex])
  } catch (error) {
    console.error('Error updating album:', error)
    return NextResponse.json(
      { error: 'Failed to update album' },
      { status: 500 }
    )
  }
}
