import { NextResponse } from 'next/server'
import { getAlbumGallery } from '@/lib/gallery-service'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const items = await getAlbumGallery(id)
    return NextResponse.json(items)
  } catch (error) {
    console.error('Error getting album gallery:', error)
    return NextResponse.json({ error: 'Failed to get album gallery' }, { status: 500 })
  }
}
