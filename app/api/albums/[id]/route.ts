import { NextResponse } from 'next/server'
import type { Album } from '@/lib/types'
import albumsData from '@/lib/albums.json'
import { generateId } from '@/lib/album-service'

function normalizeAlbumForStorage(album: Album): any {
  return {
    id: album.id,
    originalAlbumName: album.originalAlbumName,
    title: album.title,
    coverImage: album.coverImage,
    year: album.year,
    notes: album.notes,
    tracks: album.tracks.map(track => ({
      url: track.audioUrl,
      title: track.title,
      duration: track.duration
    })),
    gallery: album.gallery,
    comments: album.comments,
    personnel: album.personnel
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const album = albumsData.albums.find(album => {
    const albumId = album.id || generateId(album.originalAlbumName)
    return albumId === params.id
  })
  
  if (!album) {
    return NextResponse.json({ error: 'Album not found' }, { status: 404 })
  }
  return NextResponse.json(album)
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const updatedAlbum: Album = await request.json()
    const index = albumsData.albums.findIndex(album => {
      const albumId = album.id || generateId(album.originalAlbumName)
      return albumId === params.id
    })
    
    if (index === -1) {
      return NextResponse.json({ error: 'Album not found' }, { status: 404 })
    }

    // Convert the Album type to the storage format
    albumsData.albums[index] = normalizeAlbumForStorage(updatedAlbum)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating album:', error)
    return NextResponse.json({ error: 'Failed to update album' }, { status: 500 })
  }
}
