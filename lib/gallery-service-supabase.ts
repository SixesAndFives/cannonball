import { randomUUID } from 'crypto'
import { generateVideoThumbnail } from './video-utils'
import { supabase } from './supabase/server'
const B2 = require('backblaze-b2')

const b2 = new B2({
  applicationKeyId: process.env.B2_APPLICATION_KEY_ID!,
  applicationKey: process.env.B2_APPLICATION_KEY!
})

export interface GalleryItem {
  id: string
  album_id: string
  type: 'image' | 'video'
  url: string
  thumbnail_url?: string
  title: string
  caption: string
  tagged_users: string[]
  uploaded_by: string
  created_at: string
  file_name: string
  content_type: string
}

export async function uploadGalleryItem(
  file: Buffer,
  fileName: string,
  contentType: string,
  albumId: string,
  caption: string,
  taggedUsers: string[] = [],
  uploadedBy: string
): Promise<GalleryItem> {
  try {
    // Initialize B2
    await b2.authorize()

    // Get upload URL and auth token
    const { data: { uploadUrl, authorizationToken } } = await b2.getUploadUrl({
      bucketId: process.env.B2_BUCKET_ID
    })

    // Generate unique filename
    const uniqueFileName = `${randomUUID()}-${fileName}`
    const b2FileName = `Images/${uniqueFileName}`

    // Upload file to B2
    await b2.uploadFile({
      uploadUrl,
      uploadAuthToken: authorizationToken,
      fileName: b2FileName,
      data: file,
      contentType,
      onUploadProgress: (event: any) => {
        const percentComplete = (event.loaded / event.total) * 100
        console.log(`Upload progress: ${percentComplete}%`)
      }
    })

    // Construct file URL using B2 bucket URL and file path
    const downloadUrl = `https://f004.backblazeb2.com/file/cannonball-music/${b2FileName}`

    // Generate thumbnail for videos
    let thumbnailUrl = undefined
    if (contentType.startsWith('video/')) {
      try {
        const thumbnail = await generateVideoThumbnail(file)
        if (thumbnail) {
          const thumbnailFileName = `thumbnails/${uniqueFileName}.jpg`
          await b2.uploadFile({
            uploadUrl,
            uploadAuthToken: authorizationToken,
            fileName: thumbnailFileName,
            data: thumbnail,
            contentType: 'image/jpeg'
          })
          thumbnailUrl = `https://f004.backblazeb2.com/file/cannonball-music/${thumbnailFileName}`
        }
      } catch (error) {
        console.error('Error generating thumbnail:', error)
      }
    }

    const newItem: GalleryItem = {
      id: randomUUID(),
      album_id: albumId,
      type: contentType.startsWith('video/') ? 'video' : 'image',
      url: downloadUrl,
      thumbnail_url: thumbnailUrl,
      title: fileName,
      caption,
      tagged_users: taggedUsers,
      uploaded_by: uploadedBy,
      created_at: new Date().toISOString(),
      file_name: fileName,
      content_type: contentType
    }

    // Get current gallery items
    const { data: album, error: fetchError } = await supabase
      .from('albums')
      .select('gallery')
      .eq('id', albumId)
      .single()

    if (fetchError) throw fetchError

    const currentGallery = album?.gallery || []
    
    // Update album with new gallery item
    const { error: updateError } = await supabase
      .from('albums')
      .update({
        gallery: [...currentGallery, newItem]
      })
      .eq('id', albumId)

    if (updateError) throw updateError

    return newItem
  } catch (error) {
    console.error('Error uploading gallery item:', error)
    throw error
  }
}

export async function getAlbumGallery(albumId: string): Promise<GalleryItem[]> {
  const { data: album, error } = await supabase
    .from('albums')
    .select('gallery')
    .eq('id', albumId)
    .single()

  if (error) throw error
  return album?.gallery || []
}

export async function deleteGalleryItem(albumId: string, itemId: string): Promise<boolean> {
  try {
    // Get album gallery data
    const { data: album, error: getError } = await supabase
      .from('albums')
      .select('gallery')
      .eq('id', albumId)
      .single()

    if (getError) throw getError
    if (!album?.gallery) return false

    // Find the item to delete
    const item = album.gallery.find((i: GalleryItem) => i.id === itemId)
    if (!item) return false

    // Initialize B2
    await b2.authorize()

    // Delete file from B2
    const fileName = item.url.split('/').pop()
    if (fileName) {
      try {
        await b2.deleteFileVersion({
          fileName: `Images/${fileName}`,
          fileId: fileName
        })
      } catch (error) {
        console.error('Error deleting file from B2:', error)
        // Continue even if B2 deletion fails
      }
    }

    // Delete thumbnail if it exists
    if (item.thumbnail_url) {
      const thumbName = item.thumbnail_url.split('/').pop()
      if (thumbName) {
        try {
          await b2.deleteFileVersion({
            fileName: `thumbnails/${thumbName}`,
            fileId: thumbName
          })
        } catch (error) {
          console.error('Error deleting thumbnail from B2:', error)
          // Continue even if thumbnail deletion fails
        }
      }
    }

    // Update gallery array in Supabase
    const { error: updateError } = await supabase
      .from('albums')
      .update({
        gallery: album.gallery.filter((i: GalleryItem) => i.id !== itemId)
      })
      .eq('id', albumId)

    if (updateError) throw updateError

    return true
  } catch (error) {
    console.error('Error deleting gallery item:', error)
    throw error
  }
}

export async function updateGalleryItem(
  albumId: string,
  itemId: string,
  updates: Partial<Pick<GalleryItem, 'caption' | 'tagged_users'>>
): Promise<GalleryItem | null> {
  try {
    // Get album gallery data
    const { data: album, error: getError } = await supabase
      .from('albums')
      .select('gallery')
      .eq('id', albumId)
      .single()

    if (getError) throw getError
    if (!album?.gallery) return null

    // Find and update the item
    const updatedGallery = album.gallery.map((item: GalleryItem) => {
      if (item.id === itemId) {
        return { ...item, ...updates }
      }
      return item
    })

    // Update the gallery in Supabase
    const { error: updateError } = await supabase
      .from('albums')
      .update({ gallery: updatedGallery })
      .eq('id', albumId)

    if (updateError) throw updateError

    // Return the updated item
    return updatedGallery.find((item: GalleryItem) => item.id === itemId) || null
  } catch (error) {
    console.error('Error updating gallery item:', error)
    throw error
  }
}

export const getGalleryItemsByAlbum = getAlbumGallery

export async function getAllGalleryItems(): Promise<GalleryItem[]> {
  const { data: albums, error } = await supabase
    .from('albums')
    .select('gallery')
    .not('gallery', 'is', null)

  if (error) throw error

  // Flatten all gallery arrays into a single array
  const allItems = albums
    .flatMap(album => album.gallery || [])
    .filter(item => item) // Remove any null/undefined items
    .sort((a: GalleryItem, b: GalleryItem) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

  return allItems
}
