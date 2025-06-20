import { NextResponse } from 'next/server'
import { deleteGalleryItem, updateGalleryItem } from '@/lib/gallery-service'
import { deleteFromB2 } from '@/lib/b2-image-client'

// DELETE /api/albums/[id]/gallery/[itemId]
export async function DELETE(
  request: Request,
  { params }: { params: { id: string; itemId: string } }
) {
  try {
    // Delete from gallery.json
    const deleted = await deleteGalleryItem(params.itemId)
    if (!deleted) {
      return NextResponse.json(
        { error: 'Gallery item not found' },
        { status: 404 }
      )
    }

    // Delete from B2
    // Note: We extract the filename from the full URL
    const url = request.headers.get('x-file-url')
    if (url) {
      const fileName = url.split('/file/cannonball-music/')[1]
      await deleteFromB2(fileName)
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
  { params }: { params: { id: string; itemId: string } }
) {
  try {
    const updates = await request.json()
    
    // Only allow updating title, caption, and taggedUsers
    const allowedUpdates = {
      title: updates.title,
      caption: updates.caption,
      taggedUsers: updates.taggedUsers
    }
    
    const updated = await updateGalleryItem(params.itemId, allowedUpdates)
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
