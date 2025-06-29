// app/albums/[id]/page.tsx
import { Metadata, Viewport } from 'next'
import { getAlbumById } from "@/lib/album-service"
import { getAllUsers } from "@/lib/users-service"
import { AlbumDetailClient } from "@/app/albums/[id]/client"
import { getCurrentUser } from "@/lib/auth-service"
import type { Album, User } from "@/lib/types"

export const viewport: Viewport = {
  themeColor: '#ffffff'
}

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params
  const album = await getAlbumById(id)
  
  return {
    title: album?.title || 'Album Details',
    description: `Details for album ${album?.title || ''}`,
  }
}

type UserWithoutPassword = Omit<User, 'password'>;

export default async function AlbumDetailPage(
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  console.log('=== Album Detail Page Request ===', {
    time: new Date().toISOString(),
    albumId: id,
    environment: typeof window === 'undefined' ? 'server-side' : 'client-side',
    nodeEnv: process.env.NODE_ENV,
    stage: 'start'
  })

  const [album, users, current_user] = await Promise.all([
    getAlbumById(id).then(album => {
      console.log('=== Album Detail Fetch ===', {
        time: new Date().toISOString(),
        albumId: id,
        success: !!album,
        albumTitle: album?.title
      })
      return album
    }),
    getAllUsers().then(users => {
      console.log('=== Users Fetch for Album Detail ===', {
        time: new Date().toISOString(),
        userCount: users?.length ?? 0
      })
      return users
    }),
    getCurrentUser().then(user => {
      console.log('=== Current User Fetch for Album Detail ===', {
        time: new Date().toISOString(),
        success: !!user,
        userId: user?.id
      })
      return user
    })
  ])
  return <AlbumDetailClient initial_album={album} users={users as UserWithoutPassword[]} current_user={current_user as UserWithoutPassword | null} />
}
