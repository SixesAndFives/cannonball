import { NextResponse } from 'next/server'
import { readGalleryData } from '@/lib/gallery-service'

export async function GET() {
  try {
    const { items } = await readGalleryData()
    return NextResponse.json(items)
  } catch (error) {
    console.error('Error reading gallery data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch gallery items' },
      { status: 500 }
    )
  }
}
