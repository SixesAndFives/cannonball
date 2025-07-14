'use client'

import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Image from 'next/image'
import { useState } from 'react'
import { RecentComments } from '@/components/dashboard/recent-comments'
import { RecentAlbums } from '@/components/dashboard/recent-albums'
import { RecentGallery } from '@/components/dashboard/recent-gallery'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

export function DashboardClient() {
  const { user } = useAuth()
  const [isUploading, setIsUploading] = useState(false)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    try {
      setIsUploading(true)
      const formData = new FormData()
      formData.append('file', file)
      formData.append('userId', user.id)

      const response = await fetch('/api/upload-profile-image', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to upload image')
      }

      // Force a page refresh to show the new image
      window.location.reload()
    } catch (error) {
      console.error('Error uploading image:', error)
    } finally {
      setIsUploading(false)
    }
  }

  if (!user) return null

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="relative w-32 h-32">
              <Image
                src={user.profile_image || '/images/default-avatar.png'}
                alt={user.full_name}
                fill
                className="object-cover rounded-full"
              />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">{user.full_name}</h2>
              <p className="text-gray-600 mb-4">@{user.user_name}</p>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>Edit Profile Picture</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Update Profile Picture</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isUploading}
                    />
                    {isUploading && <p className="text-sm text-gray-600">Uploading...</p>}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Albums</CardTitle>
        </CardHeader>
        <CardContent>
          <RecentAlbums />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Gallery Uploads</CardTitle>
        </CardHeader>
        <CardContent>
          <RecentGallery />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Comments</CardTitle>
        </CardHeader>
        <CardContent>
          <RecentComments />
        </CardContent>
      </Card>
    </div>
  )
}
