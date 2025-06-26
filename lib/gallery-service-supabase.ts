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
  
  // Normalize gallery items to ensure snake_case
  const normalizedGallery = (album?.gallery || []).map((item: any) => ({
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
  itemId: string,
  updates: { caption?: string; taggedUsers?: string[] }
): Promise<GalleryItem | null> {
  try {
    console.log('Service: Updating gallery item:', itemId);
    console.log('Service: Updates:', updates);
    
    // Convert camelCase to snake_case and filter out undefined values
    const normalizedUpdates: Partial<Pick<GalleryItem, 'caption' | 'tagged_users'>> = {};
    if (updates.caption !== undefined) normalizedUpdates.caption = updates.caption;
    if (updates.taggedUsers !== undefined) normalizedUpdates.tagged_users = updates.taggedUsers;

    // First find which album contains this gallery item
    const { data: albums, error: getError } = await supabase
      .from('albums')
      .select('id, gallery')
      .not('gallery', 'is', null)

    if (getError) {
      console.error('Service: Error fetching albums:', getError);
      throw getError;
    }

    console.log('Service: Found', albums?.length, 'albums with gallery items');
    if (!albums?.length) return null;

    // Find the album containing this item
    const album = albums.find(a => 
      a.gallery?.some((item: GalleryItem) => {
        console.log('Service: Comparing item:', item.id, 'with', itemId);
        return item.id === itemId;
      })
    );

    console.log('Service: Found album:', album?.id);
    if (!album) return null;

    // Normalize and update the gallery items
    const updatedGallery = album.gallery.map((item: any) => {
      const normalizedItem = {
        id: item.id,
        album_id: item.albumId || item.album_id,
        type: item.type,
        url: item.url,
        thumbnail_url: item.thumbnailUrl || item.thumbnail_url,
        title: item.title,
        caption: item.caption,
        tagged_users: item.tagged_users || item.taggedUsers || [],
        uploaded_by: item.uploadedBy || item.uploaded_by,
        created_at: item.createdAt || item.created_at,
        file_name: item.fileName || item.file_name,
        content_type: item.contentType || item.content_type
      };

      if (item.id === itemId) {
        console.log('Service: Updating item:', item.id);
        if (normalizedUpdates.caption !== undefined) {
          normalizedItem.caption = normalizedUpdates.caption;
        }
        if (normalizedUpdates.tagged_users !== undefined) {
          normalizedItem.tagged_users = normalizedUpdates.tagged_users;
        }
      }

      return normalizedItem;
    });

    // Update the gallery in Supabase
    const { error: updateError } = await supabase
      .from('albums')
      .update({
        gallery: updatedGallery.map(item => ({
          ...item,
          // Remove any camelCase duplicates
          albumId: undefined,
          thumbnailUrl: undefined,
          taggedUsers: undefined,
          uploadedBy: undefined,
          createdAt: undefined,
          fileName: undefined,
          contentType: undefined
        }))
      })
      .eq('id', album.id);

    if (updateError) {
      console.error('Service: Error updating gallery:', updateError);
      throw updateError;
    }

    // Return the updated item with consistent snake_case
    const updatedItem = updatedGallery.find((item: GalleryItem) => item.id === itemId);
    if (!updatedItem) return null;

    // Ensure response uses snake_case
    const normalizedItem = {
      id: updatedItem.id,
      album_id: updatedItem.albumId || updatedItem.album_id,
      type: updatedItem.type,
      url: updatedItem.url,
      thumbnail_url: updatedItem.thumbnailUrl || updatedItem.thumbnail_url,
      title: updatedItem.title,
      caption: updatedItem.caption,
      tagged_users: updatedItem.tagged_users,
      uploaded_by: updatedItem.uploaded_by,
      created_at: updatedItem.created_at,
      file_name: updatedItem.fileName || updatedItem.file_name,
      content_type: updatedItem.contentType || updatedItem.content_type
    };

    console.log('Service: Updated item:', normalizedItem);
    return normalizedItem
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
