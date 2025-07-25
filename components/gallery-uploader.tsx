'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import { useDropzone } from 'react-dropzone'
import { Upload, X, Image as ImageIcon, Film } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/hooks/use-toast'
import { uploadGalleryItem } from '@/lib/gallery-client'
import { generateVideoThumbnail, dataURLtoFile } from '@/lib/thumbnail-utils'
import type { User } from '@/lib/types'

interface GalleryUploaderProps {
  album_id: string
  users: Omit<User, 'password'>[]
  userId: string
  onSuccess?: () => void
}

export function GalleryUploader({ album_id, users, userId, onSuccess }: GalleryUploaderProps) {
  const { toast } = useToast()
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>('')
  const [isVideo, setIsVideo] = useState(false)
  const [caption, setCaption] = useState('')
  const [taggedUsers, setTaggedUsers] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      setFile(file)
      setIsVideo(file.type.startsWith('video/'))
      
      // Create preview URL
      const url = URL.createObjectURL(file)
      setPreview(url)
      
      // Clean up preview URL when component unmounts
      return () => URL.revokeObjectURL(url)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
      'video/*': ['.mp4', '.webm', '.ogg', '.mov', '.quicktime']
    },
    maxFiles: 1,
    multiple: false
  })

  const handleSubmit = async () => {
    if (!file) {
      toast({
        title: "Missing information",
        description: "Please select a file to upload",
        variant: "destructive"
      })
      return
    }

    setIsUploading(true)
    try {
      let thumbnailFile: File | undefined;
      
      // Generate thumbnail for videos
      if (file.type.startsWith('video/')) {
        try {
          const thumbnailDataUrl = await generateVideoThumbnail(file);
          thumbnailFile = dataURLtoFile(
            thumbnailDataUrl,
            `${file.name.split('.')[0]}_thumb.jpg`
          );
        } catch (error) {
          console.error('Failed to generate thumbnail:', error);
          // Continue without thumbnail if generation fails
        }
      }

      const result = await uploadGalleryItem({
        file,
        thumbnailFile,
        caption: caption.trim(),
        tagged_users: taggedUsers,
        uploaded_by: userId,
        album_id
      })

      if (!result) {
        throw new Error('Upload failed')
      }

      toast({
        title: "Success",
        description: "File uploaded successfully"
      })

      // Reset form
      setFile(null)
      setPreview('')
      setCaption('')
      setTaggedUsers([])
      onSuccess?.()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload file. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleCancel = () => {
    setFile(null)
    setPreview('')
    setCaption('')
    setTaggedUsers([])
  }

  return (
    <div className="space-y-6">
      {!file ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary'}`}
        >
          <input {...getInputProps()} />
          <Upload className="w-8 h-8 mx-auto mb-4 text-gray-400" />
          <p className="text-sm text-gray-600">
            {isDragActive
              ? "Drop the file here"
              : "Drag and drop an image or video, or click to select"}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Supports: PNG, JPG, GIF, MP4, WebM, OGG
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-gray-100">
            {isVideo ? (
              <video
                src={preview}
                controls
                className="h-full w-full object-contain"
              />
            ) : (
              <Image
                src={preview}
                alt="Preview"
                fill
                className="object-contain"
              />
            )}
          </div>

          <div className="space-y-4">

            <div>
              <label htmlFor="caption" className="block text-sm font-medium text-gray-700 mb-1">
                Caption
              </label>
              <Textarea
                id="caption"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Add a caption"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tag People
              </label>
              <div className="grid grid-cols-2 gap-4">
                {users.map(user => (
                  <div
                    key={user.id}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50"
                  >
                    <Checkbox
                      id={`user-${user.id}`}
                      checked={taggedUsers.includes(user.id)}
                      onCheckedChange={(checked) => {
                        setTaggedUsers(prev =>
                          checked
                            ? [...prev, user.id]
                            : prev.filter(id => id !== user.id)
                        )
                      }}
                    />
                    <label
                      htmlFor={`user-${user.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {user.full_name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSubmit}
              disabled={isUploading}
              className="flex-1"
            >
              {isUploading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
                  <span>Uploading...</span>
                </div>
              ) : "Upload"}
            </Button>
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isUploading}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
