import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import fetch from 'node-fetch'
import { generateVideoThumbnail } from '../lib/video-utils'
import { B2 } from 'backblaze-b2'
import type { GalleryItem } from '../lib/types'

const b2 = new B2({
  applicationKeyId: process.env.B2_APPLICATION_KEY_ID!,
  applicationKey: process.env.B2_APPLICATION_KEY!
})

async function generateThumbnailsForExistingVideos() {
  // Read gallery.json
  const galleryPath = join(process.cwd(), 'lib', 'gallery.json')
  const galleryData = JSON.parse(readFileSync(galleryPath, 'utf-8'))

  // Authenticate with B2
  await b2.authorize()

  // Find all video items without thumbnails
  const videoItems = galleryData.items.filter(
    (item: GalleryItem) => item.type === 'video' && !item.thumbnail_url
  )

  console.log(`Found ${videoItems.length} videos without thumbnails`)

  for (const item of videoItems) {
    try {
      console.log(`Processing video: ${item.fileName}`)

      // Download video from B2
      const response = await fetch(item.url)
      const videoBuffer = Buffer.from(await response.arrayBuffer())

      // Generate thumbnail
      const thumbnailBuffer = await generateVideoThumbnail(videoBuffer)
      
      if (!thumbnailBuffer) {
        console.error(`Failed to generate thumbnail for ${item.fileName}`)
        continue
      }

      // Upload thumbnail to B2
      const uploadUrlResponse = await b2.getUploadUrl({
        bucketId: process.env.B2_BUCKET_ID!
      })

      const thumbnailFileName = `thumbnails/${item.id}.jpg`
      
      const uploadResponse = await b2.uploadFile({
        uploadUrl: uploadUrlResponse.data.uploadUrl,
        uploadAuthToken: uploadUrlResponse.data.authorizationToken,
        fileName: thumbnailFileName,
        data: thumbnailBuffer,
        contentType: 'image/jpeg'
      })

      // Update gallery.json with thumbnail URL
      item.thumbnailUrl = `https://f004.backblazeb2.com/file/cannonball-music/${thumbnailFileName}`

      console.log(`Successfully processed ${item.fileName}`)
    } catch (error) {
      console.error(`Error processing ${item.fileName}:`, error)
    }
  }

  // Save updated gallery.json
  writeFileSync(galleryPath, JSON.stringify(galleryData, null, 2))
  console.log('Finished processing videos')
}

// Run the script
generateThumbnailsForExistingVideos().catch(console.error)
