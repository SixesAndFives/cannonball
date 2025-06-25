import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/server'
import { v4 as uuidv4 } from 'uuid'
import type { Comment } from '@/lib/types'

// GET /api/albums/[id]/comments
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { data: album, error } = await supabase
      .from('albums')
      .select('comments')
      .eq('id', id)
      .single()

    if (error) throw error

    return NextResponse.json(album?.comments || [])
  } catch (error) {
    console.error('Error getting comments:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/albums/[id]/comments
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { author, content, userId, profileImage } = await request.json()
    
    if (!author || !content) {
      return NextResponse.json(
        { error: 'Author and content are required' },
        { status: 400 }
      )
    }

    const newComment: Comment = {
      id: uuidv4(),
      author,
      content,
      user_id: userId,
      profile_image: profileImage || null,
      created_at: new Date().toISOString()
    }

    // First get the current comments
    const { data: album, error: fetchError } = await supabase
      .from('albums')
      .select('comments')
      .eq('id', id)
      .single()

    if (fetchError) throw fetchError

    const currentComments = album?.comments || []

    // Update with new comment
    const { data: updatedAlbum, error: updateError } = await supabase
      .from('albums')
      .update({
        comments: [...currentComments, newComment]
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) throw updateError

    return NextResponse.json(newComment)
  } catch (error) {
    console.error('Error creating comment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

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

    const currentComments = album?.comments || []
    
    // Filter out the comment to delete
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

