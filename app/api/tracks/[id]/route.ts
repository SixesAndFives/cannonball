import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/server'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { title } = await request.json()

    // Update the track title
    const { data: track, error } = await supabase
      .from('tracks')
      .update({ title })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    if (!track) {
      return NextResponse.json(
        { error: 'Track not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(track)
  } catch (error) {
    console.error('Error updating track:', error)
    return NextResponse.json(
      { error: 'Failed to update track' },
      { status: 500 }
    )
  }
}
