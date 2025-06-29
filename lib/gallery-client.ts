'use client'

import type { GalleryItem } from './types'

export async function getAllGalleryItems(): Promise<GalleryItem[]> {
  try {
    const response = await fetch('/api/gallery')
    if (!response.ok) {
      throw new Error('Failed to fetch gallery items')
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching gallery items:', error)
    return []
  }
}

export async function getAlbumGallery(albumId: string): Promise<GalleryItem[]> {
  try {
    const response = await fetch(`/api/albums/${albumId}/gallery`)
    if (!response.ok) {
      throw new Error('Failed to fetch gallery')
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching gallery:', error)
    return []
  }
}

interface UploadGalleryItemParams {
  file: File
  thumbnailFile?: File
  title?: string
  caption?: string
  tagged_users?: string[]
  uploaded_by: string
  album_id: string
  onProgress?: (progress: number) => void
}

export async function uploadGalleryItem({
  file,
  thumbnailFile,
  title,
  caption = '',
  tagged_users = [],
  uploaded_by,
  album_id,
  onProgress
}: UploadGalleryItemParams): Promise<GalleryItem | null> {
  try {
    const formData = new FormData()
    formData.append('file', file)
    if (thumbnailFile) formData.append('thumbnail', thumbnailFile)
    if (title) formData.append('title', title)
    formData.append('caption', caption)
    formData.append('tagged_users', JSON.stringify(tagged_users))
    formData.append('uploaded_by', uploaded_by)

    const xhr = new XMLHttpRequest()
    const promise = new Promise<GalleryItem | null>((resolve, reject) => {
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = (event.loaded / event.total) * 100
          onProgress(progress)
        }
      })

      xhr.addEventListener('load', async () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const data = JSON.parse(xhr.responseText)
          resolve(data)
        } else {
          reject(new Error('Upload failed'))
        }
      })

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'))
      })
    })

    xhr.open('POST', `/api/albums/${album_id}/gallery`)
    xhr.send(formData)

    return await promise
  } catch (error) {
    console.error('Error uploading gallery item:', error)
    return null
  }
}

export async function deleteGalleryItem(
  album_id: string,
  itemId: string,
  fileUrl: string
): Promise<boolean> {
  try {
    const response = await fetch(`/api/albums/${album_id}/gallery/${itemId}`, {
      method: 'DELETE',
      headers: {
        'x-file-url': fileUrl
      }
    })

    if (!response.ok) {
      throw new Error('Failed to delete gallery item')
    }

    const { success } = await response.json()
    return success
  } catch (error) {
    console.error('Error deleting gallery item:', error)
    return false
  }
}

interface UpdateGalleryItemParams {
  title?: string
  caption?: string
  tagged_users?: string[]
}

export async function updateGalleryItem(
  albumId: string,
  itemId: string,
  updates: UpdateGalleryItemParams
): Promise<GalleryItem | null> {
  try {
    const response = await fetch(`/api/albums/${albumId}/gallery/${itemId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    })

    if (!response.ok) {
      throw new Error('Failed to update gallery item')
    }

    return await response.json()
  } catch (error) {
    console.error('Error updating gallery item:', error)
    return null
  }
}
