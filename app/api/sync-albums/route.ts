import { NextResponse } from 'next/server'
import { syncAlbums } from '@/scripts/sync-albums-supabase'

export async function POST() {
  try {
    await syncAlbums()
    return NextResponse.json({ message: 'Albums synced successfully' })
  } catch (error) {
    console.error('Error syncing albums:', error)
    return NextResponse.json(
      { error: 'Failed to sync albums' },
      { status: 500 }
    )
  }
}
