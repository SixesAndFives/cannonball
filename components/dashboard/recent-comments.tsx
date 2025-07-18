'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { getRecentComments } from '@/lib/services/dashboard-service'
import { formatDistanceToNow } from 'date-fns'

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

export function RecentComments() {
  const [comments, setComments] = useState<CommentWithAlbum[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadComments() {
      const recentComments = await getRecentComments(10)
      setComments(recentComments)
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

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <div key={comment.id} className="flex gap-4 p-4 bg-white rounded-lg shadow-sm">
          <div className="flex-shrink-0">
            <Link href={`/albums/${comment.album.id}`}>
              <Image
                src={comment.album.cover_image || '/images/default-album.png'}
                alt={comment.album.title}
                width={48}
                height={48}
                className="rounded-md object-cover"
              />
            </Link>
          </div>
          <div className="flex-grow min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2 min-w-0">
                <div className="flex items-center gap-2">
                  <div className="relative w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
                    <Image
                      src={comment.profileImage || '/images/default-avatar.png'}
                      alt={comment.author}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <span className="font-medium truncate">{comment.author}</span>
                </div>
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-gray-400 text-sm whitespace-nowrap">
                    commented on
                  </span>
                  <Link 
                    href={`/albums/${comment.album.id}`}
                    className="text-blue-600 hover:text-blue-800 truncate"
                  >
                    {comment.album.title}
                  </Link>
                </div>
              </div>
              <span className="text-gray-400 text-sm flex-shrink-0">
                {comment.timestamp ? 
                  formatDistanceToNow(new Date(comment.timestamp), { addSuffix: true })
                  : 'recently'
                }
              </span>
            </div>
            <p className="text-gray-600 mt-1 line-clamp-2">{comment.content}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
