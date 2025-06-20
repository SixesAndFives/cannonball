import ffmpeg from 'fluent-ffmpeg'
import { promises as fs } from 'fs'
import path from 'path'
import os from 'os'
import { randomUUID } from 'crypto'

export async function generateVideoThumbnail(videoBuffer: Buffer): Promise<Buffer | null> {
  try {
    // Create temporary files
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'video-thumb-'))
    const videoPath = path.join(tempDir, 'input.mp4')
    const thumbnailPath = path.join(tempDir, 'thumbnail.jpg')

    // Write video buffer to temp file
    await fs.writeFile(videoPath, videoBuffer)

    // Generate thumbnail
    await new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .screenshots({
          timestamps: ['1'], // Take screenshot at 1 second
          filename: 'thumbnail.jpg',
          folder: tempDir,
          size: '1280x720' // 16:9 aspect ratio, HD quality
        })
        .on('end', resolve)
        .on('error', reject)
    })

    // Read the thumbnail
    const thumbnailBuffer = await fs.readFile(thumbnailPath)

    // Clean up temp files
    await fs.rm(tempDir, { recursive: true, force: true })

    return thumbnailBuffer
  } catch (error) {
    console.error('Error generating video thumbnail:', error)
    return null
  }
}
