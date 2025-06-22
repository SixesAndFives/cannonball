import { promises as fs } from 'fs'
import path from 'path'
import { randomUUID } from 'crypto'
import { generateVideoThumbnail } from './video-utils'
const B2 = require('backblaze-b2')

const galleryPath = path.join(process.cwd(), 'lib', 'gallery.json')

import type { GalleryItem as BaseGalleryItem } from './types'

type GalleryItemInternal = Omit<BaseGalleryItem, 'title' | 'uploadedBy' | 'timestamp'> & {
  fileName: string
  contentType: string
  uploadTimestamp: number
}

export type GalleryItem = GalleryItemInternal

export interface GalleryData {
  items: GalleryItem[]
}

const b2 = new B2({
  applicationKeyId: process.env.B2_APPLICATION_KEY_ID!,
  applicationKey: process.env.B2_APPLICATION_KEY!
})

async function writeGalleryData(data: GalleryData): Promise<void> {
  await fs.writeFile(galleryPath, JSON.stringify(data, null, 2))
}

export async function readGalleryData(): Promise<GalleryData> {
  try {
    const data = await fs.readFile(galleryPath, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading gallery.json:', error)
    return { items: [] }
  }
}

export async function uploadGalleryItem(
  file: Buffer,
  fileName: string,
  contentType: string,
  albumId: string,
  caption: string,
  taggedUsers: string[] = []
): Promise<GalleryItem> {
  try {
    // Authenticate with B2
    await b2.authorize()

    // Get upload URL
    const uploadUrlResponse = await b2.getUploadUrl({
      bucketId: process.env.B2_BUCKET_ID!
    })

    // Generate a unique filename to avoid collisions
    const uniqueFileName = `Images/${randomUUID()}-${fileName}`
    const uploadFileName = uniqueFileName

    // Initialize thumbnailUrl
    let thumbnailUrl: string | undefined = undefined
    console.log('Starting upload process for:', fileName)

    // If this is a video, generate and upload thumbnail
    if (contentType.startsWith('video/')) {
      console.log('Video detected, generating thumbnail...')
      const thumbnailBuffer = await generateVideoThumbnail(file)
      console.log('Thumbnail buffer received:', thumbnailBuffer ? 'yes' : 'no')
      if (thumbnailBuffer) {
        console.log('Thumbnail generated successfully, attempting upload...')
        // Get fresh upload URL for thumbnail
        const thumbnailUploadUrlResponse = await b2.getUploadUrl({
          bucketId: process.env.B2_BUCKET_ID!
        })

        const thumbnailFileName = `thumbnails/${randomUUID()}.jpg`
        const thumbnailUploadResponse = await b2.uploadFile({
          uploadUrl: thumbnailUploadUrlResponse.data.uploadUrl,
          uploadAuthToken: thumbnailUploadUrlResponse.data.authorizationToken,
          fileName: thumbnailFileName,
          data: thumbnailBuffer,
          contentType: 'image/jpeg'
        })
        console.log('Thumbnail uploaded successfully')
        console.log('Thumbnail upload response:', thumbnailUploadResponse)
        thumbnailUrl = `https://f004.backblazeb2.com/file/cannonball-music/${thumbnailFileName}`
        console.log('Set thumbnailUrl to:', thumbnailUrl)
      }
    }

    // Upload to B2
    const uploadResponse = await b2.uploadFile({
      uploadUrl: uploadUrlResponse.data.uploadUrl,
      uploadAuthToken: uploadUrlResponse.data.authorizationToken,
      fileName: uniqueFileName,
      data: file,
      contentLength: file.length,
      contentType
    })

    // Get the item ID now so we can use it for the thumbnail filename
    const itemId = randomUUID()

    // If this is a video, generate and upload thumbnail
    if (contentType.startsWith('video/')) {
      console.log('Video detected, generating thumbnail...')
      const thumbnailBuffer = await generateVideoThumbnail(file)
      console.log('Thumbnail buffer received:', thumbnailBuffer ? 'yes' : 'no')
      if (thumbnailBuffer) {
        console.log('Thumbnail generated successfully, attempting upload...')
        // Get fresh upload URL for thumbnail
        const thumbnailUploadUrlResponse = await b2.getUploadUrl({
          bucketId: process.env.B2_BUCKET_ID!
        })

        const thumbnailFileName = `thumbnails/${itemId}.jpg`
        await b2.uploadFile({
          uploadUrl: thumbnailUploadUrlResponse.data.uploadUrl,
          uploadAuthToken: thumbnailUploadUrlResponse.data.authorizationToken,
          fileName: thumbnailFileName,
          data: thumbnailBuffer,
          contentType: 'image/jpeg'
        })
        console.log('Thumbnail uploaded successfully')
        thumbnailUrl = `https://f004.backblazeb2.com/file/cannonball-music/${thumbnailFileName}`
        console.log('Set thumbnailUrl to:', thumbnailUrl)
      }
    }

    // Create gallery item
    const newItem: GalleryItem = {
      id: itemId,
      albumId,
      type: contentType.startsWith('video/') ? 'video' : 'image',
      url: `https://f004.backblazeb2.com/file/cannonball-music/${uniqueFileName}`,
      ...(thumbnailUrl && { thumbnailUrl }),
      caption,
      fileName: uniqueFileName,
      contentType,
      uploadTimestamp: Date.now(),
      taggedUsers
    }

    // Add to gallery.json
    const gallery = await readGalleryData()
    gallery.items.push(newItem)
    await fs.writeFile(galleryPath, JSON.stringify(gallery, null, 2))

    return newItem
  } catch (error) {
    console.error('Error uploading to B2:', error)
    throw error
  }
}

export async function addGalleryItem(item: Omit<GalleryItem, 'id'>): Promise<GalleryItem> {
  const gallery = await readGalleryData()
  const newItem: GalleryItem = {
    ...item,
    id: randomUUID()
  }
  
  gallery.items.push(newItem)
  await fs.writeFile(galleryPath, JSON.stringify(gallery, null, 2))
  
  return newItem
}

export async function getAlbumGallery(albumId: string): Promise<BaseGalleryItem[]> {
  const data = await readGalleryData()
  return data.items
    .filter(item => item.albumId === albumId)
    .map(item => ({
      ...item,
      title: item.fileName,
      uploadedBy: 'system', // TODO: Add real user tracking
      timestamp: new Date(item.uploadTimestamp).toISOString()
    }))
}

export const getGalleryItemsByAlbum = getAlbumGallery

export async function getAllGalleryItems(): Promise<BaseGalleryItem[]> {
  const data = await readGalleryData()
  return data.items.map(item => ({
    ...item,
    title: item.fileName,
    uploadedBy: 'system', // TODO: Add real user tracking
    timestamp: new Date(item.uploadTimestamp).toISOString()
  }))
}

export async function deleteGalleryItem(itemId: string): Promise<boolean> {
  const gallery = await readGalleryData()
  const index = gallery.items.findIndex(item => item.id === itemId)
  
  if (index === -1) {
    return false
  }
  
  gallery.items.splice(index, 1)
  await writeGalleryData(gallery)
  return true
}

export async function updateGalleryItem(
  itemId: string,
  updates: Partial<Omit<GalleryItem, 'id' | 'albumId' | 'url'>>
): Promise<GalleryItem | null> {
  const gallery = await readGalleryData()
  const index = gallery.items.findIndex(item => item.id === itemId)
  
  if (index === -1) {
    return null
  }
  
  gallery.items[index] = {
    ...gallery.items[index],
    ...updates
  }
  
  await writeGalleryData(gallery)
  return gallery.items[index]
}
