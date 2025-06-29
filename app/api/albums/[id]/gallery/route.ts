import { NextResponse } from 'next/server'
import { getAlbumGallery, uploadGalleryItem } from '@/lib/gallery-service-supabase'
import { generateVideoThumbnail } from '@/lib/video-utils'
import type { GalleryItem } from '@/lib/gallery-service-supabase'

// GET /api/albums/[id]/gallery
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log('Fetching gallery for album:', id)
    const items = await getAlbumGallery(id)
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const formData = await request.formData()
    const file = formData.get('file') as File
    const thumbnail = formData.get('thumbnail') as File
    const caption = formData.get('caption') as string
    const taggedUsersJson = formData.get('tagged_users') as string
    const tagged_users = taggedUsersJson ? JSON.parse(taggedUsersJson) : []
    
    if (!file) {
      return NextResponse.json(
        { error: 'File is required' },
        { status: 400 }
      )
    }

    // Convert files to Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    let thumbnailBuffer: Buffer | null = null
    if (thumbnail) {
      const thumbArrayBuffer = await thumbnail.arrayBuffer()
      thumbnailBuffer = Buffer.from(thumbArrayBuffer)
    }
    const file_name = file.name
    const content_type = file.type
    const uploaded_by = formData.get('uploaded_by') as string

    // Generate thumbnail for videos if not provided
    if (content_type.startsWith('video/') && !thumbnailBuffer) {
      console.log('Generating video thumbnail...')
      thumbnailBuffer = await generateVideoThumbnail(buffer)
      if (thumbnailBuffer) {
        console.log('Video thumbnail generated successfully')
      } else {
        console.warn('Failed to generate video thumbnail')
      }
    }
    
    if (!uploaded_by) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }
    
    // Upload to B2 and create gallery item
    const item = await uploadGalleryItem(
      buffer,
      file_name,
      content_type,
      id,
      caption,
      tagged_users,
      uploaded_by,
      thumbnailBuffer
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
