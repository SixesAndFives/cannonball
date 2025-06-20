'use client'

import type { Album } from "./types"

export async function updateAlbum(id: string, updatedAlbum: Album): Promise<boolean> {
  try {
    const response = await fetch(`/api/albums/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedAlbum),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to update album')
    }

    await response.json()
    return true
  } catch (error) {
    console.error("Error updating album:", error)
    return false
  }
}

export async function getAlbumById(id: string): Promise<Album | null> {
  try {
    const response = await fetch(`/api/albums/${id}`)
    if (!response.ok) {
      throw new Error('Failed to fetch album')
    }
    return await response.json()
  } catch (error) {
    console.error("Error fetching album:", error)
    return null
  }
}
