"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import type { Comment } from "@/lib/types"

interface CommentSectionProps {
  comments: Comment[]
  album_id: string
}

export function CommentSection({ comments: initialComments, album_id }: CommentSectionProps) {
  const { toast } = useToast()
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [newComment, setNewComment] = useState("")

  const handleAddComment = () => {
    if (!newComment.trim()) return

    const comment: Comment = {
      id: `comment-${Date.now()}`,
      author: "Current User",
      content: newComment,
      created_at: new Date().toISOString(),
      user_id: "1",
      profile_image: "/placeholder-user.jpg"
    }

    setComments([...comments, comment])
    setNewComment("")

    toast({
      title: "Comment added",
      description: "Your comment has been posted.",
    })
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-4">
            <Avatar className="w-10 h-10">
              <AvatarImage src={comment.profile_image || "/placeholder.svg"} alt={comment.author} />
              <AvatarFallback>{comment.author.substring(0, 2)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-gray-900">{comment.author}</span>
                <span className="text-xs text-gray-500">{new Date(comment.created_at).toLocaleDateString()}</span>
              </div>
              <p className="text-gray-700">{comment.content}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Add a comment</h3>
        <div className="flex gap-4">
          <Avatar className="w-10 h-10">
            <AvatarImage src="/placeholder-user.jpg" alt="Current User" />
            <AvatarFallback>CU</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <Textarea
              placeholder="Share your thoughts about this album..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[100px]"
            />
            <div className="flex justify-end">
              <Button onClick={handleAddComment} className="bg-gray-800 hover:bg-gray-700">
                Post Comment
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
