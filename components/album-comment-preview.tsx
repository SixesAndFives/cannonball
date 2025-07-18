'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
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

interface AlbumCommentPreviewProps {
  albumId: string
  albumTitle: string
  coverImage: string
  comments: CommentWithAlbum[]
}

export function AlbumCommentPreview({ albumId, albumTitle, coverImage, comments }: AlbumCommentPreviewProps) {
  // Sort comments by timestamp, oldest first
  const sortedComments = [...comments].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  )

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="flex gap-6 p-4 border-b border-gray-200">
        <div className="flex-shrink-0">
          <Link href={`/albums/${albumId}`}>
            <Image
              src={coverImage}
              alt={albumTitle}
              width={60}
              height={60}
              className="rounded-lg"
            />
          </Link>
        </div>
        <div className="flex-1 min-w-0">
          <div className="sm:flex sm:items-center sm:justify-between sm:gap-4 mb-2">
            <div className="space-y-2">
              <Link href={`/albums/${albumId}`} className="hover:underline">
                <h3 className="text-lg font-semibold text-gray-900 truncate">{albumTitle}</h3>
              </Link>
              <div className="sm:hidden">
                <Button asChild variant="outline" size="sm" className="w-auto">
                  <Link href={`/albums/${albumId}?tab=comments#comment-form`}>
                    Reply
                  </Link>
                </Button>
              </div>
              <p className="text-sm text-gray-500">{comments.length} comments</p>
            </div>
            <div className="hidden sm:block">
              <Button asChild variant="outline" size="sm">
                <Link href={`/albums/${albumId}?tab=comments#comment-form`}>
                  Reply
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {sortedComments.slice(0, 3).map((comment) => (
          <div key={comment.id} className="p-4">
            <div className="flex items-start gap-3 mb-2">
              {comment.profileImage && (
                <Image
                  src={comment.profileImage}
                  alt={comment.author}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 text-sm">
                  <span className="font-medium text-gray-900">{comment.author}</span>
                  <span className="text-gray-500">
                    {formatDistanceToNow(new Date(comment.timestamp), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-gray-700 line-clamp-2 text-sm">{comment.content}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {comments.length > 3 && (
        <div className="p-4 bg-gray-50 text-center">
          <Button asChild variant="link">
            <Link href={`/albums/${albumId}?tab=comments`}>
              View all {comments.length} comments
            </Link>
          </Button>
        </div>
      )}
    </div>
  )
}
