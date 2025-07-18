'use client'

import { useState, useEffect } from 'react'
import { getRecentComments } from '@/lib/services/dashboard-service'
import { AlbumCommentPreview } from '@/components/album-comment-preview'
import type { Comment } from '@/lib/types'

interface CommentWithAlbum {
  id: string
  author: string
  content: string
  userId?: string
  profileImage?: string
  timestamp: string
  album: {
    id: string
    title: string
    cover_image: string
  }
}

interface AlbumWithComments {
  id: string
  title: string
  cover_image: string
  comments: CommentWithAlbum[]
}

export function CommentsClient() {
  const [comments, setComments] = useState<CommentWithAlbum[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadComments() {
      const allComments = await getRecentComments()
      setComments(allComments)
      setLoading(false)
    }
    loadComments()
  }, [])

  if (loading) {
    return <div className="text-gray-500">Loading comments...</div>
  }

  if (comments.length === 0) {
    return <div className="text-gray-500">No comments yet</div>
  }

  // Group comments by album
  const albumsMap = comments.reduce<Record<string, AlbumWithComments>>((acc, comment) => {
    const { album } = comment
    if (!acc[album.id]) {
      acc[album.id] = {
        id: album.id,
        title: album.title,
        cover_image: album.cover_image,
        comments: []
      }
    }
    acc[album.id].comments.push(comment)
    return acc
  }, {})

  // Convert to array and sort by most recent comment
  const albums = Object.values(albumsMap).sort((a, b) => {
    const aLatest = Math.max(...a.comments.map(c => new Date(c.timestamp).getTime()))
    const bLatest = Math.max(...b.comments.map(c => new Date(c.timestamp).getTime()))
    return bLatest - aLatest
  })

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 pt-8">
      <h1 className="text-2xl font-semibold text-gray-900">What We Are Talking About</h1>
      <div className="space-y-6">
        {albums.map((album) => (
          <AlbumCommentPreview
            key={album.id}
            albumId={album.id}
            albumTitle={album.title}
            coverImage={album.cover_image}
            comments={album.comments}
          />
        ))}
      </div>
    </div>
  )
}
