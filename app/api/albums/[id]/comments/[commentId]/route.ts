import { NextResponse } from 'next/server'
import { readFileSync, writeFileSync } from 'fs'
import path from 'path'
import type { Album, Comment } from '@/lib/types'

const ALBUMS_PATH = path.join(process.cwd(), 'lib/albums.json')

// Helper function to read albums
function readAlbums(): { albums: Album[] } {
  const content = readFileSync(ALBUMS_PATH, 'utf-8')
  return JSON.parse(content)
}

// Helper function to write albums
function writeAlbums(data: { albums: Album[] }) {
  writeFileSync(ALBUMS_PATH, JSON.stringify(data, null, 2))
}

// DELETE /api/albums/[id]/comments/[commentId]
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  try {
    const { id, commentId } = await params
    const data = readAlbums()
    const albumIndex = data.albums.findIndex((a: Album) => a.id === id)
    
    if (albumIndex === -1) {
      return NextResponse.json({ error: 'Album not found' }, { status: 404 })
    }

    const album = data.albums[albumIndex]
    if (!album.comments) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
    }

    const commentIndex = album.comments.findIndex((c: Comment) => c.id === commentId)
    if (commentIndex === -1) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
    }

    // Remove the comment
    album.comments.splice(commentIndex, 1)
    writeAlbums(data)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting comment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
