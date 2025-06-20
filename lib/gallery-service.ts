import { promises as fs } from 'fs'
import path from 'path'
import { randomUUID } from 'crypto'
const B2 = require('backblaze-b2')

const galleryPath = path.join(process.cwd(), 'lib', 'gallery.json')

export interface GalleryItem {
  id: string
  albumId: string
  type: 'image' | 'video'
  url: string
  caption: string
  fileName: string
  contentType: string
  uploadTimestamp: number
}

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
  caption: string
): Promise<GalleryItem> {
  try {
    // Authenticate with B2
    await b2.authorize()

    // Get upload URL
    const uploadUrl = await b2.getUploadUrl({
      bucketId: process.env.B2_BUCKET_ID!
    })

    // Generate a unique filename to avoid collisions
    const uniqueFileName = `Images/${randomUUID()}-${fileName}`

    // Upload file
    const uploadResult = await b2.uploadFile({
      uploadUrl: uploadUrl.data.uploadUrl,
      uploadAuthToken: uploadUrl.data.authorizationToken,
      fileName: uniqueFileName,
      data: file,
      contentLength: file.length,
      contentType
    })

    // Create gallery item
    const item: GalleryItem = {
      id: randomUUID(),
      albumId,
      type: contentType.startsWith('image/') ? 'image' : 'video',
      url: `https://f004.backblazeb2.com/file/cannonball-music/${uniqueFileName}`,
      caption,
      fileName: uniqueFileName,
      contentType,
      uploadTimestamp: Date.now()
    }

    // Add to gallery.json
    const gallery = await readGalleryData()
    gallery.items.push(item)
    await fs.writeFile(galleryPath, JSON.stringify(gallery, null, 2))

    return item
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

export async function getAlbumGallery(albumId: string): Promise<GalleryItem[]> {
  const gallery = await readGalleryData()
  return gallery.items.filter(item => item.albumId === albumId)
}

export const getGalleryItemsByAlbum = getAlbumGallery

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
