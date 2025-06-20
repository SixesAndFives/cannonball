import { NextResponse } from 'next/server'
import { readFileSync, writeFileSync } from 'fs'
import { v4 as uuidv4 } from 'uuid'
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

// GET /api/albums/[id]/comments
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = readAlbums()
    const album = data.albums.find(a => a.id === params.id)
    
    if (!album) {
      return NextResponse.json({ error: 'Album not found' }, { status: 404 })
    }

    return NextResponse.json(album.comments || [])
  } catch (error) {
    console.error('Error getting comments:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/albums/[id]/comments
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { author, content, userId, profileImage } = await request.json()
    
    if (!author || !content) {
      return NextResponse.json({ error: 'Author and content are required' }, { status: 400 })
    }

    const data = readAlbums()
    const albumIndex = data.albums.findIndex((a: Album) => a.id === params.id)
    
    if (albumIndex === -1) {
      return NextResponse.json({ error: 'Album not found' }, { status: 404 })
    }

    const newComment: Comment = {
      id: uuidv4(),
      author,
      content,
      timestamp: new Date().toISOString(),
      userId,
      profileImage
    }

    // Initialize comments array if it doesn't exist
    if (!data.albums[albumIndex].comments) {
      data.albums[albumIndex].comments = []
    }

    data.albums[albumIndex].comments!.push(newComment)
    writeAlbums(data)

    return NextResponse.json(newComment)
  } catch (error) {
    console.error('Error creating comment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


