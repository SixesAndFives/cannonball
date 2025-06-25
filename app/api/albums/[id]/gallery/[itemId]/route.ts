import { NextResponse } from 'next/server'
import { deleteGalleryItem, updateGalleryItem } from '@/lib/gallery-service-supabase'

// DELETE /api/albums/[id]/gallery/[itemId]
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const { id, itemId } = await params
    const deleted = await deleteGalleryItem(id, itemId)
    if (!deleted) {
      return NextResponse.json(
        { error: 'Gallery item not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting gallery item:', error)
    return NextResponse.json(
      { error: 'Failed to delete gallery item' },
      { status: 500 }
    )
  }
}

// PATCH /api/albums/[id]/gallery/[itemId]
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const { id, itemId } = await params
    const updates = await request.json()
    
    // Only allow updating caption and tagged_users
    const allowedUpdates = {
      caption: updates.caption,
      tagged_users: updates.taggedUsers // Convert from client-side name to server-side name
    }
    
    const updated = await updateGalleryItem(id, itemId, allowedUpdates)
    if (!updated) {
      return NextResponse.json(
        { error: 'Gallery item not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating gallery item:', error)
    return NextResponse.json(
      { error: 'Failed to update gallery item' },
      { status: 500 }
    )
  }
}
