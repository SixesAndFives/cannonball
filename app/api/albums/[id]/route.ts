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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const formData = await request.formData()
    
    const updates: Record<string, any> = {}
    if (formData.has('title')) updates.title = formData.get('title')
    if (formData.has('year')) updates.year = formData.get('year')
    
    // Handle cover image upload if provided
    if (formData.has('cover_image')) {
      const file = formData.get('cover_image') as File
      const buffer = Buffer.from(await file.arrayBuffer())
      const fs = require('fs')
      const path = require('path')
      
      // Save to public/images with the album ID
      const imagePath = path.join(process.cwd(), 'public', 'images', `${id}-cover.jpg`)
      await fs.promises.writeFile(imagePath, buffer)
      
      // Update the cover_image path in the database
      updates.cover_image = `/images/${id}-cover.jpg`
    }

    // Update album in database
    const { data: album, error } = await supabase
      .from('albums')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        tracks (id, title, duration, audio_url, artist, year, bitrate, sample_rate, channels, lossless)
      `)
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
