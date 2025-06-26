import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const { album_id, trackId } = await request.json()
    console.log('DELETE TRACK - Request received:', { album_id, trackId })
    
    // Verify track exists before deletion
    const { data: track, error: findError } = await supabase
      .from('tracks')
      .select('*')
      .eq('id', trackId)
      .eq('album_id', album_id)
      .single()
    
    if (findError || !track) {
      console.error('DELETE TRACK - Track not found:', { trackId, album_id, error: findError })
      return NextResponse.json({ error: 'Track not found' }, { status: 404 })
    }

    console.log('DELETE TRACK - Found track:', track)
    
    // Delete the track from Supabase
    const { error: deleteError } = await supabase
      .from('tracks')
      .delete()
      .eq('id', trackId)
      .eq('album_id', album_id)
    
    if (deleteError) {
      console.error('DELETE TRACK - Supabase error:', deleteError)
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }
    
    console.log('DELETE TRACK - Success: track deleted from database')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE TRACK - Unexpected error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
