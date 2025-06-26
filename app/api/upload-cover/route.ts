import { writeFile } from 'fs/promises'
import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs/promises'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const album_id = formData.get('album_id') as string

    if (!file || !album_id) {
      return NextResponse.json({ error: 'File and album_id are required' }, { status: 400 })
    }

    // Create images directory if it doesn't exist
    const imagesDir = path.join(process.cwd(), 'public', 'images', 'covers')
    await fs.mkdir(imagesDir, { recursive: true })

    // Generate unique filename
    const ext = path.extname(file.name)
    const filename = `${album_id}-cover${ext}`
    const filepath = path.join(imagesDir, filename)

    // Convert File to Buffer and save
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filepath, buffer)

    // Update albums.json
    const albumsPath = path.join(process.cwd(), 'lib', 'albums.json')
    const albumsContent = await fs.readFile(albumsPath, 'utf-8')
    const albumsData = JSON.parse(albumsContent)

    // Find and update the album
    const album = albumsData.albums.find((a: any) => 
      a.original_album_name.toLowerCase().replace(/\s+/g, '-') === album_id
    )
    if (album) {
      album.coverImage = `/images/covers/${filename}`
      await fs.writeFile(albumsPath, JSON.stringify(albumsData, null, 2))
    }

    return NextResponse.json({ 
      message: 'Cover image uploaded successfully',
      coverImage: `/images/covers/${filename}`
    })
  } catch (error) {
    console.error('Error uploading cover:', error)
    return NextResponse.json({ error: 'Failed to upload cover image' }, { status: 500 })
  }
}
