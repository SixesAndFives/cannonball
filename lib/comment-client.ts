import type { Comment } from "./types"

export async function addComment(album_id: string, author: string, content: string, user_id: string, profile_image?: string): Promise<Comment | null> {
  try {
    const response = await fetch(`/api/albums/${album_id}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ author, content, user_id, profile_image }),
    })

    if (!response.ok) {
      throw new Error('Failed to add comment')
    }

    return await response.json()
  } catch (error) {
    console.error("Error adding comment:", error)
    return null
  }
}

export async function deleteComment(album_id: string, commentId: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/albums/${album_id}/comments/${commentId}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      throw new Error('Failed to delete comment')
    }

    const data = await response.json()
    return data.success
  } catch (error) {
    console.error("Error deleting comment:", error)
    return false
  }
}
