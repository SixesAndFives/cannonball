'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Album } from '@/lib/types'

export default function AlbumEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [album, setAlbum] = useState<Album | null>(null)
  const [title, setTitle] = useState('')
  const [year, setYear] = useState('')
  const [cover_image, setCoverImage] = useState<File | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  // Fetch album data
  useEffect(() => {
    fetch(`/api/albums/${id}`)
      .then(res => res.json())
      .then(data => {
        setAlbum(data)
        setTitle(data.title)
        setYear(data.year || '')
      })
      .catch(error => {
        console.error('Failed to fetch album:', error)
        toast.error('Failed to load album')
      })
  }, [id])

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
    if (!album) return

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

      // Create form data for file upload
      const formData = new FormData()
      if (updates.title) formData.append('title', updates.title)
      if (updates.year) formData.append('year', updates.year)
      if (updates.cover_image) formData.append('cover_image', updates.cover_image)

      const response = await fetch(`/api/albums/${id}`, {
        method: 'PATCH',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Failed to update album')
      }

      toast.success('Album updated successfully')
      router.push(`/albums/${id}`)
    } catch (error) {
      console.error('Failed to save album:', error)
      toast.error('Failed to update album')
    } finally {
      setIsSaving(false)
    }
  }

  if (!album) {
    return <div>Loading...</div>
  }

  return (
    <div className="container max-w-2xl mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Edit Album</h1>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          Cancel
        </button>
      </div>

      <div className="space-y-6">
        <div>
          <Label htmlFor="cover">Album Cover</Label>
          <div className="mt-2 space-y-4">
            <div className="relative w-48 h-48">
              <Image
                src={previewUrl || album.cover_image || '/images/playlists/EmptyCover.png'}
                alt={album.title}
                className="object-cover rounded-lg"
                fill
                sizes="192px"
              />
            </div>
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
          />
        </div>

        <div className="flex justify-end pt-4 border-t">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 text-white bg-primary rounded-md hover:bg-primary/90 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
