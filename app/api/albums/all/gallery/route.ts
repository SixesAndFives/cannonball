import { NextResponse } from 'next/server'
import { getAllAlbums } from '@/lib/album-service'
import { getAlbumGallery } from '@/lib/gallery-service-supabase'

export async function GET() {
  try {
    // Get all albums
    const albums = await getAllAlbums()
    console.log('API: Fetching gallery items for all albums:', albums.length)

    // Get gallery items for each album
    const galleryPromises = albums.map(album => 
      getAlbumGallery(album.id)
        .then(items => items.map(item => ({
          ...item,
          album_id: album.id // Ensure album_id is set
        })))
        .catch(error => {
          console.error(`Failed to fetch gallery for album ${album.id}:`, error)
          return [] // Return empty array for failed fetches
        })
    )

    // Wait for all gallery items
    const galleries = await Promise.all(galleryPromises)
    const allItems = galleries.flat()

    console.log('API: Found total gallery items:', allItems.length)
    return NextResponse.json(allItems)
  } catch (error) {
    console.error('API: Failed to fetch all gallery items:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
