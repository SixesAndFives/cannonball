import { NextResponse } from 'next/server'
import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import fetch from 'node-fetch'
import { generateVideoThumbnail } from '@/lib/video-utils'
const B2 = require('backblaze-b2')
import type { GalleryItem } from '@/lib/types'

const galleryPath = join(process.cwd(), 'lib', 'gallery.json')

export async function POST() {
  try {
    // Read gallery.json
    const galleryData = JSON.parse(readFileSync(galleryPath, 'utf-8'))

    // Initialize B2
    const b2 = new B2({
      applicationKeyId: process.env.B2_APPLICATION_KEY_ID!,
      applicationKey: process.env.B2_APPLICATION_KEY!
    })

    // Authenticate with B2
    await b2.authorize()

    // Find all video items and clear their thumbnails
    const videoItems = galleryData.items.filter(
      (item: GalleryItem) => item.type === 'video'
    )
    
    // Clear existing thumbnails
    for (const item of videoItems) {
      if (item.thumbnailUrl) {
        try {
          // Delete thumbnail from B2
          const fileName = `thumbnails/${item.id}.jpg`
          const file = await b2.getFileInfo({
            fileName,
            bucketId: process.env.B2_BUCKET_ID!
          })
          
          await b2.deleteFileVersion({
            fileId: file.data.fileId,
            fileName: file.data.fileName
          })
        } catch (error) {
          console.error(`Error deleting thumbnail for ${item.fileName}:`, error)
        }
        // Clear thumbnail URL
        delete item.thumbnailUrl
      }
    }

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

        // Get upload URL
        const uploadUrlResponse = await b2.getUploadUrl({
          bucketId: process.env.B2_BUCKET_ID!
        })

        // Upload thumbnail to B2
        const thumbnailFileName = `thumbnails/${item.id}.jpg`
        
        await b2.uploadFile({
          uploadUrl: uploadUrlResponse.data.uploadUrl,
          uploadAuthToken: uploadUrlResponse.data.authorizationToken,
          fileName: thumbnailFileName,
          data: thumbnailBuffer,
          contentType: 'image/jpeg'
        })

        // Update item with thumbnail URL
        item.thumbnailUrl = `https://f004.backblazeb2.com/file/cannonball-music/${thumbnailFileName}`

        console.log(`Successfully processed ${item.fileName}`)
      } catch (error) {
        console.error(`Error processing ${item.fileName}:`, error)
      }
    }

    // Save updated gallery.json
    writeFileSync(galleryPath, JSON.stringify(galleryData, null, 2))

    return NextResponse.json({
      success: true,
      message: `Successfully processed ${videoItems.length} videos`
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('Error generating thumbnails:', errorMessage)
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
}
