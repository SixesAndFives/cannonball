import { NextResponse } from 'next/server'
import { readGalleryData } from '@/lib/gallery-service'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const galleryData = await readGalleryData()
  const video = galleryData.items.find(
    (item) => item.id === id && item.type === 'video'
  )

  if (!video) {
    return new NextResponse('Video not found', { status: 404 })
  }

  // If we already have a thumbnail URL, redirect to it
  if (video.thumbnail_url) {
    return NextResponse.redirect(video.thumbnail_url)
  }

  // If no thumbnail, redirect to the video itself
  // The client will show a default thumbnail or first frame
  return NextResponse.redirect(video.url)
}
