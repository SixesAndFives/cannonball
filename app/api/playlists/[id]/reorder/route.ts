import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { supabase } from '@/lib/supabase/server'
import { reorderPlaylistTracks } from '@/lib/services/playlist-service'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updates = await request.json()

    // Validate request body
    if (!Array.isArray(updates)) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }

    // Since we're using RLS with anon role, we don't need explicit auth checks
    // The playlist_tracks table RLS policies will handle access control

    try {
      // Update track positions
      await reorderPlaylistTracks(id, updates)
    } catch (error) {
      console.error('Error reordering tracks:', error)
      return NextResponse.json(
        { error: 'Failed to reorder tracks' },
        { status: 500 }
      )
    }

    // Revalidate both the playlist page and edit page
    revalidatePath(`/playlists/${id}`)
    revalidatePath(`/playlists/${id}/edit`)

    return NextResponse.json({ message: 'Tracks reordered successfully' })
  } catch (error) {
    console.error('Error in reorder tracks route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
