import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/server'
import type { Album, Comment } from '@/lib/types'

// DELETE /api/albums/[id]/comments/[commentId]
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  try {
    const { id, commentId } = await params

    // Get current comments
    const { data: album, error: fetchError } = await supabase
      .from('albums')
      .select('comments')
      .eq('id', id)
      .single()

    if (fetchError) throw fetchError
    if (!album) {
      return NextResponse.json({ error: 'Album not found' }, { status: 404 })
    }

    const currentComments = album.comments || []
    const updatedComments = currentComments.filter(
      (comment: Comment) => comment.id !== commentId
    )

    // Update the album with filtered comments
    const { error: updateError } = await supabase
      .from('albums')
      .update({
        comments: updatedComments
      })
      .eq('id', id)

    if (updateError) throw updateError

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting comment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
