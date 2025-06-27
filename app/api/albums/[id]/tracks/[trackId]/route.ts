import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/server'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; trackId: string }> }
) {
  try {
    const { id, trackId } = await params
    const album_id = decodeURIComponent(id)
    const decodedTrackId = decodeURIComponent(trackId)
    
    // Delete the track from Supabase
    const { error } = await supabase
      .from('tracks')
      .delete()
      .eq('id', decodedTrackId)
      .eq('album_id', album_id)
    
    if (error) {
      console.error('Error deleting track:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting track:', error)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ error: 'Failed to delete track' }, { status: 500 })
  }
}
  }
}
