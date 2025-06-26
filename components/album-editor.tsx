'use client'

import { useState } from 'react'
import { Drawer } from './drawer'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { toast } from 'sonner'
import type { Album } from '@/lib/types'

interface AlbumEditorProps {
  album: Album
  isOpen: boolean
  onClose: () => void
  onSave: (updates: { title?: string; cover_image?: File; year?: string }) => Promise<void>
}

export function AlbumEditor({ album, isOpen, onClose, onSave }: AlbumEditorProps) {
  const [title, setTitle] = useState(album.title)
  const [year, setYear] = useState(album.year || '')
  const [cover_image, setCoverImage] = useState<File | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setCoverImage(file)
      // Create preview URL
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      const updates: { title?: string; cover_image?: File; year?: string } = {}
      
      if (title !== album.title) updates.title = title
      if (year !== album.year) updates.year = year
      if (cover_image) updates.cover_image = cover_image

      if (Object.keys(updates).length === 0) {
        toast.info('No changes to save')
        return
      }

      await onSave(updates)
      toast.success('Album updated successfully')
      onClose()
    } catch (error) {
      console.error('Failed to save album:', error)
      toast.error('Failed to update album')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Drawer title="Edit Album" isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6">Edit Album</h2>
        
        <div className="space-y-6">
          <div>
            <Label htmlFor="cover">Album Cover</Label>
            <div className="mt-2 space-y-4">
              <img
                src={previewUrl || album.cover_image || '/images/albums/EmptyCover.png'}
                alt={album.title}
                className="w-48 h-48 object-cover rounded-lg"
              />
              <Input
                id="cover"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="mt-2"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="title">Album Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="year">Year</Label>
            <Input
              id="year"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="mt-2"
              placeholder="YYYY"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>
    </Drawer>
  )
}
