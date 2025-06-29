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
    console.error('\n[API] ====== PATCH Request Start ======')
    console.error('[API] Album ID:', id)
    console.error('[API] Item ID:', itemId)
    
    const updates = await request.json()
    console.error('[API] Updates:', JSON.stringify(updates, null, 2))
    
    // Pass through updates (conversion happens in service)
    console.error('[API] Calling updateGalleryItem...')
    const updated = await updateGalleryItem(id, itemId, updates)
    
    if (!updated) {
      console.error('[API] Gallery item not found')
      return NextResponse.json(
        { error: 'Gallery item not found' },
        { status: 404 }
      )
    }
    
    console.error('[API] Successfully updated item:', JSON.stringify(updated, null, 2))
    console.error('[API] ====== PATCH Request End ======\n')
    return NextResponse.json(updated)
  } catch (error) {
    console.error('[API] Error updating gallery item:', error)
    return NextResponse.json(
      { error: 'Failed to update gallery item' },
      { status: 500 }
    )
  }
}
