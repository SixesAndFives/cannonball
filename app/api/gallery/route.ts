import { NextResponse } from 'next/server'
import { getAllGalleryItems } from '@/lib/gallery-service-supabase'

export async function GET() {
  try {
    const items = await getAllGalleryItems()
    return NextResponse.json(items)
  } catch (error) {
    console.error('Error reading gallery data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch gallery items' },
      { status: 500 }
    )
  }
}
