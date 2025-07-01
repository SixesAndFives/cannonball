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
  album_id: string,
  caption: string,
  taggedUsers: string[] = [],
  uploadedBy: string,
  thumbnailBuffer?: Buffer | null
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

    // Handle thumbnail for videos
    let thumbnailUrl = undefined
    if (contentType.startsWith('video/')) {
      console.log('Processing video thumbnail...')
      if (thumbnailBuffer) {
        console.log(`Thumbnail buffer present (${thumbnailBuffer.length} bytes)`)
        try {
          const thumbnailFileName = `thumbnails/${uniqueFileName}.jpg`
          console.log('Uploading thumbnail to B2:', thumbnailFileName)
          
          // Get fresh upload URL for thumbnail
          const { data: thumbData } = await b2.getUploadUrl({
            bucketId: process.env.B2_BUCKET_ID
          })
          
          await b2.uploadFile({
            uploadUrl: thumbData.uploadUrl,
            uploadAuthToken: thumbData.authorizationToken,
            fileName: thumbnailFileName,
            data: thumbnailBuffer,
            contentType: 'image/jpeg'
          })
          
          thumbnailUrl = `https://f004.backblazeb2.com/file/cannonball-music/${thumbnailFileName}`
          console.log('Thumbnail uploaded successfully:', thumbnailUrl)
        } catch (error) {
          console.error('Error uploading thumbnail:', error)
        }
      } else {
        console.warn('No thumbnail buffer provided for video')
      }
    }

    const newItem: GalleryItem = {
      id: randomUUID(),
      album_id,
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
      .eq('id', album_id)
      .single()

    if (fetchError) throw fetchError

    const currentGallery = album?.gallery || []
    
    // Update album with new gallery item
    const { error: updateError } = await supabase
      .from('albums')
      .update({
        gallery: [...currentGallery, newItem]
      })
      .eq('id', album_id)

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
  
  // Parse and normalize gallery items to ensure snake_case
  const galleryArray = typeof album?.gallery === 'string' ? JSON.parse(album.gallery) : (album?.gallery || [])
  const normalizedGallery = galleryArray.map((item: any) => ({
    ...item,
    thumbnail_url: item.thumbnailUrl || item.thumbnail_url,
    tagged_users: item.taggedUsers || item.tagged_users,
    album_id: item.albumId || item.album_id,
    file_name: item.fileName || item.file_name,
    content_type: item.contentType || item.content_type,
    upload_timestamp: item.uploadTimestamp || item.upload_timestamp
  }))

  // Remove camelCase fields
  normalizedGallery.forEach((item: any) => {
    delete item.thumbnailUrl
    delete item.taggedUsers
    delete item.albumId
    delete item.fileName
    delete item.contentType
    delete item.uploadTimestamp
  })

  return normalizedGallery
}

export async function deleteGalleryItem(album_id: string, itemId: string): Promise<boolean> {
  try {
    // Get album gallery data
    const { data: album, error: getError } = await supabase
      .from('albums')
      .select('gallery')
      .eq('id', album_id)
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
      .eq('id', album_id)

    if (updateError) throw updateError

    return true
  } catch (error) {
    console.error('Error deleting gallery item:', error)
    throw error
  }
}

export async function updateGalleryItem(
  album_id: string,
  itemId: string,
  updates: { caption?: string; tagged_users?: string[] }
): Promise<GalleryItem | null> {
  try {
    console.error('\n[Service] ====== Update Gallery Item Start ======')
    console.error('[Service] Item ID:', itemId)
    console.error('[Service] Updates:', JSON.stringify(updates, null, 2))

    interface AlbumGallery {
      id: string;
      gallery: string | GalleryItem[];
    }

    const { data: albums, error: fetchError } = await supabase
      .from('albums')
      .select('id, gallery')
      .eq('id', album_id)
      .neq('gallery', '[]')

    if (fetchError) {
      console.error('[Service] Error fetching albums:', fetchError)
      throw fetchError
    }

    if (!albums || !albums.length) {
      console.error('[Service] No albums found')
      return null
    }

    console.error('[Service] Found', albums.length, 'albums')

    // Parse gallery JSON and find the album containing this gallery item
    let foundGallery: GalleryItem[] | null = null;
    const album = (albums as AlbumGallery[]).find(a => {
      const gallery: GalleryItem[] = typeof a.gallery === 'string' ? JSON.parse(a.gallery) : a.gallery;
      if (gallery?.some((item: GalleryItem) => item.id === itemId)) {
        foundGallery = gallery;
        return true;
      }
      return false;
    })
    
    // Use the already parsed gallery
    if (!album?.id || !foundGallery || !Array.isArray(foundGallery)) {
      console.error('[Service] Gallery item not found in any album')
      return null
    }

    // At this point we know foundGallery is a GalleryItem[]
    const albumGallery = foundGallery as GalleryItem[]
    console.error('[Service] Found item in album:', album.id)
    const currentItem = albumGallery.find((item: GalleryItem) => item.id === itemId)
    console.error('[Service] Current item state:', JSON.stringify(currentItem, null, 2))

    // Update the gallery item
    const updatedGallery = albumGallery.map((item: GalleryItem) => {
      if (item.id === itemId) {
        const updated: GalleryItem = {
          ...item,
          caption: updates.caption ?? item.caption,
          tagged_users: updates.tagged_users ?? item.tagged_users
        }
        console.error('[Service] Updated item state:', JSON.stringify(updated, null, 2))
        return updated
      }
      return item
    })

    console.error('[Service] Updating album in Supabase...')
    // Update the album
    const { error: updateError } = await supabase
      .from('albums')
      .update({ gallery: updatedGallery })
      .eq('id', album.id)

    if (updateError) {
      console.error('[Service] Error updating album:', updateError)
      throw updateError
    }

    // Return the updated item
    const updatedItem = updatedGallery.find((item: GalleryItem) => item.id === itemId)
    if (!updatedItem) {
      console.error('[Service] Updated item not found in gallery')
      return null
    }

    console.error('[Service] Successfully updated item')
    console.error('[Service] ====== Update Gallery Item End ======\n')
    return updatedItem
  } catch (error) {
    console.error('[Service] Error updating gallery item:', error)
    return null
  }
}

export const getGalleryItemsByAlbum = getAlbumGallery

export async function getAllGalleryItems(): Promise<GalleryItem[]> {
  const { data: albums, error } = await supabase
    .from('albums')
    .select('gallery')
    .not('gallery', 'is', null)

  if (error) throw error
  if (!albums) return []

  // Combine all gallery items from all albums
  const allItems: GalleryItem[] = albums.reduce((items: GalleryItem[], album) => {
    if (album.gallery) {
      // Normalize each gallery item
      const normalizedItems = album.gallery.map((item: any) => ({
        ...item,
        thumbnail_url: item.thumbnailUrl || item.thumbnail_url,
        tagged_users: item.taggedUsers || item.tagged_users,
        album_id: item.album_id,
        file_name: item.fileName || item.file_name,
        content_type: item.contentType || item.content_type,
        upload_timestamp: item.uploadTimestamp || item.upload_timestamp
      }))

      // Remove camelCase fields
      normalizedItems.forEach((item: any) => {
        delete item.thumbnailUrl
        delete item.taggedUsers

        delete item.fileName
        delete item.contentType
        delete item.uploadTimestamp
      })

      items.push(...normalizedItems)
    }
    return items
  }, [])

  // Sort by created_at in descending order (newest first)
  return allItems.sort((a, b) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })
}
