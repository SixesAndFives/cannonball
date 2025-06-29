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

    console.log(`Creating temp files in: ${tempDir}`)
    // Write video buffer to temp file
    await fs.writeFile(videoPath, videoBuffer)
    console.log(`Video buffer written to: ${videoPath} (${videoBuffer.length} bytes)`)

    console.log('Starting thumbnail generation...')
    
    // Get video metadata
    const metadata = await new Promise<any>((resolve, reject) => {
      ffmpeg.ffprobe(videoPath, (err, data) => {
        if (err) {
          console.error('Error getting video metadata:', err)
          reject(err)
          return
        }
        resolve(data)
      })
    })

    const duration = metadata.format.duration || 0
    console.log('Video duration:', duration, 'seconds')

    // Calculate timestamp at 25% of the video
    const timestamp = Math.min(1, duration * 0.25)
    console.log('Taking thumbnail at:', timestamp, 'seconds')

    // Generate thumbnail
    await new Promise<void>((resolve, reject) => {
      ffmpeg(videoPath)
        .on('start', (cmd) => console.log('Started ffmpeg with command:', cmd))
        .on('progress', (progress) => console.log('FFmpeg Progress:', progress))
        .on('end', () => {
          console.log('FFmpeg finished generating thumbnail')
          resolve()
        })
        .on('error', (err) => {
          console.error('FFmpeg error:', err)
          reject(err)
        })
        .seekInput(timestamp)  // Seek before input for better accuracy
        .inputOptions([
          '-ss 0.5'  // Additional offset to avoid black frames
        ])
        .outputOptions([
          '-frames:v 1',     // Extract one frame
          '-q:v 2',          // High quality
          '-vf',             // Video filters:
          [  // Join filters with commas
            'scale=640:360',  // Scale to target size
            'eq=brightness=0.2:contrast=1.2:saturation=1.4'  // Boost brightness and contrast
          ].join(',')
        ])
        .output(thumbnailPath)
        .run()
    })

    // Read the generated thumbnail
    const thumbnailBuffer = await fs.readFile(thumbnailPath)
    console.log(`Generated thumbnail size: ${thumbnailBuffer.length} bytes`)
    
    if (thumbnailBuffer.length === 0) {
      console.error('Generated thumbnail is empty')
      return null
    }

    return thumbnailBuffer
  } catch (error) {
    console.error('Error generating video thumbnail:', error)
    return null
  } finally {
    // Clean up temp files
    if (tempDir) {
      try {
        await fs.rm(tempDir, { recursive: true, force: true })
      } catch (cleanupError) {
        console.error('Error cleaning up temp directory:', cleanupError)
      }
    }
  }
}
