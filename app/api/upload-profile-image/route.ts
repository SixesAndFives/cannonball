import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const userId = formData.get('userId') as string

    if (!file || !userId) {
      return NextResponse.json(
        { error: 'File and userId are required' },
        { status: 400 }
      )
    }

    // Convert the file to a buffer
    const buffer = Buffer.from(await file.arrayBuffer())
    
    // Create the public/images directory if it doesn't exist
    const imagesDir = path.join(process.cwd(), 'public', 'images')
    
    // Save the file with the username as the filename
    const filePath = path.join(imagesDir, `${userId}.jpg`)
    await writeFile(filePath, buffer)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json(
      { error: 'Error uploading file' },
      { status: 500 }
    )
  }
}
