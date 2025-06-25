import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/server'
import type { Track } from '@/lib/types'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: playlistId } = await params
    const { track } = await request.json()

    // Check if track already exists in playlist
    const { data: existingTrack } = await supabase
      .from('playlist_tracks')
      .select('*')
      .eq('playlist_id', playlistId)
      .eq('track_id', track.id)
      .single()

    if (existingTrack) {
      return NextResponse.json(
        { error: 'Track already exists in playlist' },
        { status: 400 }
      )
    }

    // Add track to playlist_tracks table
    const { error } = await supabase
      .from('playlist_tracks')
      .insert({
        id: `${playlistId}_${track.id}`,
        playlist_id: playlistId,
        track_id: track.id
      })

    if (error) {
      console.error('Error adding track to playlist:', error)
      return NextResponse.json(
        { error: 'Failed to add track to playlist' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error adding track to playlist:', error)
    return NextResponse.json(
      { error: 'Failed to add track to playlist' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log('==== DELETE ENDPOINT START ====');
  try {
    console.log('DELETE request received:', {
      url: request.url,
      params: await params
    })

    const { id: playlistId } = await params
    const url = new URL(request.url)
    console.log('URL parts:', {
      pathname: url.pathname,
      segments: url.pathname.split('/'),
    })

    const trackId = url.pathname.split('/').pop()
    
    console.log('DELETE track from playlist:', { 
      playlistId, 
      trackId,
      fullUrl: request.url,
      headers: Object.fromEntries(request.headers.entries())
    })
    
    if (!trackId) {
      console.log('No track ID found in URL')
      return NextResponse.json(
        { error: 'Track ID is required' },
        { status: 400 }
      )
    }

    // First check if the track exists
    console.log('Checking if track exists in playlist...');
    const { data: existingTrack, error: findError } = await supabase
      .from('playlist_tracks')
      .select('*')
      .eq('playlist_id', playlistId)
      .eq('track_id', trackId)
      .single();

    console.log('Find track result:', { existingTrack, findError });

    if (findError) {
      console.error('Error finding track:', findError);
      return NextResponse.json(
        { error: 'Error finding track in playlist' },
        { status: 500 }
      );
    }

    if (!existingTrack) {
      console.log('Track not found in playlist');
      return NextResponse.json(
        { error: 'Track not found in playlist' },
        { status: 404 }
      );
    }

    // Remove track from playlist_tracks table
    console.log('Track found, executing delete...');
    const { data, error } = await supabase
      .from('playlist_tracks')
      .delete()
      .eq('playlist_id', playlistId)
      .eq('track_id', trackId)

    console.log('Supabase delete result:', { data, error })

    if (error) {
      console.error('Error removing track from playlist:', error)
      return NextResponse.json(
        { error: 'Failed to remove track from playlist', details: error },
        { status: 500 }
      )
    }

    console.log('Successfully deleted track from playlist');
    console.log('==== DELETE ENDPOINT END ====');

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing track from playlist:', error)
    return NextResponse.json(
      { error: 'Failed to remove track from playlist' },
      { status: 500 }
    )
  }
}
