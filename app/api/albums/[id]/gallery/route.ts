import { NextResponse } from 'next/server'
import { getAlbumGallery, uploadGalleryItem } from '@/lib/gallery-service'
import type { GalleryItem } from '@/lib/gallery-service'

// GET /api/albums/[id]/gallery
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('Fetching gallery for album:', params.id)
    const items = await getAlbumGallery(params.id)
    console.log('Found items:', items)
    return NextResponse.json(items)
  } catch (error) {
    console.error('Error fetching gallery:', error)
    return NextResponse.json(
      { error: 'Failed to fetch gallery items' },
      { status: 500 }
    )
  }
}

// POST /api/albums/[id]/gallery
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const caption = formData.get('caption') as string
    const taggedUsersJson = formData.get('taggedUsers') as string
    const taggedUsers = taggedUsersJson ? JSON.parse(taggedUsersJson) : []
    
    if (!file) {
      return NextResponse.json(
        { error: 'File is required' },
        { status: 400 }
      )
    }

    // Convert File to Buffer
    const buffer = Buffer.from(await file.arrayBuffer())
    const fileName = file.name
    const contentType = file.type
    
    // Upload to B2 and create gallery item
    const item = await uploadGalleryItem(
      buffer,
      fileName,
      contentType,
      params.id,
      caption,
      taggedUsers
    )
    
    return NextResponse.json(item)
  } catch (error) {
    console.error('Error adding gallery item:', error)
    return NextResponse.json(
      { error: 'Failed to add gallery item' },
      { status: 500 }
    )
  }
}
