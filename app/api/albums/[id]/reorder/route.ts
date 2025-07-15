import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { supabase } from '@/lib/supabase/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const updates = await request.json()

    // Validate request body
    if (!Array.isArray(updates)) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }

    console.log('=== Server Reorder Request ===');
    console.log('Album ID:', id);
    console.log('Updates received:', updates);

    // First get all affected tracks
    const { data: tracks, error: fetchError } = await supabase
      .from('tracks')
      .select('id, position, title')
      .eq('album_id', id)
      .order('position');
    
    console.log('Current tracks:', tracks?.map(t => ({ id: t.id, title: t.title, position: t.position })));

    if (fetchError) {
      console.error('Error fetching tracks:', fetchError)
      throw new Error('Failed to reorder tracks')
    }

    // Create a temporary position mapping to avoid conflicts
    const tempPositions = tracks.map((track, i) => ({
      id: track.id,
      position: i + 1000 // Use high numbers temporarily to avoid conflicts
    }));

    console.log('Temporary positions:', tempPositions);

    console.log('=== Updating to temporary positions ===');
    // First update to temp positions
    for (const temp of tempPositions) {
      console.log(`Updating track ${temp.id} to temp position ${temp.position}`);
      const { error } = await supabase
        .from('tracks')
        .update({ position: temp.position })
        .eq('id', temp.id)
        .eq('album_id', id);

      if (error) {
        console.error('Error updating to temp positions:', error)
        throw new Error('Failed to reorder tracks')
      }
    }

    console.log('=== Updating to final positions ===');
    // Then update to final positions
    for (const update of updates) {
      console.log(`Updating track ${update.id} to final position ${update.position}`);
      const { error } = await supabase
        .from('tracks')
        .update({ position: update.position })
        .eq('id', update.id)
        .eq('album_id', id);

      if (error) {
        console.error('Error updating to final positions:', error)
        throw new Error('Failed to reorder tracks')
      }
    }

    // Revalidate the album page
    revalidatePath(`/albums/${id}`)

    return NextResponse.json({ message: 'Tracks reordered successfully' })
  } catch (error) {
    console.error('Error in reorder tracks route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
