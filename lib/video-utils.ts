import ffmpeg from 'fluent-ffmpeg'
import { promises as fs } from 'fs'
import path from 'path'
import os from 'os'
import { randomUUID } from 'crypto'

export async function generateVideoThumbnail(videoBuffer: Buffer): Promise<Buffer | null> {
  let tempDir = ''
  try {
    // Create temporary files
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'video-thumb-'))
    await fs.mkdir(tempDir, { recursive: true }) // Ensure directory exists
    const videoPath = path.join(tempDir, 'input.mp4')
    const thumbnailPath = path.join(tempDir, 'thumbnail.jpg')

    // Write video buffer to temp file
    await fs.writeFile(videoPath, videoBuffer)

    console.log('Starting thumbnail generation...')
    // Generate thumbnail
    await new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .on('start', (cmd) => console.log('Started ffmpeg with command:', cmd))
        .on('end', resolve)
        .on('error', reject)
        .screenshots({
          timestamps: [1],
          filename: 'thumbnail.jpg',
          folder: tempDir
        })
    })

    // Read the thumbnail
    const thumbnailBuffer = await fs.readFile(thumbnailPath)
    console.log(`Generated thumbnail size: ${thumbnailBuffer.length} bytes`)

    // Clean up temp files
    if (tempDir) {
      await fs.rm(tempDir, { recursive: true, force: true })
    }

    return thumbnailBuffer
  } catch (error) {
    console.error('Error generating video thumbnail:', error)
    return null
  } finally {
    // Ensure cleanup happens even if there's an error
    if (tempDir) {
      try {
        await fs.rm(tempDir, { recursive: true, force: true })
      } catch (cleanupError) {
        console.error('Error cleaning up temp directory:', cleanupError)
      }
    }
  }
}
