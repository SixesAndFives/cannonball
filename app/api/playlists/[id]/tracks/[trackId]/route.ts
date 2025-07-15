import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/server'
import type { NextRequest } from 'next/server'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; trackId: string }> }
): Promise<NextResponse> {
  console.log('==== DELETE ENDPOINT START ====');
  try {
    const { id: playlistId, trackId } = await params
    
    // Remove playlist ID prefix from track ID if it exists
    const originalTrackId = trackId.includes('_') ? trackId.split('_')[1] : trackId
    
    console.log('Deleting track from playlist:', { 
      playlistId, 
      originalTrackId,
      providedTrackId: trackId 
    })

    // First check if the track exists
    const { data: existingTrack, error: findError } = await supabase
      .from('playlist_tracks')
      .select('*')
      .eq('playlist_id', playlistId)
      .eq('track_id', originalTrackId)
      .single()

    console.log('Find track result:', { existingTrack, findError })

    if (findError) {
      console.error('Error finding track:', findError)
      return NextResponse.json(
        { error: 'Error finding track in playlist' },
        { status: 500 }
      )
    }

    if (!existingTrack) {
      console.log('Track not found in playlist')
      return NextResponse.json(
        { error: 'Track not found in playlist' },
        { status: 404 }
      )
    }

    // Remove track from playlist_tracks table
    console.log('Track found, executing delete...')
    
    // Log the exact query we're about to run
    const query = supabase
      .from('playlist_tracks')
      .delete()
      .eq('playlist_id', playlistId)
      .eq('track_id', originalTrackId)
    
    console.log('Supabase query:', {
      table: 'playlist_tracks',
      method: 'delete',
      conditions: {
        playlist_id: playlistId,
        track_id: trackId
      }
    })

    const { data, error, count } = await query
    console.log('Delete result:', { data, error, count })

    if (error) {
      console.error('Error removing track from playlist:', error)
      return NextResponse.json(
        { error: 'Failed to remove track from playlist', details: error },
        { status: 500 }
      )
    }

    console.log('Successfully deleted track from playlist')
    console.log('==== DELETE ENDPOINT END ====');
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error removing track from playlist:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to remove track from playlist' },
      { status: 500 }
    )
  }
}
