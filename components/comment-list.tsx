'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/auth-context'
import { addComment, deleteComment } from '@/lib/comment-client'
import type { Comment } from '@/lib/types'

interface CommentListProps {
  albumId: string
  comments: Comment[]
  onCommentAdded: (comment: Comment) => void
  onCommentDeleted: (commentId: string) => void
}

export function CommentList({ albumId, comments, onCommentAdded, onCommentDeleted }: CommentListProps) {
  const { toast } = useToast()
  const { user } = useAuth()
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !content.trim()) {
      toast({
        title: "Error",
        description: user ? "Please enter a comment." : "You must be logged in to comment.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    const newComment = await addComment(albumId, user.fullName, content, user.id, user.profileImage)
    setIsSubmitting(false)

    if (newComment) {
      onCommentAdded(newComment)
      setContent('')
      toast({
        title: "Comment added",
        description: "Your comment has been posted successfully.",
      })
    } else {
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (commentId: string) => {
    const success = await deleteComment(albumId, commentId)
    if (success) {
      onCommentDeleted(commentId)
      toast({
        title: "Comment deleted",
        description: "The comment has been removed.",
      })
    } else {
      toast({
        title: "Error",
        description: "Failed to delete comment. Please try again.",
        variant: "destructive",
      })
    }
  }

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-6">
      {/* Comment List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-gray-500 italic">No comments yet. Be the first to comment!</p>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-white p-4 rounded-lg border border-gray-200 space-y-2"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-3">
                  {comment.profile_image && (
                    <Image
                      src={comment.profile_image}
                      alt={comment.author}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  )}
                  <div>
                    <h4 className="font-medium text-gray-900">{comment.author}</h4>
                    <p className="text-sm text-gray-500">{formatDate(comment.created_at)}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(comment.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  Delete
                </Button>
              </div>
              <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
            </div>
          ))
        )}
      </div>

      {/* Add Comment Form */}
      {user ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-start gap-3">
            {user.profileImage && (
              <Image
                src={user.profileImage}
                alt={user.fullName}
                width={40}
                height={40}
                className="rounded-full"
              />
            )}
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 mb-2">{user.fullName}</p>
              <Textarea
                placeholder="Write a comment..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Posting...' : 'Post Comment'}
            </Button>
          </div>
        </form>
      ) : (
        <p className="text-gray-500 italic">Please log in to post comments.</p>
      )}
    </div>
  )
}
