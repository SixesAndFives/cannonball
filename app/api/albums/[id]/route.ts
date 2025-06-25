import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/server'
import type { Album } from '@/lib/types'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { data: album, error } = await supabase
      .from('albums')
      .select('*, tracks(*), album_personnel(*)')
      .eq('id', id)
      .single()

    if (error) throw error
    if (!album) {
      return NextResponse.json(
        { error: 'Album not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(album)
  } catch (error) {
    console.error('Error fetching album:', error)
    return NextResponse.json(
      { error: 'Failed to fetch album' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const updatedAlbum = await request.json() as Album
    
    // Ensure the ID in the URL matches the album ID
    if (id !== updatedAlbum.id) {
      return NextResponse.json(
        { error: 'Album ID mismatch' },
        { status: 400 }
      )
    }

    // Update the album
    const { data: album, error } = await supabase
      .from('albums')
      .update({
        personnel: updatedAlbum.personnel
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    if (!album) {
      return NextResponse.json(
        { error: 'Album not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(album)
  } catch (error) {
    console.error('Error updating album:', error)
    return NextResponse.json(
      { error: 'Failed to update album' },
      { status: 500 }
    )
  }
}
